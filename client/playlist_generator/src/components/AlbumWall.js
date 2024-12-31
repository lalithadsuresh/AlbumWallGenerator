import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AlbumWall.css'; // Assuming this file contains your styles
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';

const AlbumWall = () => {
  const location = useLocation();
  const [groupName, setGroupName] = useState('');
  const { groupCode } = useParams();
  const navigate = useNavigate(); // To reload the page
  const [albumWall, setAlbumWall] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadPage = () => {
    navigate(0); // Navigate to the current page to reload
  };

  useEffect(() => {
    const fetchAlbumWall = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(
          `http://localhost:5000/api/groups/group-album-wall/${groupCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const { albumWall, groupName } = response.data;
        setAlbumWall(albumWall || []);
        setGroupName(groupName);
      } catch (err) {
        console.error('Error fetching album wall:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load album wall');
      } finally {
        setLoading(false);
      }
    };

    if (groupCode) {
      fetchAlbumWall();
    }
  }, [groupCode]);

  if (loading) {
    return <div className="text-center my-10">Loading album wall...</div>;
  }

  if (error) {
    return <div className="text-center my-10 text-red-500">{error}</div>;
  }

  if (!albumWall.length) {
    return <div className="text-center my-10">No album covers available yet.</div>;
  }

  // Select 16 random albums
  const shuffledAlbums = albumWall.sort(() => 0.5 - Math.random());
  const selectedAlbums = shuffledAlbums.slice(0, 16);

  return (
    <Box
      sx={{
        position: 'relative',
        paddingBottom: '60px',
        textAlign: 'center',
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      {/* Group Code Section */}
      <Box
        sx={{
          backgroundColor: '#f9f9f9',
          padding: 2,
          marginBottom: 4,
          border: '1px solid #ccc',
          borderRadius: 2,
          textAlign: 'center',
          marginTop: '20px'
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
          <strong>{groupName}</strong>'s Album Wall
        </Typography>
        <Typography variant="body1">
          Invite your friends using the group code <strong> {groupCode} </strong> to contribute to the album wall!
        </Typography>
      </Box>

      {/* Album Wall */}
      <div id="container">
        <div id="room">
          {/* Front face */}
          <figure className="front">
            <div className="wall-bg">
              <div className="wall">
                {selectedAlbums.map((album, index) => (
                  <a
                    key={index}
                    href={album.trackLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wall-item"
                  >
                    <div className="album-container">
                      <img
                        src={album.albumCover}
                        alt={`${album.trackName} by ${album.artistName}`}
                        className="album-cover"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </figure>
        </div>
      </div>

      {/* Reload Button */}
      <Button
        variant="contained"
        onClick={reloadPage}
        sx={{
          marginBottom: 6,
          backgroundColor: '#1DB954',
          '&:hover': { backgroundColor: '#1AAE4A' },
        }}
      >
        Reload Album Wall
      </Button>
    </Box>
  );
};

export default AlbumWall;
