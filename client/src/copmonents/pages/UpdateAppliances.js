import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import admin from "../assets/admin.png";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { useNavigate } from 'react-router-dom';

const UpdateAppliances = () => {
  // Local state for form inputs
  const [appliances, setAppliances] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState("");
  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [price, setPrice] = useState("");
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

  // Fetch appliances on component mount
  useEffect(() => {
    const fetchAppliances = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getSpecificAppliance');
        setAppliances(response.data.Appliance || []);
      } catch (error) {
        console.error('Error fetching appliances:', error);
      }
    };
    fetchAppliances();
  }, []);

  // Handle appliance selection
  const handleApplianceSelect = (applianceId) => {
    console.log("Selected appliance ID:", applianceId);
    const appliance = appliances.find(app => app._id === applianceId);
    console.log("Found appliance:", appliance);
    if (appliance) {
      setSelectedAppliance(applianceId);
      setName(appliance.name);
      setImgUrl(appliance.imgUrl || "");
      setPrice(appliance.price.toString());
      setDetails(appliance.details);
      setAvailable(appliance.available);
      console.log("Appliance data loaded:", {
        id: applianceId,
        name: appliance.name,
        price: appliance.price,
        details: appliance.details
      });
    }
  };

  // Handle appliance update
  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!selectedAppliance || !name || !price || !details) {
      setDialogMessage("Please select an appliance and fill in all required fields.");
      setShowDialog(true);
      return;
    }
  
    const applianceData = {
      name: name,
      imgUrl: imgUrl,
      price: price,
      details: details,
      available: available,
    };
  
    console.log("Sending update request:", selectedAppliance, applianceData);
    
    // First test if server is reachable
    axios.put('http://localhost:3000/test-update', {})
      .then(() => {
        console.log("Server is reachable, proceeding with update...");
        return axios.put(`http://localhost:3000/updateAppliance/${selectedAppliance}`, applianceData);
      })
      .catch((testError) => {
        console.error("Server test failed:", testError);
        setDialogMessage("Cannot connect to server. Please check if server is running.");
        setShowDialog(true);
        return;
      })
      .then((response) => {
        console.log("Update response:", response);
        setDialogMessage("Appliance updated successfully!");
        setSelectedAppliance("");
        setName("");
        setImgUrl("");
        setPrice("");
        setDetails("");
        setAvailable(true);
        setShowDialog(true);
        
        // Refresh appliances list
        const fetchAppliances = async () => {
          try {
            const response = await axios.get('http://localhost:3000/getSpecificAppliance');
            setAppliances(response.data.Appliance || []);
          } catch (error) {
            console.error('Error fetching appliances:', error);
          }
        };
        fetchAppliances();
        
        // Notify other components that appliances have been updated
        const timestamp = Date.now().toString();
        localStorage.setItem('applianceUpdated', timestamp);
        localStorage.setItem('applianceLastUpdate', timestamp);
        
        // Dispatch multiple events to ensure notification
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('applianceUpdated', { detail: { timestamp } }));
        
        console.log('Notified components of appliance update');
      })
      .catch((error) => {
        console.error("Error updating appliance:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        const errorMessage = error.response?.data?.message || error.message || "An error occurred. Please try again later.";
        setDialogMessage(errorMessage);
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

  const handleCustomerFeedback = () => {
    navigate('/customer-feedback')
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
          <li onClick={handleCustomerFeedback} className="menu-item bi bi-person-lines-fill">&nbsp; Customer Feedback</li>
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
          <h2>Update Appliances</h2>
            
            {/* Appliance Selection */}
            <label className="label">Select Appliance to Update:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-list-ul"></i>
                </span>
              </div>
              <select
                className="form-control"
                value={selectedAppliance}
                onChange={(e) => handleApplianceSelect(e.target.value)}
              >
                <option value="">Choose an appliance...</option>
                {appliances.map((appliance) => (
                  <option key={appliance._id} value={appliance._id}>
                    {appliance.name} - {appliance.price} 
                  </option>
                ))}
              </select>
            </div>

            <label className="label">Name:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-sticky-fill"></i>
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Name .."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <label className="label">Image URL:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-image-fill"></i>
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Image URL .."
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
              />
            </div>

            <label className="label">OR:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-cash"></i>
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                placeholder="Enter price .."
                value={price}
                min={1}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <label className="label">Details:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-pencil-fill"></i>
                </span>
              </div>
              <textarea
                className="form-control"
                placeholder="Enter the details .."
                rows="4"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              ></textarea>
            </div>

            <div className="form-check my-2">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="availableCheck" 
                checked={available} 
                onChange={(e) => setAvailable(e.target.checked)} 
              />
              <label className="form-check-label" htmlFor="availableCheck">
                Available
              </label>
            </div>

            <button 
              onClick={handleSubmit} 
              className="login-btn-admin" 
              style={{ 
                padding: '15px 30px', 
                fontSize: '18px', 
                fontWeight: 'bold',
                width: '100%',
                marginTop: '20px'
              }}
            >
              Update Appliance
            </button>
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

export default UpdateAppliances;