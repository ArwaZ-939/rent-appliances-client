import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import admin from "../assets/admin.png";
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Admin = () => {
  const { t } = useTranslation();
  // Local state for form inputs
  const [selectedUser, setSelectedUser] = useState("");
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [price, setprice] = useState("");
  const [dueDate, setDueDate] = useState("");
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
  
  
  // Handle appliance submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!name || !price || !details) {
      setDialogMessage(t('admin.fillRequiredFields'));
      setShowDialog(true);
      return;
    }

    if (quantity < 1 || quantity > 100) {
      setDialogMessage(t('admin.quantityRange'));
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
      available: available
    };

    try {
      // Add multiple appliances based on quantity
      const promises = [];
      for (let i = 0; i < quantity; i++) {
        promises.push(axios.post('http://localhost:5000/inserAppliance', applianceData));
      }

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.status === 201).length;
      
      const message = successCount === quantity 
        ? `${quantity} appliance(s) added successfully!`
        : `Only ${successCount} out of ${quantity} appliance(s) were added.`;
      
      setDialogMessage(message);
      
      if (successCount > 0) {
        setSelectedUser("");
        setName("");
        setNameAr("");
        setImgUrl("");
        setprice("");
        setDueDate("");
        setDetails("");
        setDetailsAr("");
        setAvailable(true);
        setQuantity(1);
        
        // Notify other components that appliances have been updated
        localStorage.setItem('applianceUpdated', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      }
      setShowDialog(true);
    } catch (error) {
      console.error("Error adding appliance:", error?.response?.data || error);
      const message = error?.response?.data?.message || "An error occurred. Please try again later.";
      setDialogMessage(message);
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
          <h2>{t('admin.addNewAppliance')}</h2>
            <div className="input-group">
              
            </div>

            <label className="label">{t('admin.imageUrl')}</label>
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

            <label className="label">{t('admin.name')}</label>
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
                placeholder={t('admin.enterName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            

            <label className="label">{t('admin.price')}</label>
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
                placeholder={t('admin.enterPrice')}
                value={price}
                min={1}
                onChange={(e) => setprice(e.target.value)}
              />
            </div>

            <label className="label">{t('admin.details')}</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-pencil-fill"></i>
                </span>
              </div>
              <textarea
                id="task"
                className="form-control"
                placeholder={t('admin.enterDetails')}
                rows="4"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              ></textarea>
            </div>


            <label className="label">{t('admin.quantity')}</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="bi bi-123"></i>
                </span>
              </div>
              <input
                type="number"
                id="quantity"
                className="form-control"
                placeholder="Enter quantity (1-100)"
                value={quantity}
                min={1}
                max={100}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="form-check my-2">
			  <input className="form-check-input" type="checkbox" id="availableCheck" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
			  <label className="form-check-label" htmlFor="availableCheck">
				{t('admin.available')}
			  </label>
			</div>

            <button onClick={handleSubmit} className="login-btn-admin">{t('admin.submit')}</button>
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
