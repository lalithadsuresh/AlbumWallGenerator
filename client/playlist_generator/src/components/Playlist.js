import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Playlist = () => {
  const { groupCode } = useParams();
  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(
          `http://localhost:5000/api/groups/generate-playlist/${groupCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setPlaylistData(response.data.playlist); // Ensure correct key is used
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };

    if (groupCode) {
      fetchPlaylistData();
    }
  }, [groupCode]);

  if (loading) {
    return <div className="text-center my-10">Loading playlist...</div>;
  }

  if (error) {
    return <div className="text-center my-10 text-red-500">{error}</div>;
  }

  if (!playlistData || !playlistData.tracks?.length) {
    return <div className="text-center my-10">No playlist available yet.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold">Group Playlist for {groupCode}</h2>
        {playlistData.playlistUrl && (
          <a
            href={playlistData.playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            Open in Spotify
          </a>
        )}
      </div>

      <div>
        {playlistData.tracks.map((track, index) => (
          <div
            key={track.id || index} // Use index as fallback
            className="p-4 border rounded-md shadow-sm mb-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{track.name}</h3>
              <p className="text-sm text-gray-600">
                {track.artists?.join(', ') || 'Unknown Artist'}
              </p>
            </div>
            {track.matchScore && (
              <div className="text-sm text-gray-500">
                Match Score: {Math.round(track.matchScore * 100)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
