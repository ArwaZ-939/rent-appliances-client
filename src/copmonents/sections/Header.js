import React, { useState, useEffect, useContext } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DarkModeContext } from './DarkModeContext';

const Header = () => {
  const [userInfo, setUserInfo] = useState({
    imgUrl: 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg',
    user: 'John Doe',
    gender: 'Male'
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

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

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);


  return (
    <Navbar className={`navbar-h ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`} expand="lg" fixed="top" style={{ padding: '0.5rem 1rem' }}>
      <div className="container d-flex justify-content-between align-items-center">
        {/* Left side: Profile */}
        <div className="d-flex align-items-center gap-3">
          <div className="profile-image-container" style={{ cursor: 'pointer' }} onClick={() => navigate("/profile")}>
            <img
              className="profile-image rounded-circle"
              src={userInfo.imgUrl}
              alt="profile"
              width="40"
              height="40"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <NavbarBrand href="#" style={{ cursor: 'pointer' }} onClick={() => navigate("/profile")}>
            <h5 className="mb-0">
              {userInfo.gender === 'Male' ? 'Mr.' : 'Ms.'} {userInfo.user}
            </h5>
          </NavbarBrand>
        </div>

        {/* Right side: Navigation */}
        <Nav className="d-flex align-items-center gap-3" navbar>
          <NavItem>
            <button className="nav-button" onClick={() => navigate('/home')}>
              Home
            </button>
          </NavItem>
          <NavItem>
            <button className="nav-button" onClick={() => navigate('/contact')}>
              Contact us
            </button>
          </NavItem>
          <NavItem>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle nav caret className="nav-button">
                More
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Options</DropdownItem>
                <DropdownItem onClick={() => navigate('/feedback')}>
                  <i className="bi bi-pencil-square me-2"></i> Feedback and Rating
                </DropdownItem>
                <DropdownItem onClick={() => navigate('/help')}>
                  <i className="bi bi-question-circle me-2"></i> Help
                </DropdownItem>
                <DropdownItem onClick={() => {
                  localStorage.removeItem('username');
                  navigate('/');
                }}>
                  <i className="bi bi-box-arrow-left me-2"></i> Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavItem>

          {/* Dark Mode Toggle */}
          <NavItem className="d-flex gap-2 align-items-center">
            <button
              className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} rounded-circle`}
              onClick={toggleDarkMode}
              title="Light Mode"
            >
              ☀️
            </button>
            <button
              className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} rounded-circle`}
              onClick={toggleDarkMode}
              title="Dark Mode"
            >
              🌙
            </button>
          </NavItem>
        </Nav>
      </div>
    </Navbar>
  );
};

export default Header;
