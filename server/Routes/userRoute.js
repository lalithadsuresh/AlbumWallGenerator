const express = require("express");
const router = express.Router();
const { registerUser } = require("../Controllers/userController");
const querystring = require("querystring");
const axios = require("axios");

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

// Step 2: Spotify redirects back to your app with the code
router.get("/callback", async (req, res) => {
    const code = req.query.code || null;
    if (!code) {
        return res.send('Missing authorization code');
    }

    try {
        // Step 3: Exchange the authorization code for an access token
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        }), {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const access_token = response.data.access_token;
        const refresh_token = response.data.refresh_token;

        res.redirect(`/group`);

    } catch (error) {
        res.status(500).send('Error authenticating with Spotify: ' + error.message);
    }
});

module.exports = router;