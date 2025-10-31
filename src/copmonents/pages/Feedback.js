import '../css/Feedback.css'
import Footer from '../sections/Footer'
import Header from '../sections/Header'
import React, { useState } from 'react';



const Feedback = () => {

  const [rating, setRating] = useState(0);

  const handleStarClick = (index) => {
    setRating(index);
  };
  
  return (
    <div className='main-contact'>
    <Header/>
    <div className="container contact-container">
            <div className="contact-content">
              <div className="contact-form">
                <h2 style={{ color: '#7B4F2C' }}>Feedback</h2>
                <form>
                  <div className="form-group">
                    <textarea name="message" className="form-control" id="message" rows="4" placeholder="Your Feedback" required></textarea>
                  </div>
                  <button type="submit" className="btn btn-submit">SUBMIT</button>
                  <br />
              <div className="stars" id="starRating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${rating >= star ? 'selected' : ''}`}
                    onClick={() => handleStarClick(star)}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
                </form>
              </div>
            </div>
          </div>
          

    <Footer/>
    </div>
  )
}

export default Feedback;
