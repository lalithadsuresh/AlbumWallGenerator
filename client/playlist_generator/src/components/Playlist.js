import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent 
  } from './Card';

  
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
          `http://localhost:5000/api/groups/playlist/${groupCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setPlaylistData(response.data);
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
    return (
      <Card className="max-w-4xl mx-auto p-6">
        <CardContent className="flex justify-center items-center min-h-[400px]">
          Loading playlist...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto p-6">
        <CardContent className="text-red-500">{error}</CardContent>
      </Card>
    );
  }

  if (!playlistData) {
    return (
      <Card className="max-w-4xl mx-auto p-6">
        <CardContent>No playlist available yet.</CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Group Playlist for {groupCode}</CardTitle>
          {playlistData.playlistUrl && (
            <CardDescription>
              <a 
                href={playlistData.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                Open in Spotify
              </a>
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {playlistData.tracks?.map((track, index) => (
          <Card key={track.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{track.name}</h3>
                  <p className="text-sm text-gray-600">
                    {track.artists.join(', ')}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Match Score: {Math.round(track.matchScore * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Playlist;