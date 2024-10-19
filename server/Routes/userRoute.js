const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios");
const User = require('../models/userModel'); 
require("dotenv").config();

const client_id = process.env.SPOTIFY_CLIENT_ID; 
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; 
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI; 

// Step 1: Redirect to Spotify's login page
router.get("/login", (req, res) => {
    const scope = 'user-read-private user-read-email'; 
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
        }));
});

// Step 2: Spotify redirects back to your app with the authorization code
router.get("/callback", async (req, res) => {
    const code = req.query.code || null;
    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    try {
        // Step 3: Exchange the authorization code for an access token
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        }), {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const access_token = tokenResponse.data.access_token;
        const refresh_token = tokenResponse.data.refresh_token;

        // Step 4: Get the user's profile from Spotify using the access token
        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const spotifyId = profileResponse.data.id;  // Spotify user ID
        const displayName = profileResponse.data.display_name;  // Spotify display name

        // Step 5: Save the user in the database (if they don't already exist)
        let user = await User.findOne({ spotifyId });
        if (!user) {
            user = new User({
                username: displayName,  // You can also use other fields like email if you want
                spotifyId: spotifyId,
                groups: []  // Initialize an empty array for groups
            });
            await user.save();
        }

        // Step 6: Redirect to group creation/joining page
        res.redirect('http://localhost:3000/create-group'); 


    } catch (error) {
        console.error('Error during Spotify authentication:', error);
        res.status(500).send('Error authenticating with Spotify: ' + error.message);
    }
});


router.post('/create', async (req, res) => {
    const { name, groupCode } = req.body;

    const newGroup = new Group({
        name,
        groupCode,
        members: [],
    });

    try {
        await newGroup.save();
        res.status(201).json({ message: 'Group created', group: newGroup });
    } catch (err) {
        res.status(500).json({ error: 'Error creating group' });
    }
});


module.exports = router;