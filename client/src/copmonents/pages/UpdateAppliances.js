import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import admin from "../assets/admin.png";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UpdateAppliances = () => {
  const { t } = useTranslation();
  // Local state for form inputs
  const [appliances, setAppliances] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState("");
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [detailsAr, setDetailsAr] = useState("");
  const [available, setAvailable] = useState(true);
  const [quantity, setQuantity] = useState(1);
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
        const response = await axios.get('http://localhost:5000/getSpecificAppliance');
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
      setNameAr(appliance.name_ar || "");
      setImgUrl(appliance.imgUrl || "");
      setPrice(appliance.price.toString());
      setDetails(appliance.details);
      setDetailsAr(appliance.details_ar || "");
      setAvailable(appliance.available);
      setQuantity(1);
      console.log("Appliance data loaded:", {
        id: applianceId,
        name: appliance.name,
        price: appliance.price,
        details: appliance.details
      });
    }
  };

  // Handle appliance update
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedAppliance || !name || !price || !details) {
      setDialogMessage(t('updateAppliances.selectAndFill'));
      setShowDialog(true);
      return;
    }

    if (quantity < 1 || quantity > 100) {
      setDialogMessage("Quantity must be between 1 and 100.");
      setShowDialog(true);
      return;
    }
  
    const applianceData = {
      name: name,
      name_ar: nameAr,
      imgUrl: imgUrl,
      price: price,
      details: details,
      details_ar: detailsAr,
      available: available,
    };
  
    console.log("Sending update request:", selectedAppliance, applianceData);
    
    try {
      // First test if server is reachable
      await axios.put('http://localhost:5000/test-update', {});
      console.log("Server is reachable, proceeding with update...");
      
      // Update the selected appliance
      await axios.put(`http://localhost:5000/updateAppliance/${selectedAppliance}`, applianceData);
      
      // Add instances based on quantity (subtract 1 because we already updated the selected one)
      const additionalQuantity = quantity - 1;
      if (additionalQuantity > 0) {
        const promises = [];
        for (let i = 0; i < additionalQuantity; i++) {
          promises.push(axios.post('http://localhost:5000/inserAppliance', {
            name: name,
            name_ar: nameAr,
            imgUrl: imgUrl,
            price: price,
            details: details,
            details_ar: detailsAr,
            available: available
          }));
        }
        await Promise.all(promises);
      }
      
      setDialogMessage("Appliance updated successfully!");
      
      setSelectedAppliance("");
      setName("");
      setNameAr("");
      setImgUrl("");
      setPrice("");
      setDetails("");
      setDetailsAr("");
      setAvailable(true);
      setQuantity(1);
      setShowDialog(true);
      
      // Refresh appliances list
      const fetchAppliances = async () => {
        try {
          const response = await axios.get('http://localhost:5000/getSpecificAppliance');
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
    } catch (error) {
      console.error("Error updating appliance:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.message && error.message.includes("Cannot connect")) {
        setDialogMessage("Cannot connect to server. Please check if server is running.");
      } else {
        const errorMessage = error.response?.data?.message || error.message || "An error occurred. Please try again later.";
        setDialogMessage(errorMessage);
      }
      setShowDialog(true);
    }
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

  const handleCustomerChat = () => {
    navigate('/customer-chat')
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
          <li onClick={handleAddAppliances} className="menu-item bi bi-list-task">&nbsp;{t('admin.addAppliance')}</li>
          <li onClick={handleDeleteAppliances} className="menu-item bi bi-trash">&nbsp;{t('admin.deleteAppliance')}</li>
          <li onClick={handleUpdateAppliances} className="menu-item bi bi-pencil-square">&nbsp;{t('admin.updateAppliance')}</li>
          <li onClick={handleCustomerControl} className="menu-item bi bi-person-lines-fill">&nbsp; {t('admin.customerControl')}</li>
          <li onClick={handleCustomerFeedback} className="menu-item bi bi-person-lines-fill">&nbsp; {t('admin.customerFeedback')}</li>
          <li onClick={handleCustomerChat} className="menu-item bi bi-person-lines-fill">&nbsp; {t('admin.customerChat')}</li>
        </ul>
        <ul className="menu fixed-bottom p-4">
          <li onClick={handleSignOut} className="menu-item bi bi-box-arrow-right">&nbsp;{t('admin.signOut')}</li>
        </ul>
      </div>
      <br/>
      &nbsp;
      &nbsp;
      &nbsp;
      <div className="container-admin">
        <div className="left-section-admin">
          <h2>{t('updateAppliances.title')}</h2>
            
            {/* Appliance Selection */}
            <label className="label">{t('updateAppliances.selectAppliance')}</label>
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
                <option value="">{t('updateAppliances.chooseAppliance')}</option>
                {appliances.map((appliance) => (
                  <option key={appliance._id} value={appliance._id}>
                    {appliance.name} - {appliance.price} 
                  </option>
                ))}
              </select>
            </div>

            <label className="label">{t('updateAppliances.name')}</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-sticky-fill"></i>
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={t('updateAppliances.enterName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <label className="label">Name (Arabic):</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-sticky-fill"></i>
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Name in Arabic (Optional)"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>

            <label className="label">{t('updateAppliances.imageUrl')}</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-image-fill"></i>
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={t('updateAppliances.enterImageUrl')}
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
              />
            </div>

            <label className="label">{t('updateAppliances.price')}</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-cash"></i>
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                placeholder={t('updateAppliances.enterPrice')}
                value={price}
                min={1}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <label className="label">{t('updateAppliances.details')}</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-pencil-fill"></i>
                </span>
              </div>
              <textarea
                className="form-control"
                placeholder={t('updateAppliances.enterDetails')}
                rows="4"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              ></textarea>
            </div>

            <label className="label">Details (Arabic):</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-pencil-fill"></i>
                </span>
              </div>
              <textarea
                className="form-control"
                placeholder="Enter Details in Arabic (Optional)"
                rows="4"
                value={detailsAr}
                onChange={(e) => setDetailsAr(e.target.value)}
              ></textarea>
            </div>

            <label className="label">{t('updateAppliances.quantity')}</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-123"></i>
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                placeholder={t('updateAppliances.enterQuantity')}
                value={quantity}
                min={1}
                max={100}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
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
                {t('updateAppliances.available')}
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
              {t('updateAppliances.updateAppliance')}
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