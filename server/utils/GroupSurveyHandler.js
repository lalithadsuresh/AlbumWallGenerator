const axios = require('axios');
const User = require('../Models/userModel');
const Group = require('../Models/groupModel');

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

// Function to fetch top tracks for a user and get album covers
async function getTopTracks(accessToken) {
  const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      limit: 50,
    },
  });

  return response.data.items.map((track, index) => ({
    trackNumber: index + 1,
    trackName: track.name,
    artistName: track.artists[0].name,
    albumCover: track.album.images[0]?.url || null, 
    trackLink: track.external_urls.spotify,
  }));
}

class GroupSurveyHandler {

  async isTokenValid(user) {
    if (!user.tokenExpiry || !(user.tokenExpiry instanceof Date)) {
      console.error('Token expiry is missing or invalid for user', user._id);
      console.log('Token expiry value:', user.tokenExpiry);
      console.log('Token expiry type:', typeof user.tokenExpiry);
      return false;
    }
    return user.tokenExpiry.getTime() > Date.now(); // Convert Date to timestamp for comparison
  } 



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

  async getGroupAlbumWall(groupCode) {
    try {
      const group = await Group.findOne({ groupCode });
      if (!group) {
        throw new Error(`Group not found with code: ${groupCode}`);
      }
  
      const users = await User.find({ _id: { $in: group.members } });
      if (!users.length) {
        throw new Error('No users found in group');
      }
  
      // Process each user
      const albumPromises = users.map(async (user) => {
        try {
          // Refresh token if needed
          if (!await this.isTokenValid(user)) {
            console.log(`Refreshing token for user: ${user._id}`);
            const refreshedTokenData = await refreshUserToken(user);
            user.accessToken = refreshedTokenData.accessToken;
            user.tokenExpiry = new Date(refreshedTokenData.tokenExpiry);
            await User.findByIdAndUpdate(user._id, {
              accessToken: refreshedTokenData.accessToken,
              tokenExpiry: refreshedTokenData.tokenExpiry,
            });
          }
  
          // Fetch top tracks
          const tracks = await getTopTracks(user.accessToken);
          console.log(`Fetched tracks for user: ${user._id}`, tracks);
          return tracks;
        } catch (error) {
          console.error(`Error processing user ${user._id}:`, error.message);
          return []; // Skip this user if any error occurs
        }
      });
  
      // Await all promises
      const albumLists = await Promise.allSettled(albumPromises);
  
      // Flatten results and filter out null album covers
      const albums = albumLists
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value)
        .filter((album) => album.albumCover !== null);
  
      // Remove duplicate albums
      const uniqueAlbums = Array.from(
        new Map(albums.map((album) => [album.albumCover, album])).values()
      );
  
      return uniqueAlbums;
    } catch (error) {
      console.error('Error in getGroupAlbumWall:', error);
      throw error;
    }
  }
  
  

  async createAlbumCoverWall(groupCode) {
    try {
      const albums = await this.getGroupAlbumWall(groupCode);
      return albums.map(album => ({
        trackName: album.trackName,
        artistName: album.artistName,
        albumCover: album.albumCover
      }));
    } catch (error) {
      console.error('Error creating album cover wall:', error);
      throw error;
    }
  }
}


module.exports = GroupSurveyHandler;
