const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const GroupSurveyHandler = require("../utils/GroupSurveyHandler");
const refreshTokenMiddleware = require("../utils/RefreshToken");
const authMiddleware = require("../utils/MiddlewareAuth");

// Environment Variables
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const jwtSecret = process.env.JWT_SECRET;

const reactBaseUrl = process.env.FRONTEND_URL;

// Route: Redirect to Spotify Login
router.get("/login", (req, res) => {
  const scope = [
    "user-read-private",
    "user-read-email",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-top-read",
  ].join(" "); // Space-separated string for Spotify scopes.

  const spotifyAuthUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
    });

  res.redirect(spotifyAuthUrl);
});

// Route: Delete Account
router.delete('/delete-account', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id; // Extracted from the token in authMiddleware
      const deletedUser = await User.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error.message);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });
  

// Route: Spotify Callback
router.get("/callback", async (req, res) => {
  const code = req.query.code; // Authorization code from query params

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: 'http://localhost:5000/api/users/callback',
        client_id: client_id,
        client_secret: client_secret,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Fetch Spotify user profile
    const userProfileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userProfile = userProfileResponse.data;

    // Find or create user in the database
    const user = await User.findOneAndUpdate(
      { spotifyId: userProfile.id }, // Match user by Spotify ID
      {
        spotifyId: userProfile.id,
        displayName: userProfile.display_name,
        accessToken: access_token,
        refreshToken: refresh_token,
        groupCode: `group_${Date.now()}`,
        tokenExpiry: Date.now() + expires_in * 1000,
      },
      { upsert: true, new: true }
    );

    // Generate JWT token
    const token = jwt.sign({ id: user._id.toString() }, jwtSecret, { expiresIn: "1h" });

    // Redirect to React frontend with token
    res.redirect(`${reactBaseUrl}/login?token=${token}`);
  } catch (error) {
    console.error("Error in callback:", error.message);
    res.status(500).json({ error: "Failed to process callback" });
  }
});

// Route: Refresh Token
router.post("/regenerate", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Missing refresh token" });
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        client_id: client_id,
        client_secret: client_secret,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, expires_in } = response.data;

    res.json({
      access_token: access_token,
      expires_in: expires_in,
    });
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Route: Fetch Spotify Profile
router.get("/profile", authMiddleware, refreshTokenMiddleware, async (req, res) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });

    res.status(200).json(response.data); // Send Spotify profile data to the client
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ error: "Failed to fetch Spotify profile" });
  }
});

module.exports = router;
