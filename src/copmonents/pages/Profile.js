import React, { useState, useEffect } from 'react';
import Header from "../sections/Header";
import Footer from "../sections/Footer";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Profiler = () => {
  const [userInfo, setUserInfo] = useState({
    imgUrl: 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg',
    user: 'John Doe',
    gender: 'Male',
    email: 'John@gmail.com'
  });

  const navigate = useNavigate();

  const ResetPassword = () => {
    navigate('/verifyEmail');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const username = localStorage.getItem('username');
      if (username) {
        try {
          const response = await axios.get(`http://localhost:3000/getUserProfile/${username}`);
          if (response.data) {
            setUserInfo(response.data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="main-contact">
      <Header />
      <div className="container my-5 d-flex justify-content-center" style={{ paddingTop: "100px" }}>
      <div className="card p-4 shadow" style={{ maxWidth: "600px", width: "100%" }}>
          <form>
            <h2 className="text-center mb-4">User Profile</h2>
            <div className="d-flex align-items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <img
                  src={
                    userInfo.imgUrl && userInfo.imgUrl.trim()
                      ? userInfo.imgUrl
                      : "https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg"
                  }
                  alt="Profile"
                  width="120"
                  height="120"
                  className="rounded-circle border"
                />
              </div>
              <div className="w-100">
                <div className="mb-3">
                  <label className="form-label"><strong>Name: </strong></label>
                  <input type="text" className="form-control" value={userInfo.user} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label"><strong>Email: </strong></label>
                  <input type="email" className="form-control" value={userInfo.email} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label"><strong>Gender: </strong></label>
                  <input type="text" className="form-control" value={userInfo.gender} readOnly />
                </div>
              </div>
            </div>
            <div className="create-account">
          <button className="tag-button right" onClick={ResetPassword}>Reset password?</button>
          <br/>
          </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profiler;