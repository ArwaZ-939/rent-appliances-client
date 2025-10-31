// Import React and necessary hooks for state management, effects, and refs
import React, { useState, useEffect, useRef } from 'react';
// Import CSS styles for the payment page
import '../css/Payment.css';
// Import reusable component sections
import Footer from '../sections/Footer';
import Header from '../sections/Header';
// Import React Router hooks for navigation and accessing route state
import { useNavigate, useLocation } from 'react-router-dom';

// Main Payment component for handling payment information and processing
const Payment = () => {
  // Navigation hook to programmatically navigate to different routes
  const navigate = useNavigate();
  // Location hook to access state passed from previous route (RentalBooking page)
  const location = useLocation();

  // Refs for animation triggers - used to track DOM elements for scroll animations
  const orderSummaryRef = useRef(null); // Reference for order summary section
  const paymentSectionRef = useRef(null); // Reference for payment details section
  const buttonRef = useRef(null); // Reference for submit button

  // Destructure and retrieve state passed from RentalBooking component
  // Get the passed state from RentalBooking with fallback empty object
  const { totalAmount, finalAmount, appliance, days } = location.state || {};

  // State management for form data and user inputs
  // State for form data - tracks all form field values
  const [formData, setFormData] = useState({
    email: '', // User's email address
    paymentMethod: '', // Selected payment method (credit/debit/bank)
    cardNumber: '', // Credit/debit card number with formatting
    expiryDate: '', // Card expiry date in MM/YY format
    cvv: '', // Card security code
    startDate: '', // Rental start date
    endDate: '' // Calculated rental end date
  });

  // State for animations and UI feedback
  // State for animations - manages loading states and visual feedback
  const [isLoading, setIsLoading] = useState(false); // Tracks if payment is being processed
  const [fieldFocus, setFieldFocus] = useState(''); // Tracks which form field has focus for styling

  // State for calculated dates - manages rental period calculations
  const [calculatedEndDate, setCalculatedEndDate] = useState(''); // Stores calculated end date based on start date and duration

  // State to track if elements should be animated - controls scroll-triggered animations
  const [shouldAnimate, setShouldAnimate] = useState({
    orderSummary: false, // Controls order summary section animation
    paymentDetails: false, // Controls payment details section animation
    button: false // Controls submit button animation
  });

  // Intersection Observer for scroll animations - triggers animations when elements enter viewport
  useEffect(() => {
    // Create Intersection Observer to detect when elements become visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.id;
            // Enable animation for the element that entered viewport
            setShouldAnimate(prev => ({
              ...prev,
              [elementId]: true
            }));
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of element is visible
    );

    // Observe order summary section if ref exists
    if (orderSummaryRef.current) {
      orderSummaryRef.current.id = 'orderSummary'; // Set ID for tracking
      observer.observe(orderSummaryRef.current); // Start observing element
    }
    // Observe submit button if ref exists
    if (buttonRef.current) {
      buttonRef.current.id = 'button'; // Set ID for tracking
      observer.observe(buttonRef.current); // Start observing element
    }

    // Cleanup function - disconnect observer when component unmounts
    return () => observer.disconnect();
  }, []); // Empty dependency array - effect runs only once on mount

  // Calculate end date when start date or rental duration changes
  // Calculate end date when start date or days change
  useEffect(() => {
    // Only calculate if start date and rental duration are available
    if (formData.startDate && days) {
      const startDate = new Date(formData.startDate); // Parse start date
      const endDate = new Date(startDate); // Create end date from start date
      endDate.setDate(startDate.getDate() + (days * 7)); // Add weeks converted to days
      setCalculatedEndDate(endDate.toISOString().split('T')[0]); // Store calculated end date
      
      // Update form data with calculated end date
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0] // Store in YYYY-MM-DD format
      }));
    }
  }, [formData.startDate, days]); // Dependency array - effect runs when start date or days change

  // Generic input change handler for form fields
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Extract field name and value
    // Update form data state with new value
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Focus event handler for form fields with visual feedback
  // Handle focus with animation
  const handleFocus = (fieldName) => {
    setFieldFocus(fieldName); // Set currently focused field for styling
  };

  // Blur event handler to clear focus state
  // Handle blur
  const handleBlur = () => {
    setFieldFocus(''); // Clear focused field state
  };

  // Specialized handler for card number input with auto-formatting
  // Handle card number formatting
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, ''); // Remove spaces and non-digits
    value = value.replace(/(\d{4})/g, '$1 ').trim(); // Format as XXXX XXXX XXXX XXXX
    // Update form data with formatted card number
    setFormData(prev => ({
      ...prev,
      cardNumber: value
    }));
  };

  // Specialized handler for expiry date input with auto-formatting
  // Handle expiry date formatting
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    // Format as MM/YY after user enters 2 digits
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    // Update form data with formatted expiry date
    setFormData(prev => ({
      ...prev,
      expiryDate: value
    }));
  };

  // Utility function to get today's date in YYYY-MM-DD format for date input min attribute
  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]; // Return current date in YYYY-MM-DD format
  };

  // Utility function to get maximum date (1 year from now) for date input max attribute
  // Get max date (1 year from now)
  const getMaxDate = () => {
    const oneYearFromNow = new Date(); // Create date object for current date
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1); // Add 1 year
    return oneYearFromNow.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
  };

  // Utility function to format date string for user-friendly display
  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return ''; // Return empty string if no date provided
    const date = new Date(dateString); // Parse date string
    // Format as "Weekday, Month Day, Year" (e.g., "Monday, January 15, 2024")
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Form submission handler with loading state and navigation
  // Handle form submission with loading animation
  const handleDelivery = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    setIsLoading(true); // Set loading state to show processing indicator

    // Simulate payment processing with 2-second delay
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Prepare complete order data for next page
    // Prepare order data
    const orderData = {
      ...formData, // Include all form data
      totalAmount, // Rental amount without insurance
      finalAmount: finalAmount || (totalAmount + 20), // Total with insurance deposit
      appliance, // Appliance details
      days, // Rental duration
      rentalPeriod: {
        start: formData.startDate, // Rental start date
        end: calculatedEndDate // Calculated rental end date
      }
    };

    setIsLoading(false); // Clear loading state
    navigate('/delivery', { state: orderData }); // Navigate to delivery page with order data
  };

  // Helper function to generate animation styles based on element state
  // Get animation styles
  const getAnimationStyle = (element) => {
    // Return initial hidden state if element shouldn't animate yet
    if (!shouldAnimate[element]) {
      return {
        transform: element === 'orderSummary' ? 'translateY(30px)' : 
                   element === 'button' ? 'translateY(20px)' : 'translateX(-20px)',
        opacity: 0 // Fully transparent
      };
    }
    // Return final visible state with smooth transition
    return {
      transform: 'translateY(0) translateX(0)', // Reset to original position
      opacity: 1, // Fully visible
      transition: 'all 0.6s ease-out' // Smooth transition effect
    };
  };

  // Component render method - returns JSX for payment interface
  return (
    <div className="main-contact payment-page">
      <Header /> {/* Render header navigation component */}
      
      <div className="container contact-container">
        <div className="contact-content">
          <div className="contact-form">
            {/* Animated Title */}
            <h2 
              style={{ 
                color: '#7B4F2C', // Brand color
                animation: 'slideInDown 0.8s ease-out' // Entrance animation
              }}
            >
              Payment Information {/* Page heading */}
            </h2>
            
            {/* Conditional rendering - show order summary if appliance data exists */}
            {/* Display order summary with animation */}
            {appliance && (
              <div
                ref={orderSummaryRef} // Attach ref for scroll animation
                className="order-summary"
                style={{
                  backgroundColor: '#f8f9fa', // Light background
                  padding: '20px', // Internal spacing
                  borderRadius: '10px', // Rounded corners
                  marginBottom: '25px', // Space below section
                  border: '1px solid #dee2e6', // Subtle border
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Soft shadow
                  ...getAnimationStyle('orderSummary') // Apply dynamic animation styles
                }}
              >
                <h5 style={{ color: '#7B4F2C', margin: '0 0 15px 0', fontSize: '18px' }}>Order Summary</h5>
                <p style={{ margin: '8px 0' }}><strong>Item:</strong> {appliance.name}</p>
                <p style={{ margin: '8px 0' }}><strong>Rental Duration:</strong> {days} week(s)</p>
                
                {/* Conditional rendering - show rental period if dates are available */}
                {/* Rental Period Display */}
                {formData.startDate && calculatedEndDate && (
                  <div style={{ 
                    margin: '15px 0', 
                    padding: '12px', 
                    backgroundColor: '#e9ecef', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #7B4F2C' // Brand color accent
                  }}>
                    <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#7B4F2C' }}>Rental Period:</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                      <strong>Start:</strong> {formatDisplayDate(formData.startDate)}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                      <strong>End:</strong> {formatDisplayDate(calculatedEndDate)}
                    </p>
                  </div>
                )}
                
                <p style={{ margin: '8px 0' }}><strong>Rental Amount:</strong> {totalAmount} OMR</p>
                <p style={{ margin: '8px 0' }}><strong>Insurance Deposit:</strong> 20 OMR</p>
                <hr style={{ margin: '15px 0', borderColor: '#dee2e6' }} />
                <h5 style={{ color: '#7B4F2C', margin: '10px 0 0 0', fontSize: '20px' }}>
                  Final Amount: {finalAmount || (totalAmount + 20)} OMR
                </h5>
              </div>
            )}

            {/* Main payment form */}
            <form onSubmit={handleDelivery}>
              {/* Rental Period Selection */}
              <div className="form-group">
                <label htmlFor="startDate" style={{ fontWeight: '600', marginBottom: '8px' }}>
                  Rental Start Date <span className="text-danger">*</span>
                </label>
                <input 
                  type="date" // HTML5 date input
                  name="startDate" 
                  className="form-control"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    transition: 'all 0.3s ease', // Smooth transition for focus
                    fontSize: '16px'
                  }}
                  id="startDate" 
                  value={formData.startDate}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('startDate')} // Set focus state
                  onBlur={handleBlur} // Clear focus state
                  min={getTodayDate()} // Prevent past dates
                  max={getMaxDate()} // Limit to 1 year in future
                  required 
                />
                <small className="form-text text-muted" style={{ marginTop: '5px' }}>
                  Select when you want the rental period to begin
                </small>
              </div>

              {/* Conditional rendering - show calculated end date when available */}
              {/* Display calculated end date with animation */}
              {calculatedEndDate && (
                <div
                  style={{
                    backgroundColor: '#d4edda', // Success green background
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #c3e6cb',
                    borderLeft: '4px solid #28a745', // Success green accent
                    animation: 'scaleIn 0.5s ease-out' // Scale-in animation
                  }}
                >
                  <p style={{ margin: 0, color: '#155724', fontWeight: 'bold', fontSize: '15px' }}>
                    📅 Your rental will end on: {formatDisplayDate(calculatedEndDate)}
                  </p>
                </div>
              )}
              
              {/* Email input field */}
              <div className="form-group">
                <label htmlFor="email" style={{ fontWeight: '600', marginBottom: '8px' }}>
                  Email <span className="text-danger">*</span>
                </label>
                <input 
                  type="email" // HTML5 email input with validation
                  name="email" 
                  className="form-control"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${fieldFocus === 'email' ? '#7B4F2C' : '#e9ecef'}`, // Dynamic border color
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    boxShadow: fieldFocus === 'email' ? '0 0 0 3px rgba(123, 79, 44, 0.1)' : 'none' // Focus glow
                  }}
                  id="email" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  required 
                />
              </div>
              
              {/* Payment method selection dropdown */}
              <div className="form-group">
                <label htmlFor="paymentMethod" style={{ fontWeight: '600', marginBottom: '8px' }}>
                  Payment Method <span className="text-danger">*</span>
                </label>
                <select 
                  id="paymentMethod" 
                  name="paymentMethod"
                  className="form-control"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${fieldFocus === 'paymentMethod' ? '#7B4F2C' : '#e9ecef'}`,
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    boxShadow: fieldFocus === 'paymentMethod' ? '0 0 0 3px rgba(123, 79, 44, 0.1)' : 'none',
                    appearance: 'none', // Remove default dropdown styling
                    background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center/16px 16px`, // Custom dropdown arrow
                    backgroundColor: 'white'
                  }}
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('paymentMethod')}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="credit">Credit Card</option>
                  <option value="debit">Debit Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              {/* Conditional rendering - show card details when credit/debit card is selected */}
              {/* Card details - SHOW IMMEDIATELY when selected */}
              {(formData.paymentMethod === 'credit' || formData.paymentMethod === 'debit') && (
                <div className="payment-details" 
                  style={{
                    animation: 'slideInLeft 0.5s ease-out' // Slide-in from left animation
                  }}>
                  {/* Card number input with auto-formatting */}
                  <div className="form-group">
                    <label htmlFor="cardNumber" style={{ fontWeight: '600', marginBottom: '8px' }}>
                      Card Number <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="cardNumber" 
                      className="form-control"
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: `2px solid ${fieldFocus === 'cardNumber' ? '#7B4F2C' : '#e9ecef'}`,
                        transition: 'all 0.3s ease',
                        fontSize: '16px',
                        boxShadow: fieldFocus === 'cardNumber' ? '0 0 0 3px rgba(123, 79, 44, 0.1)' : 'none',
                        letterSpacing: '1px' // Space between card number groups
                      }}
                      id="cardNumber" 
                      placeholder="1234 5678 9012 3456" 
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange} // Specialized handler for formatting
                      onFocus={() => handleFocus('cardNumber')}
                      onBlur={handleBlur}
                      maxLength="19" // Limit to formatted card number length
                      required 
                    />
                  </div>

                  <div className="row">
                    {/* Expiry date input with auto-formatting */}
                    <div className="form-group col-md-6">
                      <label htmlFor="expiryDate" style={{ fontWeight: '600', marginBottom: '8px' }}>
                        Expiry Date <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="expiryDate" 
                        className="form-control"
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: `2px solid ${fieldFocus === 'expiryDate' ? '#7B4F2C' : '#e9ecef'}`,
                          transition: 'all 0.3s ease',
                          fontSize: '16px',
                          boxShadow: fieldFocus === 'expiryDate' ? '0 0 0 3px rgba(123, 79, 44, 0.1)' : 'none'
                        }}
                        id="expiryDate" 
                        placeholder="MM/YY" 
                        value={formData.expiryDate}
                        onChange={handleExpiryDateChange} // Specialized handler for formatting
                        onFocus={() => handleFocus('expiryDate')}
                        onBlur={handleBlur}
                        maxLength="5" // Limit to MM/YY format
                        required 
                      />
                    </div>
                    {/* CVV security code input */}
                    <div className="form-group col-md-6">
                      <label htmlFor="cvv" style={{ fontWeight: '600', marginBottom: '8px' }}>
                        CVV <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="cvv" 
                        className="form-control"
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: `2px solid ${fieldFocus === 'cvv' ? '#7B4F2C' : '#e9ecef'}`,
                          transition: 'all 0.3s ease',
                          fontSize: '16px',
                          boxShadow: fieldFocus === 'cvv' ? '0 0 0 3px rgba(123, 79, 44, 0.1)' : 'none'
                        }}
                        id="cvv" 
                        placeholder="123" 
                        value={formData.cvv}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus('cvv')}
                        onBlur={handleBlur}
                        maxLength="4" // Allow for 3 or 4 digit CVV
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional rendering - show bank transfer instructions when bank transfer is selected */}
              {/* Bank transfer details - SHOW IMMEDIATELY when selected */}
              {formData.paymentMethod === 'bank' && (
                <div 
                  className="bank-transfer-details"
                  style={{
                    backgroundColor: '#e7f3ff', // Info blue background
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    border: '1px solid #b3d9ff',
                    borderLeft: '4px solid #007bff', // Info blue accent
                    animation: 'slideInLeft 0.5s ease-out' // Slide-in animation
                  }}
                >
                  <h6 style={{ color: '#004085', marginBottom: '15px', fontSize: '16px' }}>Bank Transfer Instructions</h6>
                  <p style={{ margin: '8px 0', fontSize: '14px' }}>
                    <strong>Bank Name:</strong> AppliRent Services
                  </p>
                  <p style={{ margin: '8px 0', fontSize: '14px' }}>
                    <strong>Account Number:</strong> 1234 5678 9012
                  </p>
                  <p style={{ margin: '8px 0', fontSize: '14px' }}>
                    <strong>IBAN:</strong> OM12 1234 5678 9012 3456
                  </p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#856404', fontStyle: 'italic' }}>
                    Please include your full name as reference. Rental will be confirmed once payment is received.
                  </p>
                </div>
              )}

              {/* Submit Button with loading state and hover effects */}
              {/* Submit Button */}
              <button 
                ref={buttonRef} // Attach ref for scroll animation
                type="submit" 
                className="btn btn-submit"
                style={{ 
                  width: '100%', // Full width button
                  padding: '15px', // Comfortable padding
                  fontSize: '18px', // Large readable text
                  fontWeight: 'bold', // Emphasized text
                  borderRadius: '10px', // Rounded corners
                  border: 'none', // Remove default border
                  background: 'linear-gradient(45deg, #7B4F2C, #9C6F4A)', // Brand gradient
                  color: 'white', // Contrast text color
                  transition: 'all 0.3s ease', // Smooth hover transitions
                  marginTop: '10px', // Space above button
                  ...getAnimationStyle('button') // Apply dynamic animation styles
                }}
                disabled={isLoading} // Disable during processing
                onMouseOver={(e) => {
                  if (!isLoading) {
                    // Lift effect on hover
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(123, 79, 44, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    // Reset to normal state
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(123, 79, 44, 0.2)';
                  }
                }}
              >
                {isLoading ? (
                  // Loading state with spinner
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white', // Animated spinner
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite', // Rotating animation
                      marginRight: '10px'
                    }}></div>
                    Processing Payment... {/* Loading text */}
                  </div>
                ) : (
                  // Normal state with payment amount
                  `PAY ${finalAmount || (totalAmount + 20)} OMR`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer /> {/* Render footer component */}

      {/* Embedded CSS animations for the component */}
      {/* Add CSS styles for animations */}
      <style jsx>{`
        /* Spinner animation for loading state */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Scale-in animation for calculated end date */
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Slide-down animation for page title */
        @keyframes slideInDown {
          from {
            transform: translateY(-30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Slide-in from left animation for payment sections */
        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Page container styling */
        .payment-page {
          position: relative;
          overflow-x: hidden; /* Prevent horizontal scroll */
        }
      `}</style>
    </div>
  );
};

// Export the component for use in other parts of the application
export default Payment;