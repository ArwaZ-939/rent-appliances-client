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
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = 'https://via.placeholder.com/400x200?text=No+Image';

function normalizeImageUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_IMAGE;
  const url = rawUrl.trim();
  // If starts with http/https, encode and return
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return encodeURI(url);
  }
  // If starts with www., assume https
  if (url.startsWith('www.')) {
    return encodeURI(`https://${url}`);
  }
  // If starts with /, treat as same-origin path
  if (url.startsWith('/')) {
    return `${window.location.origin}${encodeURI(url)}`;
  }
  // Otherwise, fallback to assuming it's a server-relative path on API host
  return encodeURI(`http://localhost:5000/${url}`);
}

const ApplianceCards = () => {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handelBooking = () => {
    navigate("/Rental");
  };

  const fetchAppliances = () => {
    setLoading(true);
    axios.get('http://localhost:5000/getSpecificAppliance')
      .then((res) => {
        setAppliances(res.data.Appliance || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching appliances:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppliances();
  }, []);

  // Listen for deletions performed on other pages (DeleteAppliances)
  useEffect(() => {
    const onDeleted = (e) => {
      const id = e?.detail?.id;
      if (!id) return;
      setAppliances(prev => prev.filter(a => a._id !== id));
    };
    const onRefresh = () => fetchAppliances();
    window.addEventListener('appliance:deleted', onDeleted);
    window.addEventListener('appliance:refresh', onRefresh);
    return () => {
      window.removeEventListener('appliance:deleted', onDeleted);
      window.removeEventListener('appliance:refresh', onRefresh);
    };
  }, []);

  // Filter appliances based on search term (case-insensitive)
  const filteredAppliances = appliances.filter(appliance =>
    appliance.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center mt-4"><Spinner color="primary" /></div>;
  }

  return (
    <div className="mt-3">
      {/* Search Box */}
      <InputGroup className="mb-3">
  <Input
    type="text"
    placeholder="Search appliances..."
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
  />
  <InputGroupText style={{ color: 'gray', marginLeft: '8px' }}>🔍</InputGroupText>
</InputGroup>

      <br/>
      <br/>

      <Row xs="1" sm="2" md="3" lg="4">
        {filteredAppliances.length > 0 ? (
          filteredAppliances.map((appliance) => (
            <Col key={appliance._id} className="mb-4">
              <Card className="shadow-sm h-100">
                <CardImg
                  top
                  src={normalizeImageUrl(appliance.imgUrl)}
                  alt={appliance.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                />
                <CardBody>
                  <CardTitle tag="h5">{appliance.name}</CardTitle>
                  <CardText><strong>Price:</strong> {appliance.price}</CardText>
                  <CardText>{appliance.details}</CardText>
                  <CardText className={appliance.available ? "text-success" : "text-danger"}>
                    {appliance.available ? "Available" : "Unavailable"}
                  </CardText>
                  <Button color="primary" disabled={!appliance.available} onClick={handelBooking}>Rent</Button>
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
