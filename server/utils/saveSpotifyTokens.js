const User = require('../Models/userModel'); // Adjust path as needed

const saveSpotifyTokens = async (spotifyId, accessToken, refreshToken, expiresIn) => {
    try {
        let user = await User.findOne({ spotifyId });

        if (!user) {
            user = new User({
                spotifyId,
                accessToken,
                refreshToken,
                tokenExpiry: Date.now() + expiresIn * 1000, // Convert to milliseconds
            });
        } else {
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            user.tokenExpiry = Date.now() + expiresIn * 1000;
        }

        await user.save(); // Save the user to the database

        return user; // Return the user object
    } catch (error) {
        console.error('Error saving Spotify tokens:', error.message);
        throw error;
    }
};

module.exports = saveSpotifyTokens;
