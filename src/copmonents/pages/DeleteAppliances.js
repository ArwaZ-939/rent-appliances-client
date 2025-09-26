import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import admin from "../assets/admin.png";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Button, Row, Col, Card, CardBody, CardImg, CardTitle, CardText, Spinner, Input, InputGroup, InputGroupText } from "reactstrap";
import { useNavigate } from 'react-router-dom';

const DeleteAppliances = () => {
  // State for listing and deleting appliances
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetching user profile and users list from the Redux store
  const Profiler = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  const user = { gender: 'Female', user: 'Admin' };
  const dfimg = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  const users = [];
  console.log(user);
  
  const navigate = useNavigate();
  
  // Fetch appliances on mount
  useEffect(() => {
    axios.get('http://localhost:5000/getSpecificAppliance')
      .then((res) => {
        setAppliances(res.data.Appliance || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching appliances:', error);
        setDialogMessage('Failed to load appliances');
        setShowDialog(true);
        setLoading(false);
      });
  }, []);

  // Delete appliance by id
  const confirmDelete = (id) => {
    setConfirmId(id);
    // Fallback: if modal doesn't show (CSS/Bootstrap not loaded), use native confirm
    setTimeout(() => {
      const modalVisible = !!document.querySelector('.modal.show');
      if (!modalVisible) {
        if (window.confirm('Are you sure you want to delete this appliance?')) {
          handleImmediateDelete(id);
        }
      }
    }, 50);
  };
  const cancelDelete = () => setConfirmId(null);
  const handleDelete = () => {
    if (!confirmId) return;
    axios.delete(`http://localhost:5000/appliances/${confirmId}`)
      .then((res) => {
        setAppliances((prev) => prev.filter(a => a._id !== confirmId));
        setDialogMessage(res.data?.message || 'Appliance deleted successfully');
        setShowDialog(true);
        // Notify other pages (e.g., Home catalog) about the deletion
        try {
          window.dispatchEvent(new CustomEvent('appliance:deleted', { detail: { id: confirmId } }));
          window.dispatchEvent(new Event('appliance:refresh'));
        } catch (_) {}
        setConfirmId(null);
        // Navigate to home to ensure fresh fetch
        navigate('/home');
      })
      .catch((error) => {
        console.error('Error deleting appliance:', error?.response?.data || error);
        setDialogMessage(error?.response?.data?.message || 'Failed to delete appliance');
        setShowDialog(true);
        setConfirmId(null);
      });
  };

  // Immediate delete without modal (useful if modal isn't showing for you)
  const handleImmediateDelete = (id) => {
    if (!id) return;
    axios.delete(`http://localhost:5000/appliances/${id}`)
      .then((res) => {
        setAppliances((prev) => prev.filter(a => a._id !== id));
        setDialogMessage(res.data?.message || 'Appliance deleted successfully');
        setShowDialog(true);
        try {
          window.dispatchEvent(new CustomEvent('appliance:deleted', { detail: { id } }));
          window.dispatchEvent(new Event('appliance:refresh'));
        } catch (_) {}
      })
      .catch((error) => {
        console.error('Error deleting appliance:', error?.response?.data || error);
        setDialogMessage(error?.response?.data?.message || 'Failed to delete appliance');
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
        <div className="left-section-admin" style={{ width: '100%' }}>
          <h2>Delete Appliances</h2>
          <InputGroup className="mb-3">
            <Input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <InputGroupText className="bi bi-search" />
          </InputGroup>
          {loading ? (
            <div className="text-center my-4"><Spinner color="primary" /></div>
          ) : (
            <Row xs="1" sm="2" md="3" lg="4">
              {appliances
                .filter(a => a.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((appliance) => (
                <Col key={appliance._id} className="mb-4">
                  <Card className="shadow-sm h-100">
                    {appliance.imgUrl ? (
                      <CardImg top src={appliance.imgUrl} alt={appliance.name} style={{ height: '160px', objectFit: 'cover' }} />
                    ) : null}
                    <CardBody>
                      <CardTitle tag="h5">{appliance.name}</CardTitle>
                      <CardText><strong>Price:</strong> {appliance.price}</CardText>
                      <CardText className="text-truncate" title={appliance.details}>{appliance.details}</CardText>
                      <div className="d-flex gap-2">
                        <Button color="danger" size="sm" onClick={() => confirmDelete(appliance._id)} className="bi bi-trash">&nbsp; Delete</Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
              {appliances.filter(a => a.name?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <Col><p className="text-center">No appliances found.</p></Col>
              )}
            </Row>
          )}
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