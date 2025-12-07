import React, { useEffect, useState } from 'react';
import "../css/Admin.css";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Spinner, Input, Button } from "reactstrap";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CustomerChat = () => {
  const { t, i18n } = useTranslation();
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [usersWithMessages, setUsersWithMessages] = useState([]);
  const [lastViewed, setLastViewed] = useState({});
  const [readChats, setReadChats] = useState(new Set());
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const Profiler = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  const user = { gender: 'Female', user: 'Admin' };
  const dfimg = 'https://static.vecteezy.com/system/resources/thumbnails/013/360/247/small/default-avatar-photo-icon-social-media-profile-sign-symbol-vector.jpg';
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const now = new Date();
      now.setSeconds(now.getSeconds() + 1);
      setLastViewed(prev => ({
        ...prev,
        [selectedUser]: now.toISOString()
      }));
      setReadChats(prev => new Set([...prev, selectedUser]));
    }
  }, [selectedUser]);

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/getFeedback');
      const chatMsgs = (response.data || []).filter(f => f.email === 'CHAT_MESSAGE');
      setChatMessages(chatMsgs);
      const uniqueUsers = [...new Set(chatMsgs.map(msg => msg.user))];
      setUsersWithMessages(uniqueUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      setDialogMessage(t('customerChat.failedToLoad'));
        setShowDialog(true);
      setLoading(false);
    }
  };

  const getUserMessages = (username) => {
    return chatMessages
      .filter(msg => msg.user === username)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const handleUserSelect = (username) => {
    const now = new Date();
    now.setSeconds(now.getSeconds() + 1);
    const timestamp = now.toISOString();
    setLastViewed(prev => ({ ...prev, [username]: timestamp }));
    setReadChats(prev => new Set([...prev, username]));
    setSelectedUser(username);
  };

  const getUnreadCount = (username) => {
    const lastViewedTime = lastViewed[username];
    if (!lastViewedTime) {
      return getUserMessages(username).filter(m => !m.message.startsWith('[ADMIN REPLY]')).length;
    }
    return getUserMessages(username).filter(m => {
      const msgTime = new Date(m.createdAt);
      const viewedTime = new Date(lastViewedTime);
      return msgTime > viewedTime && !m.message.startsWith('[ADMIN REPLY]');
    }).length;
  };

  // Generate autocomplete suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const filtered = usersWithMessages
      .filter(user => user.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5); // Limit to 5 suggestions
    
    setSearchSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchTerm, usersWithMessages]);

  const sendAdminReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      setDialogMessage(t('customerChat.pleaseEnterMessage'));
      setShowDialog(true);
      return;
    }
    
    if (!selectedUser) {
      setDialogMessage(t('customerChat.pleaseSelectUser'));
      setShowDialog(true);
      return;
    }

    const messageToSend = replyMessage.trim();

    try {
      const response = await axios.post('http://localhost:5000/addFeedback', {
        user: selectedUser,
        message: `[ADMIN REPLY] ${messageToSend}`,
        email: 'CHAT_MESSAGE',
        rating: 0
      });

      setReplyMessage('');
      await fetchChatMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      setDialogMessage(`${t('customerChat.failedToSend')}: ${error.response?.data?.message || error.message}`);
      setShowDialog(true);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('common.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('common.yesterday');
    } else {
      const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
      return date.toLocaleDateString(locale, { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleSignOut = () => navigate('/');
  const handleAddAppliances = () => navigate('/admin');
  const handleDeleteAppliances = () => navigate('/delete-appliances');
  const handleUpdateAppliances = () => navigate('/update-appliances');
  const handleCustomerControl = () => navigate('/customer-control');
  const handleCustomerFeedback = () => navigate('/customer-feedback');
  const handleCustomerChat = () => navigate('/customer-chat');

  return (
    <div className="admin-panel">
      <div className="sidebar">
        <div className="profile text-center mb-4">
          <img src={Profiler ? Profiler : dfimg} alt="Profile" className="rounded-circle mb-2" />
          <p className="user-role">{t('common.admin')}</p>
          <p>{user.gender === 'Male' ? t('profile.mr') : t('profile.ms')} {user.user}</p>
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

      <div style={{
        marginLeft: '250px',
        padding: '30px',
        minHeight: '100vh',
        backgroundColor: '#f5f7fa'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          height: 'calc(100vh - 60px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '25px 30px',
            borderBottom: '2px solid #e8ecf0',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                <i className="bi bi-chat-dots-fill me-3" style={{ color: '#7B4F2C' }}></i>
                {t('customerChat.title')}
              </h2>
              <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                {t('customerChat.subtitle')}
              </p>
            </div>
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#6c757d'
            }}>              
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Users List */}
            <div style={{
              width: '240px',
              borderRight: '2px solid #e8ecf0',
              backgroundColor: '#fafbfc',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Search Bar */}
              <div style={{ padding: '15px', borderBottom: '1px solid #e8ecf0' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder={t('customerChat.searchUsers')}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      if (searchSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 15px 12px 40px',
                      border: '2px solid #e8ecf0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                    }}
                    autoComplete="off"
                  />
                  <i className="bi bi-search" style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d'
                  }}></i>
                  
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <ul style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      background: '#fff',
                      border: '1px solid #e8ecf0',
                      borderRadius: '8px',
                      listStyle: 'none',
                      padding: 0,
                      margin: '5px 0 0 0',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}>
                      {searchSuggestions.map((user, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setSearchTerm(user);
                            setShowSuggestions(false);
                            handleUserSelect(user);
                          }}
                          style={{
                            padding: '12px 15px',
                            cursor: 'pointer',
                            borderBottom: idx < searchSuggestions.length - 1 ? '1px solid #eee' : 'none',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          {user}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Users List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <>
                    {usersWithMessages
                      .filter(user => user.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((user) => {
                        const userMsgs = getUserMessages(user);
                        const lastMessage = userMsgs[userMsgs.length - 1];
                        const totalUserMessages = userMsgs.filter(m => !m.message.startsWith('[ADMIN REPLY]')).length;
                        const isCurrentlyOpen = selectedUser === user;
                        const hasBeenViewed = lastViewed[user] !== undefined;
                        const unreadCount = isCurrentlyOpen ? 0 : getUnreadCount(user);
                        const isRead = isCurrentlyOpen ? true : (hasBeenViewed && unreadCount === 0);
                        
                        return (
                          <div
                            key={user}
                            onClick={() => handleUserSelect(user)}
                            style={{
                              padding: '14px',
                              marginBottom: '8px',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              backgroundColor: isCurrentlyOpen ? '#7B4F2C' : 'white',
                              color: isCurrentlyOpen ? 'white' : '#1a1a1a',
                              border: isRead && !isCurrentlyOpen ? '2px solid #28a745' : '2px solid transparent',
                              boxShadow: isCurrentlyOpen ? '0 4px 12px rgba(123, 79, 44, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrentlyOpen) {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                e.currentTarget.style.transform = 'translateX(5px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrentlyOpen) {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '8px'
                              }}>
                                <div style={{
                                  width: '45px',
                                  height: '45px',
                                  borderRadius: '50%',
                                  backgroundColor: isCurrentlyOpen ? 'rgba(255,255,255,0.2)' : '#7B4F2C',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: isCurrentlyOpen ? 'white' : 'white',
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  flexShrink: 0
                                }}>
                                  {user.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    marginBottom: '4px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {user}
                                    {isRead && !isCurrentlyOpen && (
                                      <i className="bi bi-check-circle-fill ms-2" style={{ color: '#28a745', fontSize: '14px' }}></i>
                                    )}
                                  </div>
                                  {lastMessage && (
                                    <div style={{
                                      fontSize: '13px',
                                      color: isCurrentlyOpen ? 'rgba(255,255,255,0.8)' : '#6c757d',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {lastMessage.message.startsWith('[ADMIN REPLY]') 
                                        ? lastMessage.message.replace('[ADMIN REPLY]', '')
                                        : lastMessage.message}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {unreadCount > 0 && (
                              <div style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {unreadCount}
                              </div>
                            )}
                            {isRead && unreadCount === 0 && totalUserMessages > 0 && (
                              <div style={{
                                backgroundColor: 'white',
                                color: '#333',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                border: '1px solid #dee2e6',
                                flexShrink: 0
                              }}>
                                {totalUserMessages}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    {usersWithMessages.filter(user => user.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                        <i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block', marginBottom: '15px', opacity: 0.5 }}></i>
                        <p>{t('customerChat.noChatsFound')}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div style={{
                    padding: '20px 30px',
                    borderBottom: '2px solid #e8ecf0',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#7B4F2C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        {selectedUser.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
                          {selectedUser}
                        </h3>
                        {readChats.has(selectedUser) && (
                          <span style={{ fontSize: '13px', color: '#28a745', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i className="bi bi-check-circle-fill"></i>
                            {t('common.read')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '50px 70px',
                    backgroundColor: '#f8f9fa',
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}>
                    {getUserMessages(selectedUser).map((msg, index) => {
                      const isAdmin = msg.message.startsWith('[ADMIN REPLY]');
                      const messageText = isAdmin ? msg.message.replace('[ADMIN REPLY]', '') : msg.message;
                      const showDate = index === 0 || 
                        new Date(msg.createdAt).toDateString() !== new Date(getUserMessages(selectedUser)[index - 1].createdAt).toDateString();
                      
                      return (
                        <div key={msg._id || index}>
                          {showDate && (
                            <div style={{
                              textAlign: 'center',
                              margin: '25px 0',
                              color: '#6c757d',
                              fontSize: '13px',
                              fontWeight: '500',
                              position: 'relative'
                            }}>
                              <span style={{
                                backgroundColor: '#f8f9fa',
                                padding: '5px 15px',
                                borderRadius: '20px',
                                border: '1px solid #e8ecf0'
                              }}>
                                {formatDate(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div style={{
                            display: 'flex',
                            justifyContent: isAdmin ? 'flex-start' : 'flex-end',
                            marginBottom: '20px',
                            animation: 'fadeIn 0.3s ease'
                          }}>
                            <div style={{
                              maxWidth: '80%',
                              padding: '20px 28px',
                              borderRadius: '18px',
                              backgroundColor: isAdmin ? '#e9ecef' : '#7B4F2C',
                              color: isAdmin ? '#1a1a1a' : 'white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              position: 'relative',
                              lineHeight: '1.8',
                              fontSize: '17px',
                              fontWeight: '400'
                            }}>
                              <div style={{ marginBottom: '8px', wordWrap: 'break-word' }}>
                                {messageText}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                opacity: 0.7,
                                textAlign: 'right',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '5px',
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: `1px solid ${isAdmin ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`
                              }}>
                                <span>{formatTime(msg.createdAt)}</span>
                                {!isAdmin && readChats.has(selectedUser) && (
                                  <i className="bi bi-check2-all" style={{ color: '#28a745' }}></i>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={sendAdminReply} style={{
                    padding: '20px 30px',
                    borderTop: '2px solid #e8ecf0',
                    backgroundColor: 'white',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <Input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={t('customerChat.typeReply', { user: selectedUser })}
                      style={{
                        flex: 1,
                        padding: '12px 18px',
                        border: '2px solid #e8ecf0',
                        borderRadius: '12px',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#7B4F2C'}
                      onBlur={(e) => e.target.style.borderColor = '#e8ecf0'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (replyMessage.trim() && selectedUser) {
                            sendAdminReply(e);
                          }
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      disabled={!replyMessage.trim() || !selectedUser}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: (!replyMessage.trim() || !selectedUser) ? '#ccc' : '#7B4F2C',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: (!replyMessage.trim() || !selectedUser) ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (replyMessage.trim() && selectedUser) {
                          e.target.style.backgroundColor = '#6B4423';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (replyMessage.trim() && selectedUser) {
                          e.target.style.backgroundColor = '#7B4F2C';
                        }
                      }}
                    >
                      <i className="bi bi-send-fill"></i>
                      {t('common.send')}
                    </Button>
                  </form>
                </>
              ) : (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#6c757d'
                }}>
                  <i className="bi bi-chat-left-text" style={{ fontSize: '80px', display: 'block', marginBottom: '20px', opacity: 0.3 }}></i>
                  <h3 style={{ color: '#1a1a1a', marginBottom: '10px' }}>{t('customerChat.selectUserToView')}</h3>
                  <p style={{ fontSize: '14px' }}>{t('customerChat.selectUserDescription')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Modal isOpen={showDialog} toggle={() => setShowDialog(false)}>
        <ModalHeader toggle={() => setShowDialog(false)}>{t('customerChat.message')}</ModalHeader>
        <ModalBody>
          <p>{dialogMessage}</p>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CustomerChat;
