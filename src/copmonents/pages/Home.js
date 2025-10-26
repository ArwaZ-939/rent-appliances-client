import React, { useContext } from 'react';
import '../css/Home.css';
import Header from '../sections/Header';
import logo from '../assets/logoPNG.jpg'; 
import Footer from '../sections/Footer';
import { Row, Col } from 'reactstrap';
import ApplianceCards from '../sections/AppliancesCatalog';
import { useNavigate } from 'react-router-dom';
import { DarkModeContext } from '../sections/DarkModeContext';

const Home = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext);

  const handleRentClick = (price, appliance) => {
    navigate('/Rental', {
      state: {
        price: price,
        appliance: appliance,
      },
    });
  };

  return (
    <div className={`container1 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <Header />
      <section className={`header ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className="container1">
          <h1 className={`brown-text ${darkMode ? 'text-light' : ''}`} style={{ color: darkMode ? '#ffffff' : '#7B4F2C' }}>Renting Household Appliances</h1>
          <br />
          <img src={logo} alt="Profile" width="400px" height="400px" />
        </div>
      </section>
      <div className={`content-row ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className="column1"></div>
        <div className="column2"></div>
        <Row className="justify-content-center">
          <Col xs="12" md="8" className="px-md-5 px-3">
            <ApplianceCards onRentClick={handleRentClick} />
          </Col>
        </Row>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
