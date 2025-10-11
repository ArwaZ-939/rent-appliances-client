import React, { useEffect, useState } from 'react';
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

const ApplianceCards = ({ onRentClick }) => {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const location = useLocation();

  const fetchAppliances = async () => {
    try {
      console.log('Fetching appliances from server...');
      const response = await axios.get('http://localhost:3000/getSpecificAppliance');
      console.log('Received appliances:', response.data.Appliance);
      setAppliances(response.data.Appliance || []);
    } catch (error) {
      console.error('Error fetching appliances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliances();

    const interval = setInterval(() => {
      console.log('Auto-refreshing appliances...');
      fetchAppliances();
    }, 10000);

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
    <div className="mt-3">
      <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
        <InputGroup className="mb-2">
          <Input
            type="text"
            placeholder="Search appliances..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <InputGroupText style={{ color: 'gray', marginLeft: '8px' }}>🔍</InputGroupText>
        </InputGroup>

        {suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #ccc',
            listStyle: 'none',
            padding: '5px',
            margin: 0,
            maxHeight: '150px',
            overflowY: 'auto',
          }}>
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px'
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <br /><br />

      <Row xs="1" sm="2" md="3" lg="4">
        {filteredAppliances.length > 0 ? (
          filteredAppliances.map((appliance) => (
            <Col key={appliance._id} className="mb-4">
              <Card className="shadow-sm h-100">
                {appliance.imgUrl && (
                  <CardImg
                    top
                    src={appliance.imgUrl}
                    alt={appliance.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <CardBody>
                  <CardTitle tag="h5">{appliance.name}</CardTitle>
                  <CardText><strong>Price per day:</strong> {formatPrice(appliance.price)}</CardText>
                  <CardText>{appliance.details}</CardText>
                  <CardText className={appliance.available ? "text-success" : "text-danger"}>
                    {appliance.available ? "Available" : "Unavailable"}
                  </CardText>
                  <Button
                    color="primary"
                    disabled={!appliance.available}
                    onClick={() => handleRentClickInternal(appliance)}
                  >
                    Rent
                  </Button>
                </CardBody>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-center">No appliances found.</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ApplianceCards;