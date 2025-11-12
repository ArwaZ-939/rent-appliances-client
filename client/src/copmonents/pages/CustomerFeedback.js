import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, Button, Row, Col, Card, CardBody, CardText, Spinner, Input, InputGroup, InputGroupText } from "reactstrap";
import { useNavigate } from 'react-router-dom';

const CustomerFeedback = () => {
  // State for listing and deleting feedback
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetching user profile and users list from the Redux store
  const Profiler = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  const user = { gender: 'Female', user: 'Admin' };
  const dfimg = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  console.log(user);
  
  const navigate = useNavigate();
  
  // Fetch feedback on mount
  useEffect(() => {
    axios.get('http://localhost:5000/getFeedback')
      .then((res) => {
        setFeedbacks(res.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching feedback:', error);
        setDialogMessage('Failed to load feedback');
        setShowDialog(true);
        setLoading(false);
      });
  }, []);

  // Delete feedback by id
  const confirmDelete = (id) => {
    setConfirmId(id);
    // Fallback: if modal doesn't show (CSS/Bootstrap not loaded), use native confirm
    setTimeout(() => {
      const modalVisible = !!document.querySelector('.modal.show');
      if (!modalVisible) {
        if (window.confirm('Are you sure you want to delete this feedback?')) {
          handleImmediateDelete(id);
        }
      }
    }, 50);
  };
  
  const cancelDelete = () => setConfirmId(null);
  
  const handleDelete = () => {
    if (!confirmId) return;
    axios.delete(`http://localhost:5000/feedback/${confirmId}`)
      .then((res) => {
        setFeedbacks((prev) => prev.filter(f => f._id !== confirmId));
        setDialogMessage(res.data?.message || 'Feedback deleted successfully');
        setShowDialog(true);
        setConfirmId(null);
      })
      .catch((error) => {
        console.error('Error deleting feedback:', error?.response?.data || error);
        setDialogMessage(error?.response?.data?.message || 'Failed to delete feedback');
        setShowDialog(true);
        setConfirmId(null);
      });
  };

  // Immediate delete without modal (useful if modal isn't showing for you)
  const handleImmediateDelete = (id) => {
    if (!id) return;
    axios.delete(`http://localhost:5000/feedback/${id}`)
      .then((res) => {
        setFeedbacks((prev) => prev.filter(f => f._id !== id));
        setDialogMessage(res.data?.message || 'Feedback deleted successfully');
        setShowDialog(true);
      })
      .catch((error) => {
        console.error('Error deleting feedback:', error?.response?.data || error);
        setDialogMessage(error?.response?.data?.message || 'Failed to delete feedback');
        setShowDialog(true);
      });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#ffc107' : '#e0e0e0', fontSize: '1.2rem' }}>
          ★
        </span>
      );
    }
    return stars;
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
          <p>{user.gender === 'Male'? 'Mr.':'Ms.'} {user.user}</p>
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
        <div className="left-section-admin" style={{ width: '100%' }}>
          <h2>Customer Feedback</h2>
          <InputGroup className="mb-3">
            <Input type="text" placeholder="Search by user name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <InputGroupText className="bi bi-search" />
          </InputGroup>
          {loading ? (
            <div className="text-center my-4"><Spinner color="primary" /></div>
          ) : (
            <Row xs="1" sm="2" md="3" lg="4">
              {feedbacks
                .filter(f => 
                  f.user?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
                  f.email?.toLowerCase().startsWith(searchTerm.toLowerCase())
                )
                .map((feedback) => (
                <Col key={feedback._id} className="mb-4">
                  <Card className="shadow-sm h-100">
                    <CardBody>
                      <CardText><strong>User:</strong> {feedback.user || 'Anonymous'}</CardText>
                      <CardText><strong>Email:</strong> {feedback.email || 'N/A'}</CardText>
                      <CardText><strong>Rating:</strong> {renderStars(feedback.rating || 0)} ({feedback.rating || 0}/5)</CardText>
                      <CardText><strong>Date:</strong> {formatDate(feedback.createdAt)}</CardText>
                      <CardText style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', minHeight: '80px' }}>
                        <strong>Feedback:</strong><br/>
                        {feedback.message}
                      </CardText>
                      <div className="d-flex gap-2">
                        <Button color="danger" size="sm" onClick={() => confirmDelete(feedback._id)} className="bi bi-trash">&nbsp; Delete</Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
              {feedbacks.filter(f => 
                f.user?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
                f.email?.toLowerCase().startsWith(searchTerm.toLowerCase())
              ).length === 0 && (
                <Col><p className="text-center" style={{ color: 'gray' }}>No feedback found.</p></Col>
              )}
            </Row>
          )}
        </div>
      </div>
      <Modal isOpen={!!confirmId} toggle={cancelDelete}>
        <ModalHeader toggle={cancelDelete}>Confirm Delete</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this feedback?</p>
          <div className="d-flex gap-2">
            <Button color="danger" onClick={handleDelete}>Delete</Button>
            <Button color="secondary" onClick={cancelDelete}>Cancel</Button>
          </div>
        </ModalBody>
      </Modal>
      <Modal isOpen={showDialog && !confirmId} toggle={() => setShowDialog(false)}>
        <ModalHeader toggle={() => setShowDialog(false)}>Message</ModalHeader>
        <ModalBody>
          <p>{dialogMessage}</p>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CustomerFeedback;
