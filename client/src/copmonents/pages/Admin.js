import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import admin from "../assets/admin.png";
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { useNavigate } from 'react-router-dom';
arwa
const Admin = () => {
  // Local state for form inputs
  const [selectedUser, setSelectedUser] = useState("");
  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [price, setprice] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [details, setDetails] = useState("");
  const [available, setAvailable] = useState(true);
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
  
    if (!name || !price || !details) {
      setDialogMessage("Please fill in all required fields (Name, Price, and Details are required).");
      setShowDialog(true);
      return;
    }
  
    const applianceData = {
      name: name,
      imgUrl: imgUrl,
      price: price,
      details: details,
      available: available
    };
  
    axios.post('http://localhost:3000/inserAppliance', applianceData)
      .then((response) => {
        const message = response?.data?.message || (response.status === 201 ? "Appliance added successfully!" : "Failed to add appliance.");
        setDialogMessage(message);
        if (response.status === 201) {
          setSelectedUser("");
          setName("");
          setImgUrl("");
          setprice("");
          setDueDate("");
          setDetails("");
          setAvailable(true);
          
          // Notify other components that appliances have been updated
          localStorage.setItem('applianceUpdated', Date.now().toString());
          window.dispatchEvent(new Event('storage'));
        }
        setShowDialog(true);
      })
      .catch((error) => {
        console.error("Error adding appliance:", error?.response?.data || error);
        const message = error?.response?.data?.message || "An error occurred. Please try again later.";
        setDialogMessage(message);
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
          <h2>Add new Appliance</h2>
            <div className="input-group">
              
            </div>

            <label className="label">Image Url:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-image-fill"></i>
                </span>
              </div>
              <input
                type="text"
                id="imgUrl"
                className="form-control"
                placeholder="Img Url .."
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                autoComplete="off"
              />
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
            

            <label className="label">Price :</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-sticky-fill"></i>
                </span>
              </div>
              <input
                type="number"
                id="title"
                className="form-control"
                placeholder="Enter price .."
                value={price}
                min={1}
                onChange={(e) => setprice(e.target.value)}
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

            <div className="form-check my-2">
			  <input className="form-check-input" type="checkbox" id="availableCheck" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
			  <label className="form-check-label" htmlFor="availableCheck">
				Available
			  </label>
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

export default Admin;
