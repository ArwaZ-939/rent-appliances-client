import React, { useState, useEffect, useContext } from 'react';
import Header from "../sections/Header";
import Footer from "../sections/Footer";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DarkModeContext } from '../sections/DarkModeContext';


const Profiler = () => {
  const [userInfo, setUserInfo] = useState({
    imgUrl: 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg',
    user: 'John Doe',
    gender: 'Male',
    email: 'John@gmail.com'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext);

  const ResetPassword = () => {
    navigate('/verifyEmail');
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!isEditing) {
      // Initialize edit form with current values
      setEditForm({
        username: userInfo.user
      });
    }
    setIsEditing(!isEditing);
    setMessage({ text: '', type: '' });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    // Username validation
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
    if (!usernameRegex.test(editForm.username.trim())) {
    setMessage({ text: 'Username must start with a letter and contain only letters or numbers', type: 'error' });
    return false;
      }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const username = localStorage.getItem('username');
      const updateData = {
        newUsername: editForm.username !== userInfo.user ? editForm.username : undefined
      };

      const response = await axios.put(`http://localhost:5000/updateUser/${username}`, updateData);
      
      if (response.data.message === 'User updated successfully.') {
        // Verify the update was saved to database
        const verifyResponse = await axios.get(`http://localhost:5000/verifyUserUpdate/${editForm.username}`);
        
        if (verifyResponse.data.message === 'User verification successful') {
          console.log('Database update verified:', verifyResponse.data.user);
          
          // Update local state with new data
          setUserInfo(prev => ({
            ...prev,
            user: editForm.username
          }));
          
          // Update localStorage if username changed
          if (editForm.username !== userInfo.user) {
            localStorage.setItem('username', editForm.username.toLowerCase());
          }
          
          setMessage({ text: 'Profile updated successfully!', type: 'success' });
          setIsEditing(false);
        } else {
          setMessage({ text: 'Profile updated but verification failed. Please refresh the page.', type: 'warning' });
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      username: ''
    });
    setMessage({ text: '', type: '' });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const username = localStorage.getItem('username');
      if (username) {
        try {
          const response = await axios.get(`http://localhost:5000/getUserProfile/${username}`);
          console.log("User profile data:", response.data);
          if (response.data) {
            // Handle different image URL formats
            let fullImgUrl = "https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg";
            
            if (response.data.imgUrl) {
              // If it's already a full URL, use it directly
              if (response.data.imgUrl.startsWith('http')) {
                fullImgUrl = response.data.imgUrl;
              } else {
                // If it's a relative path, construct the full URL
                fullImgUrl = `http://localhost:5000/${response.data.imgUrl}`;
              }
            }

            setUserInfo(prev => ({
              ...prev,
              ...response.data,
              imgUrl: fullImgUrl
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Keep default image on error
        }
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className={`main-contact ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <Header />
      <div className="container my-5 d-flex justify-content-center" style={{ paddingTop: "100px" }}>
        <div className={`card p-4 shadow ${darkMode ? 'bg-dark border-secondary text-light' : 'bg-light text-dark'}`} style={{ maxWidth: "600px", width: "100%" }}>
          <form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-center mb-0">User Profile</h2>
              <button 
                type="button" 
                className={`btn ${isEditing ? 'btn-secondary' : darkMode ? 'btn-outline-light' : 'btn-primary'}`}
                onClick={handleEditToggle}
                disabled={loading}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Message display */}
            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
                {message.text}
              </div>
            )}

            <div className="d-flex align-items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <img
                  src={userInfo.imgUrl}
                  alt="Profile"
                  width="120"
                  height="120"
                  className="rounded-circle border"
                  onError={(e) => {
                    console.log('Image failed to load, using default');
                    e.target.src = "https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg";
                  }}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              <div className="w-100">
                <div className="mb-3">
                  <label className="form-label"><strong>Username: </strong></label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      placeholder="Enter username"
                      required
                    />
                  ) : (
                    <input 
                      type="text" 
                      className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      value={userInfo.user} 
                      readOnly 
                    />
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="form-label"><strong>Email: </strong></label>
                  <input 
                    type="email" 
                    className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    value={userInfo.email} 
                    readOnly 
                  />
                  <small className="text-muted">Email can not be changed</small>
                </div>
                
                <div className="mb-3">
                  <label className="form-label"><strong>Gender: </strong></label>
                  <input 
                    type="text" 
                    className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    value={userInfo.gender} 
                    readOnly 
                  />
                  <small className="text-muted">Gender can not be changed</small>
                </div>
              </div>
            </div>


            {/* Action buttons */}
            <div className="d-flex justify-content-between">
              <button 
                type="button" 
                className={`btn btn-link text-decoration-none ${darkMode ? 'text-light' : 'text-dark'}`}
                onClick={ResetPassword}
              >
                Reset password?
              </button>
              
              {isEditing && (
                <div>
                  <button 
                    type="submit" 
                    className={`btn ${darkMode ? 'btn-outline-light' : 'btn-primary'}`}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profiler;