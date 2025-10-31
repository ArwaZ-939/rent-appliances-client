// Import necessary CSS, image, components, and hooks
import '../css/Contact.css'; // Styles for the contact/rental booking page
import rental from '../assets/rental.avif'; // Image used on the booking page
import Footer from '../sections/Footer'; // Footer component
import Header from '../sections/Header'; // Header component
import { useNavigate, useLocation } from 'react-router-dom'; // Hooks for navigation and accessing passed state
import { useState, useEffect, useContext } from 'react'; // React hooks for managing state and side effects
import { DarkModeContext } from '../sections/DarkModeContext';

// Main RentalBooking component for handling appliance rental reservations
const RentalBooking = () => {
  // Navigation hook to programmatically navigate between pages
  const navigate = useNavigate(); // Used to navigate to the payment page
  
  // Location hook to access state passed from previous route (ProductDetails page)
  const location = useLocation(); // Used to access the state passed from the previous route
  const { darkMode } = useContext(DarkModeContext);

  // State management for rental booking form
  // States to manage rental duration, pricing, and selected appliance
  const [days, setDays] = useState(1); // Default rental duration is 1 day
  const [totalAmount, setTotalAmount] = useState(0); // Total cost of rental (days * pricePerDay)
  const [pricePerDay, setPricePerDay] = useState(0); // Cost per day for the selected appliance
  const [appliance, setAppliance] = useState(null); // Appliance data passed from previous page (name, details, etc.)
  const [agreedToTerms, setAgreedToTerms] = useState(false); // Track if user agreed to insurance deposit terms

  // Effect hook to initialize component state when component mounts or location.state changes
  // Set initial state from the location (router state) when component loads
  useEffect(() => {
    // Check if there's state data passed from the previous route (ProductDetails page)
    if (location.state) {
      setPricePerDay(location.state.price || 0); // Get price per day from passed state or default to 0
      setTotalAmount(location.state.price || 0); // Set initial total amount (1 day rental)
      setAppliance(location.state.appliance || null); // Store appliance object with name/details
    }
  }, [location.state]); // Dependency array - effect runs when location.state changes

  // Effect hook to recalculate total amount whenever rental duration or price changes
  // Update total amount whenever `days` or `pricePerDay` changes
  useEffect(() => {
    const calculatedAmount = days * pricePerDay; // Calculate total: days × price per day
    setTotalAmount(calculatedAmount); // Update state with new calculated amount
  }, [days, pricePerDay]); // Dependency array - effect runs when days or pricePerDay changes

  // Event handler for rental duration input changes
  // Handle changes in the input field for number of days
  const handleDaysChange = (e) => {
    const numberOfDays = parseInt(e.target.value) || 1; // Parse input value, default to 1 if invalid
    setDays(numberOfDays > 0 ? numberOfDays : 1); // Ensure minimum of 1 day, prevent negative values
  };

  // Event handler for insurance terms agreement checkbox
  // Handle checkbox change for terms agreement
  const handleAgreementChange = (e) => {
    setAgreedToTerms(e.target.checked); // Update state based on checkbox checked status
  };

  // Form submission handler - processes rental booking and navigates to payment page
  // Handle form submission: navigate to the payment page with necessary state
  const handlePayment = (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    const finalAmount = totalAmount + 20; // Calculate final amount: rental total + 20 OMR insurance deposit
    
    // Navigate to payment page with all necessary data as route state
    navigate('/payment', { 
      state: { 
        totalAmount, // Pass rental amount without insurance deposit
        finalAmount, // Include final amount with insurance deposit added
        appliance, // Pass appliance details for order summary
        days // Pass rental duration for order processing
      } 
    });
  };

  // Component render method - returns JSX for rental booking interface
  return (
    <>
      {/* Main container for the rental booking page */}
      <div className={`main-contact ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <Header /> {/* Top navigation/header component */}

        {/* Main content container with responsive layout */}
        <div className="container contact-container">
          <div className="contact-content">
           
            {/* Left side - decorative image section */}
            {/* Left side image */}
            <div>
              <img
                src={rental} // Rental-related image from assets
                alt="Woman working on laptop" // Accessibility description
                className="contact-image" // CSS class for styling
                height="600px" // Fixed height for consistent layout
                width="600px" // Fixed width for consistent layout
              />
            </div>

            {/* Right side - rental booking form section */}
            {/* Right side form */}
            <div className="contact-form">
              {/* Page heading */}
              <h2 style={{ color: '#7B4F2C' }}>Rental booking</h2>
             
              {/* Conditional rendering - show appliance info if available */}
              {/* Show appliance info if available */}
              {appliance && (
                <div
                  className="appliance-info"
                  style={{
                    backgroundColor: '#f8f9fa', // Light gray background
                    padding: '15px', // Internal spacing
                    borderRadius: '5px', // Rounded corners
                    marginBottom: '15px', // Space below the section
                    border: '1px solid #dee2e6' // Light border
                  }}
                >
                  {/* Appliance name with brand color */}
                  <h5 style={{ color: '#7B4F2C', margin: 0 }}>Renting: {appliance.name}</h5>
                  {/* Appliance description/details */}
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{appliance.details}</p>
                </div>
              )}

              {/* Insurance deposit information section with warning styling */}
              {/* Insurance Deposit Notice */}
              <div
                className="insurance-notice"
                style={{
                  backgroundColor: '#fff3cd', // Warning yellow background
                  padding: '15px', // Internal spacing
                  borderRadius: '5px', // Rounded corners
                  marginBottom: '15px', // Space below the section
                  border: '1px solid #ffeaa7', // Warning border color
                  color: '#856404' // Warning text color
                }}
              >
                {/* Notice heading */}
                <h5 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                  Important Notice – Refundable Insurance Deposit
                </h5>
                {/* Deposit amount information */}
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                  Please note that an additional amount of 20 OMR will be added to your total as a refundable insurance deposit.
                </p>
                {/* Deposit terms and conditions */}
                <p style={{ margin: 0, fontSize: '14px' }}>
                  This deposit will be fully refunded upon the return of the rented product on time and in good condition (i.e., no damage, crashes, or excessive wear).
                </p>
              </div>

              {/* Pricing breakdown section showing rental cost calculation */}
              {/* Total rental cost */}
              <div
                className="total-amount-section"
                style={{
                  backgroundColor: '#e9ecef', // Light gray background
                  padding: '15px', // Internal spacing
                  borderRadius: '5px', // Rounded corners
                  marginBottom: '20px', // Space below the section
                  border: '1px solid #dee2e6' // Light border
                }}
              >
                {/* Rental amount line */}
                <h4 style={{ color: '#7B4F2C', margin: '0 0 5px 0' }}>
                  Rental Amount: {totalAmount} OMR
                </h4>
                {/* Insurance deposit line */}
                <h4 style={{ color: '#7B4F2C', margin: '0 0 5px 0' }}>
                  Insurance Deposit: 20 OMR
                </h4>
                {/* Final total amount with visual separator */}
                <h4 style={{ color: '#7B4F2C', margin: 0, borderTop: '1px solid #dee2e6', paddingTop: '5px' }}>
                  Final Amount: {totalAmount + 20} OMR
                </h4>
              </div>

              {/* Main rental booking form */}
              {/* Rental booking form */}
              <form onSubmit={handlePayment}>
                {/* Rental duration input section */}
                {/* Rental duration input */}
                <div className="row">
                  <div className="form-group">
                    <label htmlFor="days">Days <span className="text-danger">*</span></label>
                    <input
                      type="number" // Numeric input type
                      name="days" // Form field name
                      className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      id="days" // Input ID for label association
                      placeholder="Number of days to rent" // Placeholder text
                      value={days} // Controlled component value
                      onChange={handleDaysChange} // Change event handler
                      min="1" // Minimum value constraint
                      required // HTML5 required attribute
                    />
                  </div>
                </div>

                {/* Delivery location input */}
                {/* Place of delivery input */}
                <div className="form-group">
                  <label htmlFor="place">Place <span className="text-danger">*</span></label>
                  <input
                    type="text" // Text input type
                    name="place" // Form field name
                    className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    id="place" // Input ID for label association
                    placeholder="Place of delivery" // Placeholder text
                    required // HTML5 required attribute
                  />
                </div>

                {/* Contact phone number input */}
                {/* Phone number input */}
                <div className="form-group">
                  <label htmlFor="phone">Phone Number <span className="text-danger">*</span></label>
                  <input
                    type="number" maxLength={8}// Telephone input type for better mobile experience
                    name="phone" // Form field name
                    className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    id="phone" // Input ID for label association
                    placeholder="Phone Number" // Placeholder text
                    required // HTML5 required attribute
                  />
                </div>

                {/* Optional additional comments/instructions */}
                {/* Optional comments */}
                <div className="form-group">
                  <label htmlFor="message">Comments</label>
                  <textarea
                    name="message" // Form field name
                    className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    id="message" // Textarea ID for label association
                    rows="4" // Visible rows count
                    placeholder="Your Comments" // Placeholder text
                  ></textarea>
                </div>

                {/* Terms and conditions agreement checkbox */}
                {/* Agreement checkbox */}
                <div className="form-group">
                  <div className="form-check">
                    <input
                      type="checkbox" // Checkbox input type
                      className="form-check-input" // Bootstrap checkbox class
                      id="agreement" // Checkbox ID for label association
                      checked={agreedToTerms} // Controlled component value
                      onChange={handleAgreementChange} // Change event handler
                      required // HTML5 required attribute
                    />
                    <label className="form-check-label" htmlFor="agreement">
                      I agree to the terms and conditions regarding the refundable insurance deposit
                    </label>
                  </div>
                </div>

                <br/>
                {/* Form submission button with conditional enabling */}
                {/* Submit button */}
                <button 
                  type="submit" // Button type for form submission
                  className={`btn btn-submit ${darkMode ? 'btn-outline-light' : 'btn-primary'}`}
                  disabled={!agreedToTerms} // Disable button until terms are agreed
                  style={{
                    opacity: agreedToTerms ? 1 : 0.6, // Visual feedback for disabled state
                    cursor: agreedToTerms ? 'pointer' : 'not-allowed' // Cursor feedback
                  }}
                >
                  PROCEED TO PAYMENT {/* Button text */}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Page footer component */}
        {/* Bottom of the page */}
        <Footer />
      </div>
    </>
  );
};

// Export the component for use in other parts of the application
export default RentalBooking;