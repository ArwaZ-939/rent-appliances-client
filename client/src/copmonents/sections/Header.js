import React, { useState, useEffect, useContext } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
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
  const [notificationModal, setNotificationModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: false,
    sms: false
  });
  const navigate = useNavigate();

  // Load notification preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setNotificationPreferences({
          email: preferences.email || false,
          sms: preferences.sms || false
        });
        setPhoneNumber(preferences.phoneNumber || '');
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  const fetchUserData = async () => {
    const username = localStorage.getItem('username');
    if (username) {
      try {
        const response = await axios.get(`http://localhost:5000/getUserProfile/${username}`);
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
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Refresh user data when window regains focus (user returns from profile page)
  useEffect(() => {
    const handleFocus = () => {
      fetchUserData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const toggleNotificationModal = () => {
    setNotificationModal(prev => !prev);
    // Reset validation when modal closes
    if (!notificationModal) {
      setPhoneError('');
    }
  };

  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  // Specific functions for light and dark mode
  const switchToLightMode = () => {
    if (darkMode) {
      toggleDarkMode(); // This will set darkMode to false
    }
  };

  const switchToDarkMode = () => {
    if (!darkMode) {
      toggleDarkMode(); // This will set darkMode to true
    }
  };

  // Validate Oman phone number
  const validateOmanPhoneNumber = (phone) => {
    // Remove any spaces, dashes, or country code
    const cleanedPhone = phone.replace(/[\s\-+]/g, '');
    
    // Check if it's exactly 8 digits
    if (!/^\d{8}$/.test(cleanedPhone)) {
      return 'Phone number must be exactly 8 digits';
    }
    
    // Check if it starts with 7 or 9
    if (!/^[79]/.test(cleanedPhone)) {
      return 'Oman phone number must start with 7 or 9';
    }
    
    return ''; // No error
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Only validate if SMS is selected and there's input
    if (notificationPreferences.sms && value.trim()) {
      const error = validateOmanPhoneNumber(value);
      setPhoneError(error);
    } else {
      setPhoneError('');
    }
  };

  const handlePreferenceChange = (type) => {
    const newPreferences = {
      ...notificationPreferences,
      [type]: !notificationPreferences[type]
    };
    
    setNotificationPreferences(newPreferences);
    
    // Clear phone error when SMS is deselected
    if (type === 'sms' && !newPreferences.sms) {
      setPhoneError('');
    }
    
    // Validate phone number when SMS is selected and there's input
    if (type === 'sms' && newPreferences.sms && phoneNumber.trim()) {
      const error = validateOmanPhoneNumber(phoneNumber);
      setPhoneError(error);
    }
  };

  const handleNotificationSave = () => {
    // Validate if SMS is selected
    if (notificationPreferences.sms) {
      if (!phoneNumber.trim()) {
        setPhoneError('Phone number is required for SMS notifications');
        return;
      }
      
      const error = validateOmanPhoneNumber(phoneNumber);
      if (error) {
        setPhoneError(error);
        return;
      }
    }
    
    // Save to localStorage
    const preferencesToSave = {
      email: notificationPreferences.email,
      sms: notificationPreferences.sms,
      phoneNumber: notificationPreferences.sms ? phoneNumber : '',
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('notificationPreferences', JSON.stringify(preferencesToSave));
    
    console.log('Notification preferences saved:', preferencesToSave);
    alert('Notification preferences saved successfully!');
    setNotificationModal(false);
    setPhoneError('');
  };

  // Check if save button should be enabled
  const isSaveDisabled = () => {
    if (notificationPreferences.sms) {
      return !phoneNumber.trim() || phoneError !== '';
    }
    return false;
  };

  return (
    <>
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
                onError={(e) => {
                  console.log('Image failed to load, using default');
                  e.target.src = "https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg";
                }}
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
                  <DropdownItem onClick={() => navigate('/smart-recom')}>
                    <i className="bi bi-lightbulb me-2"></i> Smart Recommendation
                  </DropdownItem>
                  <DropdownItem onClick={toggleNotificationModal}>
                    <i className="bi bi-bell me-2"></i> Notifications
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
                onClick={switchToLightMode}
                title="Switch to Light Mode"
              >
                ☀️
              </button>
              <button
                className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} rounded-circle`}
                onClick={switchToDarkMode}
                title="Switch to Dark Mode"
              >
                🌙
              </button>
            </NavItem>
          </Nav>
        </div>
      </Navbar>

      {/* Notification Settings Modal */}
      <Modal isOpen={notificationModal} toggle={toggleNotificationModal} className={darkMode ? 'dark-mode-modal' : ''}>
        <ModalHeader toggle={toggleNotificationModal}>Notification Settings</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup check className="mb-3">
              <Label check>
                <Input
                  type="checkbox"
                  checked={notificationPreferences.email}
                  onChange={() => handlePreferenceChange('email')}
                />{' '}
                Receive notifications via Email
              </Label>
              <small className="form-text text-muted d-block">
                Notifications will be sent to: {userInfo.email || 'Your registered email'}
              </small>
            </FormGroup>

            <FormGroup check className="mb-3">
              <Label check>
                <Input
                  type="checkbox"
                  checked={notificationPreferences.sms}
                  onChange={() => handlePreferenceChange('sms')}
                />{' '}
                Receive notifications via SMS
              </Label>
            </FormGroup>

            {notificationPreferences.sms && (
              <FormGroup>
                <Label for="phoneNumber">Oman Phone Number</Label>
                <Input
                  type="tel"
                  id="phoneNumber"
                  placeholder="Enter your Oman phone number (e.g., 91234567)"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  invalid={!!phoneError}
                  maxLength={8}
                />
                {phoneError && <FormFeedback>{phoneError}</FormFeedback>}
                <small className="form-text text-muted">
                  Oman phone number must be 8 digits and start with 7 or 9 (e.g., 91234567 or 71234567)
                </small>
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-secondary" onClick={toggleNotificationModal}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNotificationSave}
            disabled={isSaveDisabled()}
          >
            Save Preferences
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Header;