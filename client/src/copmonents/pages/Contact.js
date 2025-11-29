import React, { useState, useEffect, useRef, useContext } from 'react';
import '../css/Contact.css';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import axios from 'axios';
import { DarkModeContext } from '../sections/DarkModeContext';
import { Input, Button } from 'reactstrap';
import contact from '../assets/contact.webp';

const Contact = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const shouldAutoScrollRef = useRef(true);
  const { darkMode } = useContext(DarkModeContext);

  // Get username from localStorage and fetch messages
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchMessages(storedUsername);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => fetchMessages(storedUsername), 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchMessages = async (username) => {
    try {
      const response = await axios.get('http://localhost:5000/getFeedback');
      // Filter chat messages for this user (email === 'CHAT_MESSAGE')
      const chatMsgs = (response.data || [])
        .filter(f => f.email === 'CHAT_MESSAGE' && f.user === username)
        .map(msg => ({
          _id: msg._id,
          user: msg.user,
          message: msg.message,
          isAdmin: msg.message.startsWith('[ADMIN REPLY]'),
          createdAt: msg.createdAt
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(chatMsgs);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Auto-scroll to bottom only when new messages are actually added
  useEffect(() => {
    // Only auto-scroll if:
    // 1. A new message was added (messages length increased)
    // 2. We're at the bottom (shouldAutoScrollRef is true)
    const currentLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;
    
    if (shouldAutoScrollRef.current && currentLength > prevLength) {
      scrollToBottom();
    }
    
    prevMessagesLengthRef.current = currentLength;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Track scroll position to determine if user is at bottom
  const handleScroll = (e) => {
    const container = e.target;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    shouldAutoScrollRef.current = isAtBottom;
  };

  // Send message using existing Feedback API
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !username) {
      return;
    }

    setLoading(true);
    try {
      // Use existing Feedback API to send message (marked as chat message)
      await axios.post('http://localhost:5000/addFeedback', {
        user: username,
        message: newMessage.trim(),
        email: 'CHAT_MESSAGE', // Mark as chat message
        rating: 0
      });

      setNewMessage('');
      // Enable auto-scroll when user sends a message
      shouldAutoScrollRef.current = true;
      // Refresh messages to show the new one
      setTimeout(() => fetchMessages(username), 500);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
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
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className={`main-contact ${darkMode ? 'bg-dark text-light' : ''}`} style={{ minHeight: '100vh' }}>
      <Header />
      <div className="container contact-container" style={{ marginTop: '100px', paddingBottom: '50px' }}>
        <div className="contact-content" style={{ 
          display: 'flex',
          gap: '30px',
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>
          {/* Image Section */}
          <div style={{ 
            flex: '0 0 auto',
            minWidth: '300px'
          }} className="d-none d-md-block">
            <img 
              src={contact} 
              alt="Customer Support" 
              className="contact-image" 
              style={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>

          {/* Chat Section */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            maxWidth: '600px',
            height: '70vh'
          }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: darkMode ? 'rgba(123, 79, 44, 0.1)' : 'rgba(123, 79, 44, 0.05)',
              borderRadius: '10px'
            }}>
              <h2 style={{ color: '#7B4F2C', margin: 0 }}>
                <i className="bi bi-chat-dots-fill me-2"></i>
                Customer Support Chat
              </h2>
              <p style={{ color: darkMode ? '#aaa' : '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
                Chat with our support team
              </p>
            </div>

          {/* Messages Container */}
          <div 
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa',
              borderRadius: '10px',
              marginBottom: '20px',
              border: darkMode ? '1px solid rgba(123, 79, 44, 0.2)' : '1px solid #dee2e6'
            }}
            onScroll={handleScroll}
          >
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: darkMode ? '#aaa' : '#666'
              }}>
                <i className="bi bi-chat-left-text" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
                <p>No messages yet. Start the conversation!</p>
                <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
                  Your messages will be sent to our support team
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = !msg.isAdmin;
                const messageText = msg.isAdmin ? msg.message.replace('[ADMIN REPLY]', '').trim() : msg.message;
                const showDate = index === 0 || 
                  new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                
                return (
                  <div key={msg._id || index}>
                    {showDate && (
                      <div style={{
                        textAlign: 'center',
                        margin: '15px 0',
                        color: darkMode ? '#888' : '#999',
                        fontSize: '12px'
                      }}>
                        {formatDate(msg.createdAt)}
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        backgroundColor: isUser 
                          ? (darkMode ? '#7B4F2C' : '#7B4F2C')
                          : (darkMode ? '#495057' : '#e9ecef'),
                        color: isUser ? '#fff' : (darkMode ? '#fff' : '#333'),
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ marginBottom: '5px' }}>
                          {messageText}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          opacity: 0.7,
                          textAlign: 'right'
                        }}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className={darkMode ? 'bg-dark text-light border-secondary' : ''}
              disabled={loading || !username}
              style={{ flex: 1 }}
            />
            <Button
              type="submit"
              className="btn-submit"
              disabled={loading || !newMessage.trim() || !username}
              style={{
                backgroundColor: '#7B4F2C',
                border: 'none',
                padding: '10px 25px',
                fontWeight: 'bold'
              }}
            >
              {loading ? (
                <i className="bi bi-hourglass-split"></i>
              ) : (
                <>
                  <i className="bi bi-send-fill me-2"></i>
                  Send
                </>
              )}
            </Button>
          </form>

            {!username && (
              <div style={{
                textAlign: 'center',
                padding: '15px',
                backgroundColor: darkMode ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                borderRadius: '8px',
                marginTop: '15px',
                color: '#dc3545'
              }}>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Please log in to use the chat feature.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
