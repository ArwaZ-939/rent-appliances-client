import React, { useState, useEffect } from 'react';
import {Navbar,NavbarBrand,Nav,NavItem,Dropdown,DropdownToggle,DropdownMenu,DropdownItem,} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  const ToHome = () => {
    navigate('/home');
  };
  const ToContact = () => {
    navigate('/contact');
  };
  const ToFeedback = () => {
    navigate('/feedback');
  };
  const ToHelp = () => {
    navigate("/help")
  }

  const handleSignOut = () => {
    localStorage.removeItem('username'); // Clear the username from storage
    navigate('/');
  };

  return (
    <Navbar className="navbar-h" expand="lg" fixed="top">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="profile-image-container">
            <img
              className="profile-image"
              src={userInfo.imgUrl || 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg'}
              alt="profile"
              width="40px"
              height="40px"
            />
          </div>
          <NavbarBrand href="#">
            <h5 className="mb-0" onClick={() => navigate("/profile")}>
              {userInfo.gender === 'Male' ? 'Mr.' : 'Ms.'} {userInfo.user}
            </h5>
          </NavbarBrand>
        </div>
        <Nav className="d-flex align-items-center gap-2 text-white" navbar>
          <NavItem>
            <button className="button-no-color" onClick={ToHome}>
              Home
            </button>
          </NavItem>
          <NavItem>
            <button className="button-no-color" onClick={ToContact}>
              Contact us
            </button>
          </NavItem>
          <NavItem>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle nav caret className="button-no-color">
                More
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Options</DropdownItem>
                <DropdownItem
                  className="bi-pencil-square"
                  onClick={ToFeedback}
                > &nbsp;
                   Feedback and Rating
                </DropdownItem>
                <DropdownItem
                  className="bi bi-question-circle"
                  onClick={ToHelp}
                > &nbsp;
                   Help
                </DropdownItem>
                <DropdownItem
                  className="bi bi-box-arrow-left"
                  onClick={handleSignOut}
                > &nbsp;
                   Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavItem>
        </Nav>
      </div>
    </Navbar>
  );
};

export default Header;
