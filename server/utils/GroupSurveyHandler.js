const axios = require('axios');
const User = require('../Models/userModel');
const Group = require('../Models/groupModel');

// Utility function to check token validity
function isTokenValid(user) {
  if (!user.tokenExpiry || !(user.tokenExpiry instanceof Date)) {
    console.error('Token expiry is missing or invalid for user', user._id);
    console.log('Token expiry value:', user.tokenExpiry);
    console.log('Token expiry type:', typeof user.tokenExpiry);
    return false;
  }
  return user.tokenExpiry.getTime() > Date.now(); // Convert Date to timestamp for comparison
} 
// Utility function to handle token refresh
async function refreshUserToken(user) {
  if (!user?.refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!response.data?.access_token) {
      throw new Error('No access token in refresh response');
    }

    return {
      accessToken: response.data.access_token,
      tokenExpiry: Date.now() + (response.data.expires_in * 1000)
    };
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    throw new Error(`Failed to refresh token: ${error.message}`);
  }
}

class GroupSurveyHandler {
  async checkGroupCompletion(groupCode) {
    try {
      const group = await Group.findOne({ groupCode });
      if (!group) {
        throw new Error(`Group not found with code: ${groupCode}`);
      }

      const submittedUsers = await User.find({ 
        'surveys.groupCode': groupCode,
        _id: { $in: group.members }
      });

      return {
        complete: submittedUsers.length === group.members.length,
        totalMembers: group.members.length,
        submittedCount: submittedUsers.length,
        remainingMembers: group.members.length - submittedUsers.length
      };
    } catch (error) {
      console.error('Error in checkGroupCompletion:', error);
      throw error;
    }
  }

  async calculateGroupMoodScores(groupCode) {
    try {
      const group = await Group.findOne({ groupCode });
      if (!group) {
        throw new Error(`Group not found with code: ${groupCode}`);
      }

      const users = await User.find({ 
        'surveys.groupCode': groupCode,
        _id: { $in: group.members }
      });

      if (!users.length) {
        throw new Error('No surveys found for this group');
      }

      const groupSurveys = users.flatMap(user =>
        user.surveys
          .filter(s => s.groupCode === groupCode)
          .map(s => s.answers)
      );

      const moodCategories = ['chill', 'energetic', 'relaxed', 'happy', 'focused'];
      const moodTotals = Object.fromEntries(moodCategories.map(mood => [mood, 0]));

      groupSurveys.forEach(survey => {
        moodCategories.forEach(mood => {
          moodTotals[mood] += Number(survey[mood]) || 0;
        });
      });

      const averages = Object.fromEntries(
        Object.entries(moodTotals).map(([mood, total]) => [
          mood,
          Number((total / groupSurveys.length).toFixed(2))
        ])
      );

      return { 
        averages, 
        totalResponses: groupSurveys.length,
        individualScores: groupSurveys 
      };
    } catch (error) {
      console.error('Error in calculateGroupMoodScores:', error);
      throw error;
    }
  }

  generateSpotifyParameters(moodAverages) {
    if (!moodAverages || typeof moodAverages !== 'object') {
      throw new Error('Invalid mood averages provided');
    }

    const moods = {
      energetic: moodAverages.energetic || 0,
      happy: moodAverages.happy || 0,
      relaxed: moodAverages.relaxed || 0,
      chill: moodAverages.chill || 0,
      focused: moodAverages.focused || 0
    };

    const normalizeValue = (value) => Math.max(0, Math.min(1, value));

    const params = {
      target_energy: normalizeValue((moods.energetic * 0.7 + moods.happy * 0.3) / 5),
      target_valence: normalizeValue((moods.happy * 0.6 + moods.relaxed * 0.4) / 5),
      target_acousticness: normalizeValue((moods.chill * 0.7 + moods.relaxed * 0.3) / 5),
      target_instrumentalness: normalizeValue(moods.focused / 5),
      min_tempo: 60 + moods.energetic * 20,
      max_tempo: 90 + moods.energetic * 30,
      limit: 20,
      min_popularity: 20
    };

    if (moods.chill > 4) params.max_energy = 0.6;
    if (moods.focused > 4) params.max_speechiness = 0.3;

    return params;
  }

  async getUserTopTracks(user) {
    if (!user?._id) {
      throw new Error('Invalid user object provided');
    }

    if (!user.accessToken || !user.refreshToken) {
      throw new Error(`User ${user._id} missing Spotify tokens`);
    }

    try {
      let currentToken = user.accessToken;

      if (!isTokenValid(user)) {
        try {
          const refreshedTokenData = await refreshUserToken(user);
          currentToken = refreshedTokenData.accessToken;

          await User.findByIdAndUpdate(user._id, {
            accessToken: refreshedTokenData.accessToken,
            tokenExpiry: refreshedTokenData.tokenExpiry
          });

          // Update the user object in memory
          user.accessToken = refreshedTokenData.accessToken;
          user.tokenExpiry = refreshedTokenData.tokenExpiry;
        } catch (refreshError) {
          console.error(`Token refresh failed for user ${user._id}:`, refreshError);
          throw new Error('Failed to refresh Spotify access token');
        }
      }

      const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: { Authorization: `Bearer ${currentToken}` },
        params: { limit: 50, time_range: 'medium_term' }
      });


