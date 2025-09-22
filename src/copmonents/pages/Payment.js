import React from 'react';
import '../css/Payment.css';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import { useNavigate } from 'react-router-dom';

const Payment = () => {

    const navigate = useNavigate()

    const handelDelivery = () => {
        navigate('/delivery')
    }

  return (
    <div className="main-contact">
    <Header />
    <div className="container contact-container">
      <div className="contact-content">
        <div>
        </div>
        <div className="contact-form">
          <h2 style={{ color: '#7B4F2C' }}>Personal Information</h2>
          <form>
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="firstName">Full Name <span className="text-danger">*</span></label>
                <input type="text" name="firstName" className="form-control" id="firstName" placeholder="Full Name" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email <span className="text-danger">*</span></label>
              <input type="email" name="email" className="form-control" id="email" placeholder="Email" required />
            </div>
            <div className="form-group">
            <select id="payment-method" required>
                <option value="">Select Payment Method</option>
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
                <option value="bank">Bank Transfer</option>
            </select>
            </div>
            <button type="submit" className="btn btn-submit" onClick={handelDelivery}>Complete Payment</button>
          </form>
        </div>
      </div>
    </div>
    <Footer />

  </div>
  );
};

export default Payment;
