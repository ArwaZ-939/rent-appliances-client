import Footer from '../sections/Footer';
import Header from '../sections/Header';



const delivery = () => {

  const handleConfirm = (e) => {
    alert("The order will be delivered to you within 2 days at most")
  };

    return(
        <div className="main-contact">
    <Header />
    <div className="container contact-container">
      <div className="contact-content">
        <div>
        </div>
        <div className="contact-form">
          <h2 style={{ color: '#7B4F2C' }}>Delivery Information</h2>
          <form>
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="firstName">Area:<span className="text-danger"></span></label>
                <input type="text" name="area" className="form-control" id="area" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">House/Apartment Number:<span className="text-danger"></span></label>
              <input type="number" name="number" className="form-control" id="number" required />
            </div>
            <div className="form-group">
                <label htmlFor="message">Delivery Notes:<span className="text-danger"></span></label>
                <textarea name="message" className="form-control" id="message" rows="4"></textarea>
              </div>
            <button type="submit" className="btn btn-submit" onClick={handleConfirm}>Confirm</button>
          </form>
        </div>
      </div>
    </div>
    <Footer />

  </div>
    )
};

export default delivery;