const axios = require('axios');
const User = require('../Models/userModel');
const Group = require('../Models/groupModel');

class GroupSurveyHandler {
  // Check if all members have completed surveys
  async checkGroupCompletion(groupCode) {
    try {
      const group = await Group.findOne({ groupCode });
      if (!group) throw new Error('Group not found');

      const submittedUsers = await User.find({ 'surveys.groupCode': groupCode });

      return {
        complete: submittedUsers.length === group.members.length,
        totalMembers: group.members.length,
        submittedCount: submittedUsers.length,
      };
    } catch (error) {
      console.error('Error in checkGroupCompletion:', error);
      throw error;
    }
  }

  // Calculate averages for group surveys
// Calculate averages for group surveys
  async calculateGroupMoodScores(groupCode) {
    try {
      const users = await User.find({ 'surveys.groupCode': groupCode });
      if (!users.length) throw new Error('No surveys found for this group');

      const groupSurveys = users.flatMap((user) =>
        user.surveys.filter((s) => s.groupCode === groupCode).map((s) => s.answers)
      );

      const moodTotals = { chill: 0, energetic: 0, relaxed: 0, happy: 0, focused: 0 };
      groupSurveys.forEach((survey) =>
        Object.keys(moodTotals).forEach((key) => (moodTotals[key] += survey[key] || 0))
      );

      const averages = {};
      Object.keys(moodTotals).forEach(
        (key) => (averages[key] = Number((moodTotals[key] / groupSurveys.length).toFixed(2)))
      );

      // Log the calculated averages
      console.log(`Group averages for groupCode ${groupCode}:`, averages);

      return { averages, totalResponses: groupSurveys.length };
    } catch (error) {
      console.error('Error in calculateGroupMoodScores:', error);
      throw error;
    }
  }


  // Generate Spotify recommendation parameters
  generateSpotifyParameters(moodAverages) {
    const params = {
      target_energy: this.normalizeValue(
        (moodAverages.energetic * 0.7 + moodAverages.happy * 0.3) / 5
      ),
      target_valence: this.normalizeValue(
        (moodAverages.happy * 0.6 + moodAverages.relaxed * 0.4) / 5
      ),
      target_acousticness: this.normalizeValue(
        (moodAverages.chill * 0.7 + moodAverages.relaxed * 0.3) / 5
      ),
      target_instrumentalness: this.normalizeValue(moodAverages.focused / 5),
      min_tempo: 60 + moodAverages.energetic * 20,
      max_tempo: 90 + moodAverages.energetic * 30,
      limit: 20,
    };

    if (moodAverages.chill > 4) params.max_energy = 0.6;
    if (moodAverages.focused > 4) params.max_speechiness = 0.3;

    return params;
  }

  normalizeValue(value) {
    return Math.max(0, Math.min(1, value));
  }

  async getUserTopTracks(user) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        params: { limit: 50, time_range: 'medium_term' },
      });

      const trackIds = response.data.items.map((track) => track.id);
      const audioFeatures = await this.getAudioFeatures(user.accessToken, trackIds);

      return response.data.items.map((track, index) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        uri: track.uri,
        audioFeatures: audioFeatures[index],
      }));
    } catch (error) {
      console.error(`Error getting top tracks for user ${user._id}:`, error);
      return [];
    }
  }

  async getAudioFeatures(accessToken, trackIds) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/audio-features', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { ids: trackIds.join(',') },
      });
      return response.data.audio_features;
    } catch (error) {
      console.error('Error getting audio features:', error);
      throw error;
    }
  }

  async createGroupPlaylist(groupCode, user) {
    try {
      const recommendedSongs = await this.getGroupRecommendedSongs(groupCode);

      const playlistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${user.spotifyId}/playlists`,
        {
          name: `Group ${groupCode} Playlist`,
          description: 'Generated based on group mood and preferences',
          public: false,
        },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );

      const trackUris = recommendedSongs.map((song) => song.uri);
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistResponse.data.id}/tracks`,
        { uris: trackUris },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );

      return {
        playlistId: playlistResponse.data.id,
        playlistUrl: playlistResponse.data.external_urls.spotify,
        tracks: recommendedSongs,
      };
    } catch (error) {
      console.error('Error creating group playlist:', error);
      throw error;
    }
  }
}

module.exports = GroupSurveyHandler;
