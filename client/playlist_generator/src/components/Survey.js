import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams for dynamic routing
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const Survey = ({ groupCode: propGroupCode }) => {
  // If groupCode is passed as a prop, use it; otherwise, get it from the URL
  const { groupCode: routeGroupCode } = useParams();
  const groupCode = propGroupCode || routeGroupCode;
  const navigate = useNavigate(); 

  const [answers, setAnswers] = useState({
    chill: 0,
    energetic: 0,
    relaxed: 0,
    happy: 0,
    focused: 0,
    playlistType: '',
  });
  const [message, setMessage] = useState('');
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if the survey is completed
  useEffect(() => {
    const fetchSurveyStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/groups/${groupCode}`);
        setSurveyCompleted(response.data.surveyCompleted);
      } catch (error) {
        console.error('Error fetching survey status:', error.response?.data || error.message);
      }
    };

    if (groupCode) fetchSurveyStatus();
  }, [groupCode]);

  // Handle input changes for each survey question
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({
      ...prev,
      [name]: name === 'playlistType' ? value : Number(value), // Handle playlistType as a string
    }));
  };

  // Submit survey responses
  const submitSurvey = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please log in to submit the survey.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/submit-survey',
        { groupCode, answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      setMessage(response.data.message);
  
      // Check if the group is complete and a playlist is generated
      if (response.data.playlistParams) {
        console.log('Navigating to playlist page with params:', response.data.playlistParams);
        navigate(`/playlist/${groupCode}`, { state: { spotifyParams: response.data.playlistParams } });
      } else if (response.data.remaining !== undefined) {
        console.log(`Waiting for ${response.data.remaining} more submissions.`);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.error || 'An error occurred while submitting the survey.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!groupCode) {
    return <p>Error: Group code is missing. Please try again.</p>;
  }

  if (surveyCompleted) {
    return <p>The survey is complete! A playlist has been generated.</p>;
  }

  return (
    <div>
      <h2>Survey for Group: {groupCode}</h2>
      <p>Please rate each question on a scale from 1 (lowest) to 5 (highest):</p>

      <div>
        <label>How chill are you feeling?</label>
        <input
          type="number"
          name="chill"
          value={answers.chill}
          onChange={handleChange}
          min="1"
          max="5"
        />
      </div>

      <div>
        <label>How energetic are you feeling?</label>
        <input
          type="number"
          name="energetic"
          value={answers.energetic}
          onChange={handleChange}
          min="1"
          max="5"
        />
      </div>

      <div>
        <label>How relaxed are you feeling?</label>
        <input
          type="number"
          name="relaxed"
          value={answers.relaxed}
          onChange={handleChange}
          min="1"
          max="5"
        />
      </div>

      <div>
        <label>How happy are you feeling?</label>
        <input
          type="number"
          name="happy"
          value={answers.happy}
          onChange={handleChange}
          min="1"
          max="5"
        />
      </div>

      <div>
        <label>How focused are you feeling?</label>
        <input
          type="number"
          name="focused"
          value={answers.focused}
          onChange={handleChange}
          min="1"
          max="5"
        />
      </div>

      <div>
  <label>What is the vibe for this playlist?</label>
  <div>
    <label>
      <input
        type="radio"
        name="playlistType"
        value="sports practice"
        checked={answers.playlistType === 'sports practice'}
        onChange={handleChange}
      />
      Sports Practice
    </label>
  </div>
  <div>
    <label>
      <input
        type="radio"
        name="playlistType"
        value="lowkey vibe"
        checked={answers.playlistType === 'lowkey vibe'}
        onChange={handleChange}
      />
      Lowkey Chillout
    </label>
  </div>
  <div>
    <label>
      <input
        type="radio"
        name="playlistType"
        value="party"
        checked={answers.playlistType === 'party'}
        onChange={handleChange}
      />
      Hype Party
    </label>
  </div>
</div>
      <button onClick={submitSurvey} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Survey'}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Survey;
