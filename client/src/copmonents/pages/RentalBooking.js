// Import necessary CSS, image, components, and hooks
import '../css/Contact.css'; // Styles for the contact/rental booking page
import rental from '../assets/rental.avif'; // Image used on the booking page
import Footer from '../sections/Footer'; // Footer component
import Header from '../sections/Header'; // Header component
import { useNavigate, useLocation } from 'react-router-dom'; // Hooks for navigation and accessing passed state
import { useState, useEffect } from 'react'; // React hooks for managing state and side effects
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // Add axios for API calls

// Main RentalBooking component for handling appliance rental reservations
const RentalBooking = () => {
  const { t } = useTranslation();
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
  const [insuranceDeposit, setInsuranceDeposit] = useState(0); // Insurance deposit amount (50% of total)
  const [userInfo, setUserInfo] = useState({ email: '', user: '' }); // User info for notifications
  const [isSendingNotifications, setIsSendingNotifications] = useState(false); // Track notification sending state

  // Effect hook to initialize component state when component mounts or location.state changes
  // Set initial state from the location (router state) when component loads
  useEffect(() => {
    // Check if there's state data passed from the previous route (ProductDetails page)
    if (location.state) {
      setPricePerDay(location.state.price || 0); // Get price per day from passed state or default to 0
      setTotalAmount(location.state.price || 0); // Set initial total amount (1 day rental)
      setAppliance(location.state.appliance || null); // Store appliance object with name/details
    }
    
    // Fetch user info for notifications
    const fetchUserInfo = async () => {
      const username = localStorage.getItem('username');
      if (username) {
        try {
          const response = await axios.get(`http://localhost:5000/getUserProfile/${username}`);
          if (response.data) {
            setUserInfo({
              email: response.data.email,
              user: response.data.user
            });
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };
    
    fetchUserInfo();
  }, [location.state]); // Dependency array - effect runs when location.state changes

  // Effect hook to recalculate total amount and insurance deposit whenever rental duration, rental period, or price changes
  // Update total amount and insurance deposit whenever `days`, `rentalPeriod` or `pricePerDay` changes
  useEffect(() => {
    let calculatedAmount;
    if (rentalPeriod === 'weeks') {
      calculatedAmount = days * pricePerDay * 7; // Calculate total: weeks × 7 days × price per day
    } else {
      calculatedAmount = days * pricePerDay; // Calculate total: days × price per day
    }
    setTotalAmount(calculatedAmount); // Update state with new calculated amount
    
    // Calculate insurance deposit as 50% of the total amount
    const deposit = calculatedAmount * 0.5;
    setInsuranceDeposit(deposit);
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

  // Format currency with 3 decimal places
  const formatCurrency = (amount) => {
    return amount.toFixed(3);
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

  // Function to send Email using your backend API
  const sendEmail = async (toEmail, subject, message) => {
    try {
      console.log('Sending email to:', toEmail);
      console.log('Email subject:', subject);
      
      // Use your backend API endpoint
      const response = await fetch('http://localhost:5000/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userInfo.user || 'Customer',
          notificationType: 'email',
          message: message,
          email: toEmail
        })
      });

      console.log('Backend response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Email sent successfully via backend:', result);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('Failed to send email via backend. Status:', response.status);
        console.error('Error details:', errorText);
        
        return { success: false, error: `Status ${response.status}: ${errorText}` };
      }
    } catch (error) {
      console.error('Error sending email via backend:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to send SMS using your backend API (FIXED)
  const sendSMS = async (toPhoneNumber, message) => {
    try {
      console.log('Sending SMS to:', toPhoneNumber);
      
      // Use your backend API endpoint instead of direct Twilio call
      const response = await fetch('http://localhost:5000/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userInfo.user || 'Customer',
          notificationType: 'sms',
          message: message,
          phoneNumber: toPhoneNumber
        })
      });

      console.log('Backend SMS response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('SMS sent successfully via backend:', result);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('Failed to send SMS via backend. Status:', response.status);
        console.error('Error details:', errorText);
        
        return { success: false, error: `Status ${response.status}: ${errorText}` };
      }
    } catch (error) {
      console.error('Error sending SMS via backend:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to send notifications based on user preferences
  const sendRentalNotification = async () => {
    setIsSendingNotifications(true);
    
    // Get notification preferences from localStorage
    const savedPreferences = localStorage.getItem('notificationPreferences');
    let notificationPreferences = {
      email: false,
      sms: false,
      phoneNumber: ''
    };
    
    console.log('Raw saved preferences from localStorage:', savedPreferences);
    
    if (savedPreferences) {
      try {
        notificationPreferences = JSON.parse(savedPreferences);
        console.log('Parsed notification preferences:', notificationPreferences);
      } catch (error) {
        console.error('Error parsing notification preferences:', error);
        setIsSendingNotifications(false);
        return { success: false, error: 'Invalid notification preferences' };
      }
    }
    
    // Check if user wants notifications
    if (notificationPreferences.email || notificationPreferences.sms) {
      // Prepare notification message
      const notificationMessage = `Your rental booking for ${appliance.name} has been confirmed!\n\nOrder Details:\n- Rental Period: ${days} ${rentalPeriod === 'weeks' ? 'weeks' : 'days'}\n- Start Date: ${formatDisplayDate(startDate)}\n- End Date: ${formatDisplayDate(calculatedEndDate)}\n- Total Amount: ${totalAmount.toFixed(3)} OMR\n- Insurance Deposit: ${insuranceDeposit.toFixed(3)} OMR\n- Final Amount: ${(totalAmount + insuranceDeposit).toFixed(3)} OMR\n\nThank you for choosing AppliRent!`;
      
      console.log('User notification preferences:', {
        email: notificationPreferences.email,
        sms: notificationPreferences.sms,
        hasEmail: !!userInfo.email,
        hasPhone: !!notificationPreferences.phoneNumber,
        userEmail: userInfo.email,
        userPhone: notificationPreferences.phoneNumber
      });
      
      const promises = [];
      const results = [];
      
      // Send email notification
      if (notificationPreferences.email && userInfo.email) {
        console.log('Attempting to send email to:', userInfo.email);
        const emailPromise = sendEmail(
          userInfo.email,
          'Rental Booking Confirmation',
          notificationMessage
        ).then(result => {
          console.log('Email send result:', result);
          results.push({ type: 'email', success: result.success, error: result.error });
          return result;
        }).catch(error => {
          console.error('Failed to send email notification:', error);
          results.push({ type: 'email', success: false, error: error.message });
          return { success: false, error: error.message };
        });
        promises.push(emailPromise);
      } else if (notificationPreferences.email && !userInfo.email) {
        console.log('Email notifications enabled but no user email found');
        results.push({ type: 'email', success: false, error: 'No email address found' });
      }
      
      // Send SMS notification
      if (notificationPreferences.sms && notificationPreferences.phoneNumber) {
        console.log('Attempting to send SMS to:', notificationPreferences.phoneNumber);
        const smsPromise = sendSMS(
          notificationPreferences.phoneNumber,
          notificationMessage
        ).then(result => {
          console.log('SMS send result:', result);
          results.push({ type: 'sms', success: result.success, error: result.error });
          return result;
        }).catch(error => {
          console.error('Failed to send SMS notification:', error);
          results.push({ type: 'sms', success: false, error: error.message });
          return { success: false, error: error.message };
        });
        promises.push(smsPromise);
      } else if (notificationPreferences.sms && !notificationPreferences.phoneNumber) {
        console.log('SMS notifications enabled but no phone number found');
        results.push({ type: 'sms', success: false, error: 'No phone number found' });
      }
      
      // Wait for all notifications to complete (or fail)
      if (promises.length > 0) {
        try {
          console.log('Waiting for notifications to complete...');
          await Promise.allSettled(promises);
          console.log('All notification promises settled');
          
          // Check if any notifications were successful
          const successfulNotifications = results.filter(result => result.success);
          
          if (successfulNotifications.length > 0) {
            console.log(`${successfulNotifications.length} notification(s) sent successfully`);
            return { success: true, results: results };
          } else {
            console.log('No notifications were sent successfully');
            return { success: false, results: results, error: 'Failed to send notifications' };
          }
        } catch (error) {
          console.error('Error sending notifications:', error);
          return { success: false, error: error.message, results: results };
        }
      } else {
        console.log('No notifications to send (no enabled methods with valid contact info)');
        return { success: false, error: 'No valid contact information found for notifications', results: [] };
      }
    } else {
      console.log('No notification preferences enabled by user');
      return { success: true, results: [], message: 'Notifications not enabled by user' };
    }
  };

  // Form submission handler - processes rental booking and navigates to payment page
  // Handle form submission: navigate to the payment page with necessary state
  const handlePayment = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)

    // Validate Oman phone number
    if (phoneNumber.length !== 8 || !['7', '9'].includes(phoneNumber[0])) {
      alert(t('rentalBooking.validPhoneNumber'));
      return;
    }

    // Validate start date
    if (!startDate) {
      alert(t('rentalBooking.selectStartDate'));
      return;
    }

    const finalAmount = totalAmount + insuranceDeposit;
    
    // Send notifications based on user preferences
    try {
      console.log('Starting to send notifications...');
      const notificationResult = await sendRentalNotification();
      
      if (notificationResult.success) {
        console.log('Notifications sent successfully:', notificationResult);
      } else {
        console.log('Notifications failed or partially failed:', notificationResult);
        // Don't block the user if notification fails
        // You could show a warning message here if you want
        // alert('Notifications could not be sent, but your booking will proceed.');
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't block the user if notification fails
    } finally {
      setIsSendingNotifications(false);
    }

    // Navigate to payment page with all necessary data as route state
    navigate('/payment', {
      state: {
        totalAmount, // Pass rental amount without insurance deposit
        insuranceDeposit, // Pass insurance deposit amount
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

              {/* Show loading indicator when sending notifications */}
              {isSendingNotifications && (
                <div className="alert alert-info" role="alert">
                  Sending notifications... Please wait.
                </div>
              )}

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
                  {t('rentalBooking.importantNotice')}
                </h5>
                {/* Deposit amount information */}
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                  A 50% insurance deposit is required for all rentals.
                </p>
                {/* Deposit terms and conditions */}
                <p style={{ margin: 0, fontSize: '14px' }}>
                  {t('rentalBooking.depositTerms')}
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
                  <strong>{t('rentalBooking.rentalPeriod')}:</strong> {days} {rentalPeriod === 'weeks' ? t('rentalBooking.weeks') : t('rentalBooking.days')} ({rentalPeriod === 'weeks' ? days * 7 : days} {t('rentalBooking.days')})
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
                      {t('rentalBooking.rentalDates')}
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>
                      <strong>{t('rentalBooking.start')}</strong> {formatDisplayDate(startDate)}
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>
                      <strong>{t('rentalBooking.end')}</strong> {formatDisplayDate(calculatedEndDate)}
                    </p>
                  </div>
                )}
                
                {/* Rental amount line */}
                <h4 style={{ color: '#7B4F2C', margin: '0 0 5px 0' }}>
                  {t('rentalBooking.rentalAmount')}: {formatCurrency(totalAmount)} OMR
                </h4>
                {/* Insurance deposit line */}
                <h4 style={{ color: '#7B4F2C', margin: '0 0 5px 0' }}>
                  Insurance Deposit (50%): {formatCurrency(insuranceDeposit)} OMR
                </h4>
                {/* Final total amount with visual separator */}
                <h4 style={{ color: '#7B4F2C', margin: 0, borderTop: '1px solid #dee2e6', paddingTop: '5px' }}>
                  {t('rentalBooking.finalAmount')}: {formatCurrency(totalAmount + insuranceDeposit)} OMR
                </h4>
              </div>

              {/* Main rental booking form */}
              {/* Rental booking form */}
              <form onSubmit={handlePayment}>
                {/* Rental period selection radio buttons */}
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    {t('rentalBooking.rentalPeriod')} <span className="text-danger">*</span>
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
                        {t('rentalBooking.rentByDays')}
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
                        {t('rentalBooking.rentByWeeks')}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Rental duration input section */}
                {/* Rental duration input */}
                <div className="row">
                  <div className="form-group">
                    <label htmlFor="days">
                      {t('rentalBooking.numberOfDays')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number" // Numeric input type
                      name="days" // Form field name
                      className="form-control" // Bootstrap form control class
                      id="days" // Input ID for label association
                      placeholder={t('rentalBooking.numberOfDaysPlaceholder', { period: rentalPeriod === 'weeks' ? t('rentalBooking.weeks') : t('rentalBooking.days') })} // Dynamic placeholder
                      value={days} // Controlled component value
                      onChange={handleDaysChange} // Change event handler
                      min="1" // Minimum value constraint
                      required // HTML5 required attribute
                    />
                    <small className="form-text text-muted">
                      {rentalPeriod === 'weeks'
                        ? t('rentalBooking.equivalentDays', { days: days * 7 })
                        : t('rentalBooking.daysOfRental', { days })
                      }
                    </small>
                  </div>
                </div>

                {/* Rental Start Date input */}
                <div className="form-group">
                  <label htmlFor="startDate" style={{ fontWeight: '600', marginBottom: '8px' }}>
                    {t('rentalBooking.startDate')} <span className="text-danger">*</span>
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
                    {t('rentalBooking.selectWhen')}
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
                      📅 {t('rentalBooking.rentalEndsOn')} {formatDisplayDate(calculatedEndDate)}
                    </p>
                  </div>
                )}

                {/* Delivery location input */}
                {/* Place of delivery input */}
                <div className="form-group">
                  <label htmlFor="place">{t('rentalBooking.place')} <span className="text-danger">*</span></label>
                  <input
                    type="text" // Text input type
                    name="place" // Form field name
                    className="form-control" // Bootstrap form control class
                    id="place" // Input ID for label association
                    placeholder={t('rentalBooking.placeOfDelivery')} // Placeholder text
                    required // HTML5 required attribute
                  />
                </div>

                {/* Contact phone number input */}
                {/* Phone number input */}
                <div className="form-group">
                  <label htmlFor="phone">{t('rentalBooking.phoneNumber')} <span className="text-danger">*</span></label>
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
                    {t('rentalBooking.phoneHint')}
                  </small>
                </div>

                {/* Optional additional comments/instructions */}
                {/* Optional comments */}
                <div className="form-group">
                  <label htmlFor="message">{t('rentalBooking.comments')}</label>
                  <textarea
                    name="message" // Form field name
                    className="form-control" // Bootstrap form control class
                    id="message" // Textarea ID for label association
                    rows="4" // Visible rows count
                    placeholder={t('rentalBooking.yourComments')} // Placeholder text
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
                      {t('rentalBooking.agreeToTerms')}
                    </label>
                  </div>
                </div>

                <br />
                {/* Form submission button with conditional enabling */}
                {/* Submit button */}
                <button
                  type="submit" // Button type for form submission
                  className="btn btn-submit" // CSS classes for styling
                  disabled={!agreedToTerms || phoneNumber.length !== 8 || !startDate || isSendingNotifications} // Disable button until terms are agreed, phone is valid, and start date is selected
                  style={{
                    opacity: (agreedToTerms && phoneNumber.length === 8 && startDate && !isSendingNotifications) ? 1 : 0.6, // Visual feedback for disabled state
                    cursor: (agreedToTerms && phoneNumber.length === 8 && startDate && !isSendingNotifications) ? 'pointer' : 'not-allowed' // Cursor feedback
                  }}
                >
                  {isSendingNotifications ? 'Sending Notifications...' : t('rentalBooking.proceedToPayment')} {/* Button text */}
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