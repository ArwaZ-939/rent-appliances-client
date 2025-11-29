import Footer from '../sections/Footer';
import Header from '../sections/Header';


const Help = () => {
    return(
        <>
        <div className="main-contact">
    <Header />
    <div className="container contact-container">
      <div className="contact-content">
        <div>
        </div>
        <div className="contact-form">
          <h2 style={{ color: '#7B4F2C' }}>Return Policy</h2>
          <form>
          <div className="modal-body">
                
                <h5>1. Return Window:</h5>
                <h5>1. Return Window:</h5>
                <p>Rented appliances can be returned within 3 hours of delivery if they are defective, damaged, or not as described..</p>
                
                <h5>2. Condition of Return</h5>
                <p>The appliance must be returned in the same condition it was delivered — clean, undamaged, and with all accessories included..</p>
                
                <h5>3. Return Process:</h5>
                <p><strong>Contact our support team at "RentingHA3@gmail.com" or call us at "98939395".</strong> A pickup will be scheduled within 3 business hours.

                    <ul>
                        <li>The device will be inspected and approved.</li>
                        <li>If the customer wants to return the device before the expiry of the period, an amount will be returned (to be agreed upon by the customer and the renter).</li>
                    </ul>
                </p>
                <h5>4. Late Return Penalty:</h5>
                <p>Returns made after the agreed rental period may incur additional charges unless an extension was pre-approved.</p>  
                <h5>5. The admin can block the user if he violates these policies twice.</h5>
                <h5>6. Return Policy: </h5>
                <p>Upon the expiry of the agreed-upon period, the renter will be contacted to arrange a convenient time for the device to be collected.</p>                            
            </div>
          </form>
        </div>
      </div>
    </div>
    <Footer />

  </div>
        
        </>
    )
};

export default Help;
