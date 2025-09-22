import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import admin from "../assets/admin.png";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { useNavigate } from 'react-router-dom';

const DeleteAppliances = () => {
  // Local state for form inputs
  const [selectedUser, setSelectedUser] = useState("");
  const [name, setName] = useState("");
  const [price, setprice] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [details, setDetails] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // Fetching user profile and users list from the Redux store
  const Profiler = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  const user = { gender: 'Female', user: 'Admin' };
  const dfimg = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  const users = [];
  console.log(user);
  
  const navigate = useNavigate();
  
  
  // Handle appliance submission
  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!selectedUser || !name || !price || !details) {
      setDialogMessage("Please fill in all fields.");
      setShowDialog(true);
      return;
    }
  
    const applianceData = {
      name: selectedUser,
      price: price,
      details: details,
    };
  
    axios.post('/api/appliances', applianceData)
      .then((response) => {
        if (response.data.success) {
          setDialogMessage("Appliance added successfully!");
          setSelectedUser("");
          setName("");
          setDueDate("");
          setDetails("");
        } else {
          setDialogMessage("Failed to add appliance.");
        }
        setShowDialog(true);
      })
      .catch((error) => {
        console.error("Error adding appliance:", error);
        setDialogMessage("An error occurred. Please try again later.");
        setShowDialog(true);
      });
  };

  const handleSignOut = () => {
    navigate('/'); 
  };

  const handleAddAppliances = () => {
    navigate('/admin')
  };

  const handleDeleteAppliances = () => {
    navigate('/delete-appliances')
  };

  const handleUpdateAppliances = () => {
    navigate('/update-appliances')
  };

  const handleCustomerControl = () => {
    navigate('/customer-control')
  };

  return (
    <div className="admin-panel">
      <div className="sidebar">
        <div className="profile text-center mb-4">
          <img src={Profiler ? Profiler : dfimg} alt="Profile" className="rounded-circle mb-2" />
          <p className="user-role">Admin</p>
          <p>{user.gender =='Male'? 'Mr.':'Ms.'} {user.user}</p>
         <br/>
         &nbsp;
         <br/>
        </div>
        <ul className="menu">
          <li onClick={handleAddAppliances} className="menu-item bi bi-list-task">&nbsp;Add Appliance</li>
          <li onClick={handleDeleteAppliances} className="menu-item bi bi-trash">&nbsp;Delete Appliance</li>
          <li onClick={handleUpdateAppliances} className="menu-item bi bi-pencil-square">&nbsp;Update Appliance</li>
          <li onClick={handleCustomerControl} className="menu-item bi bi-person-lines-fill">&nbsp; Customer Control</li>
        </ul>
        <ul className="menu fixed-bottom p-4">
          <li onClick={handleSignOut} className="menu-item bi bi-box-arrow-right">&nbsp;Sign Out</li>
        </ul>
      </div>
      <br/>
      &nbsp;
      &nbsp;
      &nbsp;
      <div className="container-admin">
        <div className="left-section-admin">
          <h2>Delete Appliances</h2>
            <div className="input-group">
              
            </div>

            <label className="label">Name :</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-sticky-fill"></i>
                </span>
              </div>
              <input
                type="text"
                id="title"
                className="form-control"
                placeholder="Enter Name .."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <label className="label">imgUrl :</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-sticky-fill"></i>
                </span>
              </div>
              <input
                type="text"
                id="title"
                className="form-control"
                placeholder="Enter imgUrl .."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <label className="label">Price :</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-sticky-fill"></i>
                </span>
              </div>
              <input
                type="text"
                id="title"
                className="form-control"
                placeholder="Enter price .."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <label className="label">details :</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-pencil-fill"></i>
                </span>
              </div>
              <textarea
                id="task"
                className="form-control"
                placeholder="Enter the details .."
                rows="4"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              ></textarea>
            </div>

            <button onClick={handleSubmit} className="login-btn-admin">Submit</button>
        </div>

        <div className="right-section-admin">
          <img src={admin} alt="Signup Illustration" />
        </div>
      </div>
      <Modal isOpen={showDialog} toggle={() => setShowDialog(false)}>
        <ModalHeader toggle={() => setShowDialog(false)}>Message</ModalHeader>
        <ModalBody>
          <p>{dialogMessage}</p>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default DeleteAppliances;