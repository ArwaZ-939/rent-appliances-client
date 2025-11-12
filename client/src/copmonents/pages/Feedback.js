import '../css/Feedback.css'
import Footer from '../sections/Footer'
import Header from '../sections/Header'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState({ user: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      axios.get(`http://localhost:5000/getUserProfile/${username}`)
        .then((response) => {
          if (response.data) {
            setUserInfo({
              user: response.data.user || 'Anonymous',
              email: response.data.email || ''
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          // If user profile fetch fails, still allow anonymous feedback
          setUserInfo({
            user: username || 'Anonymous',
            email: ''
          });
        });
    } else {
      // User not logged in, allow anonymous feedback
      setUserInfo({
        user: 'Anonymous',
        email: ''
      });
    }
  }, []);

  const handleStarClick = (index) => {
    setRating(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter your feedback message.');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    setError('');

    const feedbackData = {
      user: userInfo.user || 'Anonymous',
      email: userInfo.email || '',
      message: message,
      rating: rating
    };

    try {
      const response = await axios.post('http://localhost:5000/addFeedback', feedbackData);
      if (response.status === 201) {
        setSubmitted(true);
        setMessage('');
        setRating(0);
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit feedback. Please try again.';
      setError(errorMessage);
      
      // If it's a network error, provide more helpful message
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the server is running.');
      }
    }
  };
  
  return (
    <div className='main-contact'>
    <Header/>
    <div className="container contact-container">
            <div className="contact-content">
              <div className="contact-form">
                <h2 style={{ color: '#7B4F2C' }}>Feedback</h2>
                {submitted && (
                  <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
                    Thank you for your feedback!
                  </div>
                )}
                {error && (
                  <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '5px' }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <textarea 
                      name="message" 
                      className="form-control" 
                      id="message" 
                      rows="4" 
                      placeholder="Your Feedback" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="stars" id="starRating" style={{ marginBottom: '15px', textAlign: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${rating >= star ? 'selected' : ''}`}
                        onClick={() => handleStarClick(star)}
                        style={{ cursor: 'pointer', fontSize: '2rem', margin: '0 5px' }}
                      >
                        &#9733;
                      </span>
                    ))}
                  </div>
                  <button type="submit" className="btn btn-submit">SUBMIT</button>
                </form>
              </div>
            </div>
          </div>
          

    <Footer/>
    </div>
  )
}

export default Feedback;
