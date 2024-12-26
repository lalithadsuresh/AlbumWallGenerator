const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// Exchange authorization code for tokens
const exchangeCodeForTokens = async (code) => {
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return response.data; // { access_token, refresh_token, expires_in }
    } catch (error) {
        console.error('Error exchanging code for tokens:', error.response?.data || error.message);
        throw new Error('Failed to exchange authorization code for tokens');
    }
};

// Fetch user profile from Spotify
const fetchSpotifyUserProfile = async (accessToken) => {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return response.data; // Spotify user data
    } catch (error) {
        console.error('Error fetching Spotify user profile:', error.response?.data || error.message);
        throw new Error('Failed to fetch Spotify user profile');
    }
};

module.exports = {
    exchangeCodeForTokens,
    fetchSpotifyUserProfile,
};
