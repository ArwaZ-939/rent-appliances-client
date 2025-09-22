import React from 'react';
import '../css/Home.css';
import Header from '../sections/Header';
import logo from '../assets/logoPNG.PNG';
import Footer from '../sections/Footer';
import {Row,Col} from 'reactstrap';
import ApplianceCards from '../sections/AppliancesCatalog';

const Home = () => {
  
  return (
    <div className='container1'>
      <Header />
      <section className="header">
        <div className="container1">
          <h1 className="brown-text" style={{ color: '#7B4F2C' }}>Renting Household Appliances</h1>
          <br/>
          <img src={logo} alt="Profile"  width="400px" height="400px" />
        </div>
      </section>
      <div className="content-row">
        <div className="column1">
        </div>
        <div className="column2">
        </div>
        <Row className="justify-content-center">
        <Col xs="12" md="8" className="px-md-5 px-3">
            <ApplianceCards />
          </Col>
        </Row>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
