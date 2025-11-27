// Import necessary CSS, image, components, and hooks
import '../css/Contact.css'; // Styles for the contact/rental booking page
import rental from '../assets/rental.avif'; // Image used on the booking page
import Footer from '../sections/Footer'; // Footer component
import Header from '../sections/Header'; // Header component
import { useNavigate, useLocation } from 'react-router-dom'; // Hooks for navigation and accessing passed state
import { useState, useEffect } from 'react'; // React hooks for managing state and side effects


// Main RentalBooking component for handling appliance rental reservations
const RentalBooking = () => {
  // Navigation hook to programmatically navigate between pages
  const navigate = useNavigate(); // Used to navigate to the payment page

  // Location hook to access state passed from previous route (ProductDetails page)
  const location = useLocation(); // Used to access the state passed from the previous route


  // State management for rental booking form
  // States to manage rental duration, pricing, and selected appliance
  const [days, setDays] = useState(1); // Default rental duration is 1 day
  const [totalAmount, setTotalAmount] = useState(0); // Total cost of rental (days * pricePerDay)
  const [pricePerDay, setPricePerDay] = useState(0); // Cost per day for the selected appliance
  const [appliance, setAppliance] = useState(null); // Appliance data passed from previous page (name, details, etc.)
  const [agreedToTerms, setAgreedToTerms] = useState(false); // Track if user agreed to insurance deposit terms
  const [rentalPeriod, setRentalPeriod] = useState('days'); // 'days' or 'weeks'
  const [phoneNumber, setPhoneNumber] = useState(''); // Oman phone number
  const [startDate, setStartDate] = useState(''); // Rental start date
  const [calculatedEndDate, setCalculatedEndDate] = useState(''); // Calculated rental end date


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


  // Effect hook to recalculate total amount whenever rental duration, rental period, or price changes
  // Update total amount whenever `days`, `rentalPeriod` or `pricePerDay` changes
  useEffect(() => {
    let calculatedAmount;
    if (rentalPeriod === 'weeks') {
      calculatedAmount = days * pricePerDay * 7; // Calculate total: weeks × 7 days × price per day
    } else {
      calculatedAmount = days * pricePerDay; // Calculate total: days × price per day
    }
    setTotalAmount(calculatedAmount); // Update state with new calculated amount
  }, [days, pricePerDay, rentalPeriod]); // Dependency array - effect runs when days, pricePerDay or rentalPeriod changes


  // Calculate end date when start date or rental duration changes
  useEffect(() => {
    if (startDate && days) {
      const start = new Date(startDate);
      const end = new Date(start);
      
      if (rentalPeriod === 'weeks') {
        end.setDate(start.getDate() + (days * 7));
      } else {
        end.setDate(start.getDate() + days);
      }

      setCalculatedEndDate(end.toISOString().split('T')[0]);
    }
  }, [startDate, days, rentalPeriod]);


  // Utility function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };


  // Utility function to get maximum date (1 year from now)
  const getMaxDate = () => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow.toISOString().split('T')[0];
  };


  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  // Event handler for rental duration input changes
  // Handle changes in the input field for number of days/weeks
  const handleDaysChange = (e) => {
    const numberOfDays = parseInt(e.target.value) || 1; // Parse input value, default to 1 if invalid
    setDays(numberOfDays > 0 ? numberOfDays : 1); // Ensure minimum of 1 day/week, prevent negative values
  };


  // Event handler for rental period radio button changes
  // Handle rental period selection (days/weeks)
  const handleRentalPeriodChange = (e) => {
    setRentalPeriod(e.target.value);
  };


  // Event handler for Oman phone number formatting
  // Handle Oman phone number input with validation
  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters

    // Ensure number starts with 7 or 9 and has max 8 digits
    if (value.length > 0) {
      const firstDigit = value[0];
      if (firstDigit !== '7' && firstDigit !== '9') {
        value = ''; // Clear if doesn't start with 7 or 9
      } else if (value.length > 8) {
        value = value.substring(0, 8); // Limit to 8 digits
      }
    }

    setPhoneNumber(value);
  };


  // Event handler for start date changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
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

    // Validate Oman phone number
    if (phoneNumber.length !== 8 || !['7', '9'].includes(phoneNumber[0])) {
      alert('Please enter a valid Oman phone number (8 digits starting with 7 or 9)');
      return;
    }

    // Validate start date
    if (!startDate) {
      alert('Please select a rental start date');
      return;
    }

    const finalAmount = totalAmount + 20; // Calculate final amount: rental total + 20 OMR insurance deposit

    // Navigate to payment page with all necessary data as route state
    navigate('/payment', {
      state: {
        totalAmount, // Pass rental amount without insurance deposit
        finalAmount, // Include final amount with insurance deposit added
        appliance, // Pass appliance details for order summary
        days, // Pass rental duration for order processing
        rentalPeriod, // Pass rental period type (days/weeks)
        startDate, // Pass rental start date
        endDate: calculatedEndDate // Pass calculated end date
      }
    });
  };


  // Component render method - returns JSX for rental booking interface
  return (
    <>
      {/* Main container for the rental booking page */}
      <div className="main-contact">
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
                  {/* Display price per day */}
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                    Price: {pricePerDay} OMR per day
                  </p>
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
                {/* Rental period and duration info */}
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                  <strong>Rental Period:</strong> {days} {rentalPeriod} ({rentalPeriod === 'weeks' ? days * 7 : days} days)
                </p>
                
                {/* Rental dates display */}
                {startDate && calculatedEndDate && (
                  <div style={{
                    margin: '10px 0',
                    padding: '10px',
                    backgroundColor: '#d4edda',
                    borderRadius: '5px',
                    borderLeft: '4px solid #28a745'
                  }}>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold', color: '#155724' }}>
                      Rental Dates:
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>
                      <strong>Start:</strong> {formatDisplayDate(startDate)}
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>
                      <strong>End:</strong> {formatDisplayDate(calculatedEndDate)}
                    </p>
                  </div>
                )}
                
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
                {/* Rental period selection radio buttons */}
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Rental Period <span className="text-danger">*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="rentDays"
                        name="rentalPeriod"
                        value="days"
                        checked={rentalPeriod === 'days'}
                        onChange={handleRentalPeriodChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="rentDays">
                        Rent by Days
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="rentWeeks"
                        name="rentalPeriod"
                        value="weeks"
                        checked={rentalPeriod === 'weeks'}
                        onChange={handleRentalPeriodChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="rentWeeks">
                        Rent by Weeks
                      </label>
                    </div>
                  </div>
                </div>

                {/* Rental duration input section */}
                {/* Rental duration input */}
                <div className="row">
                  <div className="form-group">
                    <label htmlFor="days">
                      Number of {rentalPeriod} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number" // Numeric input type
                      name="days" // Form field name
                      className="form-control" // Bootstrap form control class
                      id="days" // Input ID for label association
                      placeholder={`Number of ${rentalPeriod} to rent`} // Dynamic placeholder
                      value={days} // Controlled component value
                      onChange={handleDaysChange} // Change event handler
                      min="1" // Minimum value constraint
                      required // HTML5 required attribute
                    />
                    <small className="form-text text-muted">
                      {rentalPeriod === 'weeks'
                        ? `Equivalent to ${days * 7} days of rental`
                        : `${days} day(s) of rental`
                      }
                    </small>
                  </div>
                </div>

                {/* Rental Start Date input */}
                <div className="form-group">
                  <label htmlFor="startDate" style={{ fontWeight: '600', marginBottom: '8px' }}>
                    Rental Start Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      transition: 'all 0.3s ease',
                      fontSize: '16px'
                    }}
                    id="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    min={getTodayDate()}
                    max={getMaxDate()}
                    required
                  />
                  <small className="form-text text-muted" style={{ marginTop: '5px' }}>
                    Select when you want the rental period to begin
                  </small>
                </div>

                {/* Display calculated end date */}
                {calculatedEndDate && (
                  <div
                    style={{
                      backgroundColor: '#d4edda',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      border: '1px solid #c3e6cb',
                      borderLeft: '4px solid #28a745',
                    }}
                  >
                    <p style={{ margin: 0, color: '#155724', fontWeight: 'bold', fontSize: '14px' }}>
                      📅 Your rental will end on: {formatDisplayDate(calculatedEndDate)}
                    </p>
                  </div>
                )}

                {/* Delivery location input */}
                {/* Place of delivery input */}
                <div className="form-group">
                  <label htmlFor="place">Place <span className="text-danger">*</span></label>
                  <input
                    type="text" // Text input type
                    name="place" // Form field name
                    className="form-control" // Bootstrap form control class
                    id="place" // Input ID for label association
                    placeholder="Place of delivery" // Placeholder text
                    required // HTML5 required attribute
                  />
                </div>


                {/* Contact phone number input */}
                {/* Phone number input */}
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Oman) <span className="text-danger">*</span></label>
                  <input
                    type="tel" // Telephone input type for better mobile experience
                    name="phone" // Form field name
                    className="form-control" // Bootstrap form control class
                    id="phone" // Input ID for label association
                    placeholder="7XXXXXXX or 9XXXXXXX" // Oman format placeholder
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    pattern="[79][0-9]{7}" // Pattern for Oman numbers
                    maxLength="8" // 8 digits maximum
                    required // HTML5 required attribute
                  />
                  <small className="form-text text-muted">
                    Please enter an 8-digit Oman number starting with 7 or 9
                  </small>
                </div>


                {/* Optional additional comments/instructions */}
                {/* Optional comments */}
                <div className="form-group">
                  <label htmlFor="message">Comments</label>
                  <textarea
                    name="message" // Form field name
                    className="form-control" // Bootstrap form control class
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


                <br />
                {/* Form submission button with conditional enabling */}
                {/* Submit button */}
                <button
                  type="submit" // Button type for form submission
                  className="btn btn-submit" // CSS classes for styling
                  disabled={!agreedToTerms || phoneNumber.length !== 8 || !startDate} // Disable button until terms are agreed, phone is valid, and start date is selected
                  style={{
                    opacity: (agreedToTerms && phoneNumber.length === 8 && startDate) ? 1 : 0.6, // Visual feedback for disabled state
                    cursor: (agreedToTerms && phoneNumber.length === 8 && startDate) ? 'pointer' : 'not-allowed' // Cursor feedback
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