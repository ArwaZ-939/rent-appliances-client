import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  CardTitle,
  CardImg,
  Button,
  Spinner,
  CardText,
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupText
} from 'reactstrap';
import { useLocation } from 'react-router-dom';
import { DarkModeContext } from './DarkModeContext';

const ApplianceCards = ({ onRentClick }) => {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const location = useLocation();
  const { darkMode } = useContext(DarkModeContext);

  const fetchAppliances = async () => {
    try {
      const response = await axios.get('http://localhost:5000/getSpecificAppliance');
      setAppliances(response.data.Appliance || []);
    } catch (error) {
      console.error('Error fetching appliances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliances();
    const interval = setInterval(fetchAppliances, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.pathname === '/home' || location.pathname === '/') {
      fetchAppliances();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/suggestions?keyword=${searchTerm}`);
        setSuggestions(res.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };
    fetchSuggestions();
  }, [searchTerm]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
  };

  const formatPrice = (price) => {
    if (!price) return '';
    const cleanPrice = price.toString().trim();
    return cleanPrice.toUpperCase().includes('OR') ? cleanPrice : `${cleanPrice} OR`;
  };

  const handleRentClickInternal = (appliance) => {
    if (onRentClick) {
      const priceMatch = appliance.price.toString().match(/\d+/);
      const price = priceMatch ? parseInt(priceMatch[0]) : 0;
      onRentClick(price, appliance);
    }
  };

  const filteredAppliances = appliances.filter(appliance =>
    appliance.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center mt-4"><Spinner color="primary" /></div>;
  }

  return (
    <div className="mt-4 container">
      {/* 🔍 Search Bar */}
      <div style={{ position: 'relative', maxWidth: '450px', margin: '0 auto' }}>
        <InputGroup className="mb-3 shadow-sm">
          <Input
            type="text"
            placeholder="Search appliances..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={darkMode ? 'bg-dark text-light border-secondary' : ''}
          />
          <InputGroupText style={{ color: 'gray', cursor: 'pointer' }}>🔍</InputGroupText>
        </InputGroup>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: darkMode ? '#343a40' : '#fff',
            border: darkMode ? '1px solid #6c757d' : '1px solid #ccc',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            maxHeight: '150px',
            overflowY: 'auto',
            borderRadius: '8px',
          }}>
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: darkMode ? '1px solid #6c757d' : '1px solid #eee',
                  fontSize: '14px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#495057' : '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = darkMode ? '#343a40' : '#fff'}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🛒 Products Grid */}
      <Row
        xs="1"
        sm="2"
        md="3"
        lg="4"
        className="g-4 mt-4 justify-content-start"
        style={{ marginLeft: 0, marginRight: 0 }}
      >
        {filteredAppliances.length > 0 ? (
          filteredAppliances.map((appliance) => (
            <Col key={appliance._id} className="d-flex">
              <Card
                className={`shadow-sm w-100 border-0 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}
                style={{
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {appliance.imgUrl && (
                  <CardImg
                    top
                    src={appliance.imgUrl}
                    alt={appliance.name}
                    style={{
                      height: '220px',
                      objectFit: 'contain',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                      backgroundColor: '#f8f9fa',
                    }}
                  />
                )}
                <CardBody className="d-flex flex-column justify-content-between">
                  <div>
                    <CardTitle tag="h5" className={`mb-2 ${darkMode ? 'text-light' : 'text-primary'}`}>
                      {appliance.name}
                    </CardTitle>
                    <CardText className={`mb-2 ${darkMode ? 'text-light' : 'text-muted'}`}>
                      <strong>Price per day:</strong> {formatPrice(appliance.price)}
                    </CardText>
                    <CardText style={{ fontSize: '14px' }}>{appliance.details}</CardText>
                  </div>
                  <div className="mt-3">
                    <CardText className={appliance.available ? 'text-success' : 'text-danger'}>
                      {appliance.available ? 'Available' : 'Unavailable'}
                    </CardText>
                    <Button
                      color={darkMode ? "outline-light" : "primary"}
                      className="w-100 mt-2"
                      disabled={!appliance.available}
                      onClick={() => handleRentClickInternal(appliance)}
                    >
                      Rent Now
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p className={`text-center mt-4 ${darkMode ? 'text-light' : 'text-muted'}`}>No appliances found.</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ApplianceCards;