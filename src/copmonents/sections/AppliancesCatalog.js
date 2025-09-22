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

const ApplianceCards = () => {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handelBooking = () => {
    navigate("/Rental");
  };

  useEffect(() => {
    axios.get('http://localhost:3000/getSpecificAppliance')
      .then((res) => {
        setAppliances(res.data.Appliance || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching appliances:', error);
        setLoading(false);
      });
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
                {appliance.imgUrl && (
                  <CardImg top src={appliance.imgUrl} alt={appliance.name} style={{ height: '200px', objectFit: 'cover' }} />
                )}
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