      if (!response?.data?.items?.length) {
        console.warn(`No top tracks found for user ${user._id}`);
        return [];
      }

      const topTracks = response.data.items;

      const trackIds = topTracks.map(track => track.id).join(',');

      const batchSize = 100;
      const trackIdBatches = [];
      for (let i = 0; i < topTracks.length; i += batchSize) {
        trackIdBatches.push(topTracks.slice(i, i + batchSize).map(track => track.id));
      }

      const audioFeaturesResponses = await Promise.all(
        trackIdBatches.map(async (batch) => {
          try {
            const response = await axios.get('https://api.spotify.com/v1/audio-features', {
              headers: { Authorization: `Bearer ${currentToken}` },
              params: { ids: batch.join(',') }
            });
            return response.data.audio_features || [];
          } catch (error) {
            console.error(`Error fetching audio features for batch:`, error.message);
            return [];
          }
        })
      );

      const audioFeatures = audioFeaturesResponses.flat();

      // Combine tracks with their audio features
      const combinedTracks = topTracks.map(track => {
        const features = audioFeatures.find(feature => feature?.id === track.id);
        return {
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => artist.name),
          uri: track.uri,
          popularity: track.popularity,
          danceability: features?.danceability || null,
          energy: features?.energy || null,
          valence: features?.valence || null,
          tempo: features?.tempo || null,
          acousticness: features?.acousticness || null,
          instrumentalness: features?.instrumentalness || null
        };
      });

      return combinedTracks;

      // you need to request another endpoint to analyze
      // track's danceability, valence etc., not here!

    } catch (error) {
      console.error(`Error getting top tracks for user ${user._id}:`, error);
      if (error.response?.status === 401) {
        throw new Error('Spotify authentication failed');
      }
      throw error;
    }
  }

  async getGroupRecommendedSongs(groupCode) {
    try {
      const group = await Group.findOne({ groupCode });
      if (!group) {
        throw new Error(`Group not found with code: ${groupCode}`);
      }

      const users = await User.find({ _id: { $in: group.members } });
      if (!users.length) {
        throw new Error('No users found in group');
      }

      const { averages } = await this.calculateGroupMoodScores(groupCode);
      const spotifyParams = this.generateSpotifyParameters(averages);
      console.log(spotifyParams);

      const userTracksPromises = users.map(user => this.getUserTopTracks(user))
      const userTracksList = await Promise.allSettled(userTracksPromises);

      console.log(userTracksList);

      const allTracks = userTracksList
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);

      console.log(allTracks);

      if (!allTracks.length) {
        throw new Error('No tracks found for any users in the group');
      }

      const uniqueTracks = Array.from(
        new Map(allTracks.map(track => [track.id, track])).values()
      ).sort((a, b) => b.popularity - a.popularity);

      return uniqueTracks.slice(0, 20);

    } catch (error) {
      console.error('Error in getGroupRecommendedSongs:', error);
      throw error;
    }
  }

  async createGroupPlaylist(groupCode, user) {
    try {
      if (!user?.spotifyId) {
        throw new Error('Invalid user object or missing Spotify ID');
      }

      const recommendedSongs = await this.getGroupRecommendedSongs(groupCode);
      if (!recommendedSongs.length) {
        throw new Error('No recommended songs available');
      }

      const playlistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${user.spotifyId}/playlists`,
        {
          name: `Group ${groupCode} Playlist`,
          description: 'Generated based on group mood and preferences',
          public: false
        },
        { 
          headers: { Authorization: `Bearer ${user.accessToken}` }
        }
      );

      if (!playlistResponse?.data?.id) {
        throw new Error('Failed to create playlist');
      }

      const trackUris = recommendedSongs.map(song => song.uri);
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistResponse.data.id}/tracks`,
        { uris: trackUris },
        { 
          headers: { Authorization: `Bearer ${user.accessToken}` }
        }
      );

      return {
        playlistId: playlistResponse.data.id,
        playlistUrl: playlistResponse.data.external_urls.spotify,
        tracks: recommendedSongs,
        trackCount: trackUris.length
      };

    } catch (error) {
      console.error('Error in createGroupPlaylist:', error);
      throw error;
    }
  }
}

module.exports = GroupSurveyHandler;