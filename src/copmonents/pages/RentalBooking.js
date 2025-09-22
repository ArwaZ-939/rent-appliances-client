import '../css/Contact.css';
import rental from '../assets/rental.avif';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import { useNavigate } from 'react-router-dom';



const RentalBooking =() => {
  const navigator = useNavigate();

  const handelPayment = () => {
    navigator('/payment')
  }

    return(
        <>
        <div className="main-contact">
      <Header />
      <div className="container contact-container">
        <div className="contact-content">
          <div>
            <img src={rental} alt="Woman working on laptop" className="contact-image" height="600px" width="600px"/>
          </div>
          <div className="contact-form">
            <h2 style={{ color: '#7B4F2C' }}>Rental booking</h2>
            <form>
              <div className="row">
                <div className="form-group">
                  <label htmlFor="firstName">Day <span className="text-danger">*</span></label>
                  <input type="number" name="firstName" className="form-control" id="firstName" placeholder="To rent the device" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Place <span className="text-danger">*</span></label>
                <input type="text" name="text" className="form-control" id="place" placeholder="Place of delivery" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Phone Number <span className="text-danger">*</span></label>
                <input type="number" name="email" className="form-control" id="number" placeholder="Phone Number" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Comments <span className="text-danger">*</span></label>
                <textarea name="message" className="form-control" id="message" rows="4" placeholder="Your Comments"></textarea>
              </div>
            <br/>
              <button type="submit" className="btn btn-submit" onClick={handelPayment}>SUBMIT</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />

      {/* Modal for Success/Error Message */}

    </div>
        </>
    )
}

export default RentalBooking;