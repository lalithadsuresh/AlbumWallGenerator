const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const saveSpotifyTokens = require('../utils/saveSpotifyTokens');
const { exchangeCodeForTokens, fetchSpotifyUserProfile } = require('../utils/SpotifyService');
const refreshTokenMiddleware = require('../utils/RefreshToken'); 
const authMiddleware = require('../utils/MiddlewareAuth'); 
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const axios = require("axios");
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const GroupSurveyHandler = require('../utils/GroupSurveyHandler');
const surveyHandler = new GroupSurveyHandler();

// Route to redirect the user to Spotify's login page
router.get("/login", (req, res) => {
    const scope = 'user-read-private user-read-email';
    const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
    });
    res.redirect(spotifyAuthUrl);
});






router.get('/callback', async (req, res) => {
    const code = req.query.code; // Get the authorization code from query parameters
    if (!code) {
        console.error('Error: Authorization code is missing');
        return res.status(400).json({ error: 'Authorization code is missing' });
    }

    try {

        // Exchange the authorization code for access and refresh tokens
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const { access_token, refresh_token, expires_in } = response.data;

        // Fetch user profile
        const userProfileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const userProfile = userProfileResponse.data;

        // Find or create user in the database
        const user = await User.findOneAndUpdate(
            { spotifyId: userProfile.id }, // Match user by Spotify ID
            {
                spotifyId: userProfile.id,
                displayName: userProfile.display_name,
                email: userProfile.email,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiry: Date.now() + expires_in * 1000, 
                groupCode: `group_${Date.now()}`, // Set unique group code
                username: userProfile.display_name || `user_${Date.now()}`, // Use displayName or default
            },
            { upsert: true, new: true } // Create if not found
        );

        const token = jwt.sign(
            { id: user._id.toString() }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Redirect to frontend with token
        res.redirect(`http://localhost:3000/login?token=${token}`);
    } catch (error) {
        console.error('Error in callback:', error.response?.data || error.message, error.stack);
        res.status(500).json({ error: 'Failed to process callback' });
    }
});




router.post('/regenerate', async (req, res) => {
    console.log(req.body);
    const { refresh_token } = req.body; // Extract token from request body

    if (!refresh_token) {
        return res.status(400).json({ error: 'Missing refresh token' }); // Handle missing token
    }

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                client_id: client_id,
                client_secret: client_secret,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token, expires_in } = response.data;

        res.json({
            access_token: access_token,
            expires_in: expires_in,
        });
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});



router.get('/profile', authMiddleware, refreshTokenMiddleware, async (req, res) => {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${req.accessToken}`,
            },
        });

        res.status(200).json(response.data); // Send Spotify profile data to the client
    } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch Spotify profile' });
    }
});





router.post('/submit-survey', authMiddleware, async (req, res) => {
    const { groupCode, answers } = req.body;
    console.log(req.body);
    const userId = req.user.id;
  
    try {
      if (!groupCode || !answers) {
        return res.status(400).json({ error: 'Group code and answers are required' });
      }
  
      // Validate answers
      const validKeys = ['chill', 'energetic', 'relaxed', 'happy', 'focused'];
      for (const key of validKeys) {
        if (!answers[key] || answers[key] < 1 || answers[key] > 5) {
          return res.status(400).json({ error: `Invalid value for ${key}. Must be between 1 and 5.` });
        }
      }
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.surveys.push({ groupCode, answers });
      await user.save();

      const groupStatus = await surveyHandler.checkGroupCompletion(groupCode);

      if (groupStatus.complete) {
        const { averages } = await surveyHandler.calculateGroupMoodScores(groupCode);
        console.log(averages);
        
        const spotifyParams = surveyHandler.generateSpotifyParameters(averages);

        console.log(spotifyParams);

        res.status(200).json({
            message: 'Survey submitted successfully - Group complete!',
            playlistParams: spotifyParams
          });
        } else {
          res.status(200).json({
            message: 'Survey submitted successfully',
            remaining: groupStatus.totalMembers - groupStatus.submittedCount
          });
          console.log(groupStatus.totalMembers);
          console.log(groupStatus.totalMembers);
        }
      } catch (error) {
        console.error('Error submitting survey:', error);
        res.status(500).json({ error: 'An error occurred while submitting the survey' });
      }
    });
  








module.exports = router;

