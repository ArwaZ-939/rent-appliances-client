import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import admin from "../assets/admin.png";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Button, Row, Col, Card, CardBody, CardImg, CardTitle, CardText, Spinner, Input, InputGroup, InputGroupText } from "reactstrap";
import { useNavigate } from 'react-router-dom';

const CustomerControl = () => {
  // Local state for form inputs
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userOrders, setUserOrders] = useState({}); // Store orders by username

  // Fetching user profile and users list from the Redux store
  const Profiler = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  const user = { gender: 'Female', user: 'Admin' };
  const dfimg = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  const users1 = [];
  console.log(user);
  
  const navigate = useNavigate();

  // Fetch users and their orders on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users from server...');
        const response = await axios.get('http://localhost:3000/getUsers');
        console.log('Received users:', response.data);
        const usersData = response.data || [];
        setUsers(usersData);
        
        // Fetch orders for all users
        const ordersMap = {};
        for (const user of usersData) {
          try {
            const ordersResponse = await axios.get(`http://localhost:5000/getUserOrders/${user.user}`);
            ordersMap[user.user] = ordersResponse.data || [];
          } catch (error) {
            console.error(`Error fetching orders for ${user.user}:`, error);
            ordersMap[user.user] = [];
          }
        }
        setUserOrders(ordersMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setDialogMessage('Failed to load users');
        setShowDialog(true);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle user selection
  const handleUserSelect = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUser(userId);
      setUsername(user.user);
      setEmail(user.email);
      setGender(user.gender);
      setImgUrl(user.imgUrl || "");
    }
  };

  // Handle add user
  const handleAddUser = (e) => {
    e.preventDefault();
  
    if (!username || !email || !password || !gender) {
      setDialogMessage("Please fill in all required fields (Username, Email, Password, Gender).");
      setShowDialog(true);
      return;
    }
  
    const userData = {
      user: username,
      email: email,
      password: password,
      gender: gender,
      imgUrl: imgUrl,
      isAdmin: false
    };
  
    axios.post('http://localhost:3000/addUser', userData)
      .then((response) => {
        setDialogMessage("User added successfully!");
        setUsername("");
        setEmail("");
        setPassword("");
        setGender("");
        setImgUrl("");
        setShowDialog(true);
        // Refresh users list
        const fetchUsers = async () => {
          try {
            const response = await axios.get('http://localhost:3000/getUsers');
            setUsers(response.data || []);
          } catch (error) {
            console.error('Error fetching users:', error);
          }
        };
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error adding user:", error);
        const message = error?.response?.data?.message || "An error occurred. Please try again later.";
        setDialogMessage(message);
        setShowDialog(true);
      });
  };

  // Check if user has active orders
  const hasActiveOrders = (username) => {
    const orders = userOrders[username] || [];
    return orders.some(order => order.status === 'pending' || order.status === 'active');
  };

  // Get active orders for a user
  const getActiveOrders = (username) => {
    const orders = userOrders[username] || [];
    return orders.filter(order => order.status === 'pending' || order.status === 'active');
  };

  // Delete user by id (direct deletion without confirmation)
  const confirmDelete = async (id) => {
    if (!id) return;
    
    const userToDelete = users.find(u => u._id === id);
    if (!userToDelete) return;

    // Check if user has active orders
    if (hasActiveOrders(userToDelete.user)) {
      const activeOrders = getActiveOrders(userToDelete.user);
      const applianceNames = activeOrders.map(o => o.appliance).join(', ');
      setDialogMessage(
        `Cannot delete user "${userToDelete.user}". They have ${activeOrders.length} active order(s) that must be returned first: ${applianceNames}`
      );
      setShowDialog(true);
      return;
    }

    // Proceed with deletion if no active orders
    axios.delete(`http://localhost:3000/deleteUser/${id}`)
      .then((res) => {
        setUsers((prev) => prev.filter(u => u._id !== id));
        // Remove orders from state
        setUserOrders((prev) => {
          const updated = { ...prev };
          delete updated[userToDelete.user];
          return updated;
        });
        setDialogMessage(res.data?.message || 'User deleted successfully');
        setShowDialog(true);
        // Notify other pages about the deletion
        try {
          window.dispatchEvent(new CustomEvent('user:deleted', { detail: { id } }));
          window.dispatchEvent(new Event('user:refresh'));
        } catch (_) {}
      })
      .catch((error) => {
        console.error('Error deleting user:', error?.response?.data || error);
        setDialogMessage(error?.response?.data?.message || 'Failed to delete user');
        setShowDialog(true);
      });
  };

  // Handle delete user (can be called with or without user ID) - keeping for backward compatibility
  const handleDeleteUser = (userId = null) => {
    const userToDeleteId = userId || selectedUser;
    
    if (!userToDeleteId) {
      setDialogMessage("Please select a user to delete.");
      setShowDialog(true);
      return;
    }

    // Find the user to get their name for confirmation
    const userToDelete = users.find(u => u._id === userToDeleteId);
    const userName = userToDelete ? userToDelete.user : 'Unknown';

    console.log('Deleting user with ID:', userToDeleteId);
    
    console.log("Attempting to delete user with ID:", userToDeleteId);
    console.log("User to delete:", userToDelete);
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      console.log("User cancelled deletion");
      return;
    }
    
    // Simple direct delete call
    console.log("Making delete request to:", `http://localhost:3000/deleteUser/${userToDeleteId}`);
    console.log("User ID being deleted:", userToDeleteId);
    console.log("User object being deleted:", userToDelete);
    
    // Test with a simple GET request first to see if server is reachable
    axios.get('http://localhost:3000/getUsers')
      .then(() => {
        console.log("Server is reachable, now attempting delete...");
        return axios.delete(`http://localhost:3000/deleteUser/${userToDeleteId}`);
      })
      .catch((error) => {
        console.error("Server not reachable:", error);
        setDialogMessage("Cannot connect to server. Please check if server is running.");
        setShowDialog(true);
        return;
      })
      .then((response) => {
        console.log('Delete response:', response);
        setDialogMessage(`User "${userName}" deleted successfully!`);
        
        // Clear form immediately
        setSelectedUser("");
        setUsername("");
        setEmail("");
        setPassword("");
        setGender("");
        setImgUrl("");
        
        // Remove user from local state immediately (optimistic update)
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.filter(user => user._id !== userToDeleteId);
          console.log('Removed user from local state. Remaining users:', updatedUsers.length);
          return updatedUsers;
        });
        
        setShowDialog(true);
        
        // Also refresh from server to ensure consistency
        const fetchUsers = async () => {
          try {
            console.log('Refreshing users list from server after deletion...');
            const response = await axios.get('http://localhost:3000/getUsers');
            console.log('Updated users list from server:', response.data);
            setUsers(response.data || []);
          } catch (error) {
            console.error('Error fetching users:', error);
          }
        };
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error message:", error.message);
        
        let errorMessage = "An error occurred. Please try again later.";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
          errorMessage = "User not found. It may have been already deleted.";
        } else if (error.response?.status === 500) {
          errorMessage = "Server error. Please check if the server is running.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setDialogMessage(`Error deleting user: ${errorMessage}`);
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
          <li onClick={handleAddAppliances} className="menu-item bi bi-list-task">&nbsp;Add Appliance</li>
          <li onClick={handleDeleteAppliances} className="menu-item bi bi-trash">&nbsp;Delete Appliance</li>
          <li onClick={handleUpdateAppliances} className="menu-item bi bi-pencil-square">&nbsp;Update Appliance</li>
          <li onClick={handleCustomerControl} className="menu-item bi bi-person-lines-fill">&nbsp; Customer Control</li>
          <li onClick={handleCustomerFeedback} className="menu-item bi bi-person-lines-fill">&nbsp; Customer Feedback</li>
          <li onClick={handleCustomerChat} className="menu-item bi bi-person-lines-fill">&nbsp; Customer Chat</li>
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
          <h2>Customer Control</h2>
          <InputGroup className="mb-3">
            <Input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <InputGroupText className="bi bi-search" />
          </InputGroup>
          {loading ? (
            <div className="text-center my-4"><Spinner color="primary" /></div>
          ) : (
            <Row xs="1" sm="2" md="3" lg="4">
              {users
                .filter(u => 
                  u.user?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
                  u.email?.toLowerCase().startsWith(searchTerm.toLowerCase())
                )
                .map((user) => (
                <Col key={user._id} className="mb-4">
                  <Card className="shadow-sm h-100">
                    {user.imgUrl ? (
                      <CardImg top src={user.imgUrl} alt={user.user} style={{ height: '160px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '160px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                      </div>
                    )}
                    <CardBody>
                      <CardTitle tag="h5">{user.user}</CardTitle>
                      <CardText><strong>Email:</strong> {user.email}</CardText>
                      <CardText><strong>Gender:</strong> {user.gender}</CardText>
                      <CardText><strong>Role:</strong> {user.isAdmin ? 'Admin' : 'User'}</CardText>
                      
                      {/* Order Information */}
                      {(() => {
                        const orders = userOrders[user.user] || [];
                        const activeOrders = getActiveOrders(user.user);
                        const hasActive = hasActiveOrders(user.user);
                        
                        return (
                          <>
                            {orders.length > 0 && (
                              <CardText>
                                <strong>Orders:</strong> {orders.length} total
                                {hasActive && (
                                  <span style={{ color: '#dc3545', fontWeight: 'bold', marginLeft: '8px' }}>
                                    ({activeOrders.length} active)
                                  </span>
                                )}
                              </CardText>
                            )}
                            {hasActive && (
                              <div style={{ 
                                padding: '8px', 
                                backgroundColor: '#fff3cd', 
                                border: '1px solid #ffc107',
                                borderRadius: '4px',
                                marginBottom: '10px',
                                fontSize: '12px'
                              }}>
                                <i className="bi bi-exclamation-triangle-fill" style={{ color: '#856404', marginRight: '5px' }}></i>
                                <strong style={{ color: '#856404' }}>Active Order(s):</strong>
                                <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', color: '#856404' }}>
                                  {activeOrders.map((order, idx) => (
                                    <li key={idx}>{order.appliance} (Status: {order.status})</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      
                      <div className="d-flex gap-2">
                        <Button 
                          color="danger" 
                          size="sm" 
                          onClick={() => confirmDelete(user._id)} 
                          className="bi bi-trash"
                          disabled={hasActiveOrders(user.user)}
                          title={hasActiveOrders(user.user) ? 'Cannot delete user with active orders. Please return appliances first.' : 'Delete user'}
                        >
                          &nbsp; Delete
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
              {users.filter(u => 
                u.user?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().startsWith(searchTerm.toLowerCase())
              ).length === 0 && (
                <Col><p className="text-center">No users found.</p></Col>
              )}
            </Row>
            )}
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

export default CustomerControl;