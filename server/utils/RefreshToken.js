const axios = require('axios');
const querystring = require('querystring');
const User = require('../Models/userModel');
require('dotenv').config();

const refreshTokenMiddleware = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken, tokenExpiry } = user;

    if (Date.now() < tokenExpiry) {
      req.accessToken = accessToken;
      return next();
    }

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, expires_in } = response.data;

    user.accessToken = access_token;
    user.tokenExpiry = Date.now() + expires_in * 1000;
    await user.save();

    req.accessToken = access_token;
    next();
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
};

module.exports = refreshTokenMiddleware;