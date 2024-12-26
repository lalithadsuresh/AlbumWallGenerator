import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Survey = ({ groupCode }) => {
  const [answers, setAnswers] = useState({
    chill: 0,
    energetic: 0,
    relaxed: 0,
    happy: 0,
    focused: 0,
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

    fetchSurveyStatus();
  }, [groupCode]);

  // Handle input changes for each survey question
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({
      ...prev,
      [name]: Number(value),
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
        'http://localhost:5000/api/groups/submit-survey',
        { groupCode, answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMessage(response.data.message);

      // Check if the survey is completed
      if (response.data.playlist) {
        console.log('Generated Playlist:', response.data.playlist);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.error || 'An error occurred while submitting the survey.'
      );
    } finally {
      setLoading(false);
    }
  };

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

      <button onClick={submitSurvey} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Survey'}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Survey;
