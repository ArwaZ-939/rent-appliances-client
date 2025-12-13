// Import component sections and React hooks
import Footer from '../sections/Footer'; // Footer component for consistent page footer
import Header from '../sections/Header'; // Header component for navigation
import { useState, useEffect } from 'react'; // React hooks for state management and side effects
import { useLocation } from 'react-router-dom'; // Hook to access route state
import axios from 'axios'; // For API calls
import '../css/Delivery.css'; // CSS styles for delivery page animations, form styling, and layout
import { useTranslation } from 'react-i18next';

// Main Delivery component for handling delivery information, form validation, and order tracking
const Delivery = () => {
  const { t } = useTranslation();
  const location = useLocation(); // Get order data from previous route
  const orderData = location.state || {}; // Order data from Payment page
  
  // State management for delivery form, UI interactions, and progress tracking
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks if form is being submitted (loading state)
  const [showSuccess, setShowSuccess] = useState(false); // Controls visibility of success message and timeline
  const [currentStep, setCurrentStep] = useState(1); // Tracks current step in delivery timeline (1-5)
  const [progress, setProgress] = useState(0); // Tracks overall progress percentage (0-100%)
  const [userInfo, setUserInfo] = useState({ email: '', user: '' }); // User info for notifications

  // State for form data with validation - stores all form field values
  const [formData, setFormData] = useState({
    area: '', // User's area/locality (e.g., Al Khuwair)
    city: '', // User's city (e.g., Muscat)
    street: '', // Complete street address
    number: '', // House/apartment number with optional building info
    zipCode: '', // Postal/zip code (formatted to uppercase)
    phone: '', // Phone number with Omani formatting
    preferredTime: 'morning', // Default delivery time preference
    message: '' // Optional delivery notes and instructions
  });

  // State for field validation errors - tracks validation messages for each field
  const [errors, setErrors] = useState({}); // Object storing error messages keyed by field name
  const [fieldFocus, setFieldFocus] = useState(''); // Tracks which form field currently has focus for visual styling

  // Fetch user info on component mount
  useEffect(() => {
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
  }, []);

  // Effect hook to simulate automatic progress through delivery timeline steps
  // Simulate progress through timeline steps when success state becomes true
  useEffect(() => {
    // Only start timeline animation when form is successfully submitted
    if (showSuccess) {
      const steps = [1, 2, 3, 4]; // Steps to progress through (1-4, step 5 is final delivered state)
      let currentIndex = 0; // Track current position in steps array

      // Set up interval to automatically advance through timeline steps
      const interval = setInterval(() => {
        if (currentIndex < steps.length) {
          setCurrentStep(steps[currentIndex]); // Update current step to show progress
          setProgress((currentIndex + 1) * 25); // Update progress percentage (25% increment per step)
          currentIndex++; // Move to next step in the sequence
        } else {
          clearInterval(interval); // Stop interval when all steps are completed
        }
      }, 1500); // Advance to next step every 1.5 seconds for smooth progression

      // Cleanup function to clear interval when component unmounts or dependencies change
      return () => clearInterval(interval);
    }
  }, [showSuccess]); // Dependency array - effect runs only when showSuccess state changes

  // Function to send Email using backend API
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

  // Function to send SMS using backend API
  const sendSMS = async (toPhoneNumber, message) => {
    try {
      // Use your backend API endpoint
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

      console.log('Backend response status:', response.status);

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

  // Function to send delivery confirmation notifications based on user preferences
  const sendDeliveryNotification = async (orderDetails) => {
    // Get notification preferences from localStorage
    const savedPreferences = localStorage.getItem('notificationPreferences');
    let notificationPreferences = {
      email: false,
      sms: false,
      phoneNumber: ''
    };
    
    console.log('Delivery notification - Raw saved preferences from localStorage:', savedPreferences);
    
    if (savedPreferences) {
      try {
        notificationPreferences = JSON.parse(savedPreferences);
        console.log('Delivery notification - Parsed notification preferences:', notificationPreferences);
      } catch (error) {
        console.error('Error parsing notification preferences:', error);
        return false; // Don't send notifications if preferences can't be parsed
      }
    }
    
    // Check if user wants notifications
    if (notificationPreferences.email || notificationPreferences.sms) {
      // Prepare delivery confirmation message
      const deliveryMessage = `Delivery Confirmed!\n\nDelivery Details:\n- Appliance: ${orderDetails.appliance}\n- Delivery Address: ${orderDetails.deliveryAddress.street}, ${orderDetails.deliveryAddress.area}, ${orderDetails.deliveryAddress.city}\n- Phone: ${orderDetails.deliveryAddress.phone}\n- Preferred Time: ${formData.preferredTime === 'morning' ? 'Morning (9 AM - 12 PM)' : formData.preferredTime === 'afternoon' ? 'Afternoon (12 PM - 5 PM)' : 'Evening (5 PM - 8 PM)'}\n- Estimated Delivery: Within 2 business days\n- Order Status: Confirmed & Processing\n\nYour appliance will be delivered within 2 business days. Our team will contact you 1 hour before delivery. Thank you for choosing AppliRent!`;
      
      console.log('Delivery notification - User preferences:', {
        email: notificationPreferences.email,
        sms: notificationPreferences.sms,
        hasEmail: !!userInfo.email,
        hasPhone: !!notificationPreferences.phoneNumber,
        userEmail: userInfo.email,
        userPhone: notificationPreferences.phoneNumber
      });
      
      const promises = [];
      
      // Send email notification
      if (notificationPreferences.email && userInfo.email) {
        console.log('Delivery notification - Attempting to send email to:', userInfo.email);
        promises.push(
          sendEmail(
            userInfo.email,
            'Delivery Confirmation - AppliRent',
            deliveryMessage
          ).then(result => {
            console.log('Delivery notification - Email send result:', result);
            return result;
          }).catch(error => {
            console.error('Failed to send delivery email notification:', error);
            return { success: false, error: error.message };
          })
        );
      } else if (notificationPreferences.email && !userInfo.email) {
        console.log('Delivery notification - Email notifications enabled but no user email found');
      }
      
      // Send SMS notification
      if (notificationPreferences.sms && notificationPreferences.phoneNumber) {
        console.log('Delivery notification - Attempting to send SMS to:', notificationPreferences.phoneNumber);
        promises.push(
          sendSMS(
            notificationPreferences.phoneNumber,
            deliveryMessage
          ).then(result => {
            console.log('Delivery notification - SMS send result:', result);
            return result;
          }).catch(error => {
            console.error('Failed to send delivery SMS notification:', error);
            return { success: false, error: error.message };
          })
        );
      } else if (notificationPreferences.sms && !notificationPreferences.phoneNumber) {
        console.log('Delivery notification - SMS notifications enabled but no phone number found');
      }
      
      // Wait for all notifications to complete (or fail)
      if (promises.length > 0) {
        try {
          console.log('Delivery notification - Waiting for notifications to complete...');
          const results = await Promise.allSettled(promises);
          console.log('Delivery notification - All notification results:', results);
          
          // Check if any notifications were successful
          const successfulNotifications = results.filter(result => 
            result.status === 'fulfilled' && result.value && result.value.success
          );
          
          if (successfulNotifications.length > 0) {
            console.log(`Delivery notification - ${successfulNotifications.length} notification(s) sent successfully`);
            return true;
          } else {
            console.log('Delivery notification - No notifications were sent successfully');
            results.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                console.log(`Delivery notification ${index} error:`, result.value.error);
              } else {
                console.log(`Delivery notification ${index} rejected:`, result.reason);
              }
            });
            return false;
          }
        } catch (error) {
          console.error('Delivery notification - Error sending notifications:', error);
          return false;
        }
      } else {
        console.log('Delivery notification - No notifications to send (no enabled methods with valid contact info)');
        return false;
      }
    } else {
      console.log('Delivery notification - No notification preferences enabled by user');
      return false;
    }
  };

  // Comprehensive validation function for individual form fields
  // Validation functions - checks field-specific rules and returns error messages
  const validateField = (name, value) => {
    let error = ''; // Initialize empty error message

    // Switch statement handles different validation rules for each field type
    switch (name) {
      case 'area':
        if (!value.trim()) error = t('delivery.areaRequired'); // Check for empty value
        else if (!/^[a-zA-Z\s\-']+$/.test(value)) error = t('delivery.areaInvalid'); // Alpha characters only
        break;

      case 'city':
        if (!value.trim()) error = t('delivery.cityRequired'); // Check for empty value
        else if (!/^[a-zA-Z\s\-']+$/.test(value)) error = t('delivery.cityInvalid'); // Alpha characters only
        break;

      case 'street':
        if (!value.trim()) error = t('delivery.streetRequired'); // Check for empty value
        else if (value.length < 5) error = t('delivery.streetTooShort'); // Minimum length requirement
        break;

      case 'number':
        if (!value.trim()) error = t('delivery.numberRequired'); // Check for empty value
        else if (!/^[0-9a-zA-Z\s\-\/#.,]+$/.test(value)) error = t('delivery.numberInvalid'); // Alphanumeric with dashes/slashes
        break;

      case 'zipCode':
        if (!value.trim()) error = t('delivery.zipRequired'); // Check for empty value
        else if (!/^\d{3}$/.test(value.replace(/\s/g, ''))) error = t('delivery.zipInvalid');
        break;

      case 'phone':
        if (!value.trim()) error = t('delivery.phoneRequired'); // Check for empty value
        else if (!/^[79]\d{7}$/.test(value.replace(/\s/g, ''))) error = t('delivery.phoneInvalid'); // Oman phone format
        break;

      default:
        break; // No validation for other fields (preferredTime, message)
    }

    return error; // Return the error message (empty string if validation passes)
  };

  // Generic input change handler with real-time error clearing
  // Handle input changes with validation - updates form data and clears errors as user types
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Extract field name and value from event

    // Update form data state with new value while preserving other fields
    setFormData(prev => ({
      ...prev, // Spread previous state to maintain other field values
      [name]: value // Update the specific field that changed
    }));

    // Clear error when user starts typing in a field that previously had an error
    if (errors[name]) {
      const error = validateField(name, value); // Re-validate the field
      setErrors(prev => ({
        ...prev, // Spread previous errors
        [name]: error // Update error for this field (empty string if valid)
      }));
    }
  };

  // Focus event handler for visual feedback
  // Handle field focus - updates state to track which field has focus for styling
  const handleFocus = (fieldName) => {
    setFieldFocus(fieldName); // Set the currently focused field name
  };

  // Blur event handler with validation triggering
  // Handle field blur with validation - validates field when user leaves it
  const handleBlur = (e) => {
    const { name, value } = e.target; // Extract field name and value
    const error = validateField(name, value); // Validate the field value

    // Update errors state with validation result
    setErrors(prev => ({
      ...prev, // Spread previous errors
      [name]: error // Set error message for this field
    }));

    setFieldFocus(''); // Clear focus state since field is no longer focused
  };

  // Specialized phone number formatter for Omani number patterns
  // Format phone number as user types - applies Omani phone number formatting
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters

    // Ensure number starts with 7 or 9 and has max 8 digits
    if (value.length > 0) {
      const firstDigit = value[0];
      if (firstDigit !== '7' && firstDigit !== '9') {
        value = ''; // Clear if doesn't start with 7 or 9
      } else if (value.length > 8) {
        value = value.substring(0, 8); // Limit to 8 digits
      }
    }

    // Update form data with formatted phone number
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  // Zip code formatter - only allows numbers and limits to 3 digits
  const handleZipCodeChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
    value = value.slice(0, 3); // Limit to maximum 3 digits

    // Update form data with cleaned zip code
    setFormData(prev => ({
      ...prev,
      zipCode: value
    }));
  };

  // Comprehensive form validation before submission
  // Validate entire form before submission - checks all required fields
  const validateForm = () => {
    const newErrors = {}; // Initialize empty errors object

    // Loop through all form data fields (except optional ones)
    Object.keys(formData).forEach(key => {
      // Skip validation for optional fields (message) and pre-selected fields (preferredTime)
      if (key !== 'message' && key !== 'preferredTime') {
        const error = validateField(key, formData[key]); // Validate each required field
        if (error) newErrors[key] = error; // Add to errors if validation fails
      }
    });

    setErrors(newErrors); // Update errors state with all validation results
    return Object.keys(newErrors).length === 0; // Return true if no errors (form is valid)
  };

  // Main form submission handler with validation and success flow
  const handleConfirm = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)

    // Validate form before submission - check all fields meet requirements
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to first error field for better user experience
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-field'); // Find first field with error
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Smooth scroll to error
      }
      return; // Stop submission if validation fails
    }

    setIsSubmitting(true); // Set loading state to show processing indicator

    try {
      // Get username from localStorage
      const username = localStorage.getItem('username');
      
      if (!username) {
        alert('Please login to place an order');
        setIsSubmitting(false);
        return;
      }

      // Prepare order data
      // Extract dates - handle both object and direct date formats
      let startDate = new Date();
      let endDate = new Date();
      
      if (orderData.startDate) {
        startDate = new Date(orderData.startDate);
      } else if (orderData.rentalPeriod?.start) {
        startDate = new Date(orderData.rentalPeriod.start);
      }
      
      if (orderData.endDate) {
        endDate = new Date(orderData.endDate);
      } else if (orderData.rentalPeriod?.end) {
        endDate = new Date(orderData.rentalPeriod.end);
      } else if (orderData.formData?.endDate) {
        endDate = new Date(orderData.formData.endDate);
      }

      // Validate email before submitting
if (!userInfo.email || userInfo.email.trim() === '') {
  alert('Email is required. Please ensure you are logged in with a valid email.');
  setIsSubmitting(false);
  return;
}

      // Extract appliance name - handle both object and string formats
      let applianceName = 'Unknown';
      if (orderData.appliance) {
        if (typeof orderData.appliance === 'string') {
          applianceName = orderData.appliance;
        } else if (orderData.appliance.name) {
          applianceName = orderData.appliance.name;
        }
      }

      // Validate appliance name
      if (!applianceName || applianceName === 'Unknown') {
        alert('Appliance information is missing. Please go back and select an appliance again.');
        setIsSubmitting(false);
        return;
      }

    const orderToSave = {
  user: username,
  email: userInfo.email || '',
  appliance: applianceName,
  applianceId: orderData.appliance?._id || null,
  startDate: startDate,
  endDate: endDate,
  totalAmount: orderData.totalAmount || orderData.finalAmount || 0,
  status: 'pending',
  deliveryAddress: {
    area: formData.area,
    city: formData.city,
    street: formData.street,
    number: formData.number,
    zipCode: formData.zipCode,
    phone: formData.phone
  }
};

      // Log the order data being sent for debugging
      console.log('Submitting order with data:', {
        user: orderToSave.user,
        email: orderToSave.email,
        appliance: orderToSave.appliance,
        startDate: orderToSave.startDate,
        endDate: orderToSave.endDate,
        totalAmount: orderToSave.totalAmount
      });

      // Save order to database
      const response = await axios.post('http://localhost:5000/addOrder', orderToSave);
      console.log('Order saved successfully:', response.data);

      // Send delivery confirmation notifications
      try {
        await sendDeliveryNotification(orderToSave);
      } catch (notificationError) {
        console.error('Delivery notification error:', notificationError);
        // Don't block the user if notification fails
      }

      // Notify other components that appliances have been updated
      // This ensures the catalog refreshes immediately when an appliance is rented
      localStorage.setItem('applianceUpdated', Date.now().toString());
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('applianceUpdated'));

      setIsSubmitting(false); // Clear loading state after processing
      setShowSuccess(true); // Show success message and trigger timeline animation

      // Show confirmation alert after success animation appears
      // Show alert after animation
      setTimeout(() => {
        // alert("Your order's on its way! 📦✨ We'll have it at your door soon."); // Success confirmation
      }, 1000); // 1 second delay after success state to allow animation to show
    } catch (error) {
      console.error('Error saving order:', error);
      setIsSubmitting(false);
      
      // Show the actual error message from the server
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save order. Please try again.';
      alert(errorMessage);
    }
  };

  // Timeline steps configuration for delivery progress visualization
  const timelineSteps = [
    {
      step: 1, // Step identifier
      title: "Order Confirmed", // User-friendly step title
      description: "We receive your order details", // Step explanation
      icon: "✓", // Visual icon representing the step
      time: "Today, 10:00 AM", // Estimated completion time
      status: "completed" // Initial status - always completed after form submission
    },
    {
      step: 2,
      title: "Processing",
      description: "Preparing your appliance for delivery",
      icon: "⚙️",
      time: "Today, 10:30 AM",
      status: currentStep >= 2 ? "completed" : "pending" // Dynamic status based on timeline progress
    },
    {
      step: 3,
      title: "Quality Check",
      description: "Final inspection and packaging",
      icon: "🔍",
      time: "Today, 11:30 AM",
      status: currentStep >= 3 ? "completed" : "pending" // Updates automatically as timeline advances
    },
    {
      step: 4,
      title: "On the Way",
      description: "Out for delivery to your location",
      icon: "🚚",
      time: "Tomorrow, 9:00 AM",
      status: currentStep >= 4 ? "completed" : "pending"
    },
    {
      step: 5,
      title: "Delivered",
      description: "At your doorstep within 2 days",
      icon: "🏠",
      time: "Tomorrow, 2:00 PM",
      status: currentStep >= 5 ? "completed" : "pending" // Final step completion status
    }
  ];

  // Component render method - returns JSX for delivery interface
  return (
    <div className="main-contact">
      <Header /> {/* Render header navigation component with menu and logo */}

      <div className="container contact-container">
        <div className="contact-content">
          {/* Animated delivery visualization section */}
          <div className="delivery-animation-section">
            {/* Delivery Truck Animation - visual element showing moving delivery truck */}
            <div className="delivery-truck-animation">
              <div className="truck">
                <div className="truck-body">
                  <div className="cab">
                    <div className="window"></div> {/* Truck driver cabin window */}
                  </div>
                  <div className="container-box">
                    <div className="package package-1"></div> {/* Animated package with bounce effect */}
                    <div className="package package-2"></div> {/* Animated package with different color */}
                    <div className="package package-3"></div> {/* Animated package with staggered timing */}
                  </div>
                </div>
                <div className="wheel front-wheel"></div> {/* Rotating front wheel animation */}
                <div className="wheel back-wheel"></div> {/* Rotating back wheel animation */}
                <div className="smoke"></div> {/* Animated exhaust smoke effect */}
              </div>
              <div className="road"></div> {/* Road element for truck to drive along */}
            </div>

            {/* Floating Packages Animation - decorative floating package emojis */}
            <div className="floating-packages">
              <div className="floating-package p1">📦</div> {/* Floating package with emoji - position 1 */}
              <div className="floating-package p2">📦</div> {/* Floating package with emoji - position 2 */}
              <div className="floating-package p3">📦</div> {/* Floating package with emoji - position 3 */}
              <div className="floating-package p4">📦</div> {/* Floating package with emoji - position 4 */}
            </div>
          </div>

          {/* Main delivery form section */}
          <div className="contact-form">
            <h2 style={{ color: '#7B4F2C' }}>{t('delivery.title')}</h2> {/* Page heading with brand color consistency */}

            {/* Conditional rendering - success message appears after form submission */}
            {/* Success Animation */}
            {showSuccess && (
              <div className="success-animation">
                <p className="success-text">{t('delivery.deliveryScheduled')}</p> {/* Success message with celebration emoji */}
              </div>
            )}

            {/* Delivery information form with enhanced validation and UX */}
            <form onSubmit={handleConfirm} noValidate> {/* noValidate prevents browser default validation */}
              {/* Area and City inputs in responsive grid layout */}
              {/* Area and City */}
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="area" className="form-label">
                    {t('delivery.area')} <span className="text-danger">*</span> {/* Required field indicator */}
                  </label>
                  <input
                    type="text"
                    name="area"
                    className={`form-control ${errors.area ? 'error-field is-invalid' : ''} ${fieldFocus === 'area' ? 'focused' : ''}`} // Dynamic classes for styling
                    id="area"
                    placeholder="Enter your area (e.g., Al Khuwair)" /* Helpful example placeholder */
                    value={formData.area}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('area')} /* Set focus state for styling */
                    onBlur={handleBlur} /* Trigger validation on field exit */
                    required /* HTML5 required attribute */
                  />
                  {errors.area && <div className="invalid-feedback">{errors.area}</div>} {/* Validation error message */}
                </div>

                <div className="form-group col-md-6">
                  <label htmlFor="city" className="form-label">
                    {t('delivery.city')} <span className="text-danger">*</span> {/* Required field indicator */}
                  </label>
                  <input
                    type="text"
                    name="city"
                    className={`form-control ${errors.city ? 'error-field is-invalid' : ''} ${fieldFocus === 'city' ? 'focused' : ''}`} /* Conditional error/focus styling */
                    id="city"
                    placeholder="Enter your city (e.g., Muscat)" /* Contextual placeholder */
                    value={formData.city}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('city')}
                    onBlur={handleBlur}
                    required
                  />
                  {errors.city && <div className="invalid-feedback">{errors.city}</div>} {/* Field-specific error display */}
                </div>
              </div>

              {/* Street Address input - full width for complete address entry */}
              {/* Street Address */}
              <div className="form-group">
                <label htmlFor="street" className="form-label">
                  {t('delivery.street')} <span className="text-danger">*</span> {/* Required field indicator */}
                </label>
                <input
                  type="text"
                  name="street"
                  className={`form-control ${errors.street ? 'error-field is-invalid' : ''} ${fieldFocus === 'street' ? 'focused' : ''}`}
                  id="street"
                  placeholder="Enter street name and area details" /* Guidance for complete address */
                  value={formData.street}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('street')}
                  onBlur={handleBlur}
                  required
                />
                {errors.street && <div className="invalid-feedback">{errors.street}</div>}
                <small className="form-text text-muted">
                  Please provide the complete street address for accurate delivery {/* Helper text */}
                </small>
              </div>

              {/* House Number and Zip Code in responsive side-by-side layout */}
              {/* House Number and Zip Code */}
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="number" className="form-label">
                    {t('delivery.number')} <span className="text-danger">*</span> {/* Required field indicator */}
                  </label>
                  <input
                    type="text"
                    name="number"
                    className={`form-control ${errors.number ? 'error-field is-invalid' : ''} ${fieldFocus === 'number' ? 'focused' : ''}`}
                    id="number"
                    placeholder="e.g., 123, Bldg 45, Apt 6" /* Flexible format examples */
                    value={formData.number}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('number')}
                    onBlur={handleBlur}
                    required
                  />
                  {errors.number && <div className="invalid-feedback">{errors.number}</div>}
                </div>

                <div className="form-group col-md-6">
                  <label htmlFor="zipCode" className="form-label">
                    {t('delivery.zipCode')} <span className="text-danger">*</span> {/* Required field indicator */}
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    className={`form-control ${errors.zipCode ? 'error-field is-invalid' : ''} ${fieldFocus === 'zipCode' ? 'focused' : ''}`}
                    id="zipCode"
                    placeholder="e.g., 113" /* Omani postal code examples */
                    value={formData.zipCode}
                    onChange={handleZipCodeChange} /* Specialized handler for formatting */
                    onFocus={() => handleFocus('zipCode')}
                    onBlur={handleBlur}
                    // maxLength="10" /* Character limit for zip codes */
                    required
                  />
                  {errors.zipCode && <div className="invalid-feedback">{errors.zipCode}</div>}
                </div>
              </div>

              {/* Phone Number with Omani formatting */}
              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  {t('delivery.phone')} <span className="text-danger">*</span> {/* Required field indicator */}
                </label>
                <input
                  type="tel"
                  name="phone"
                  className={`form-control ${errors.phone ? 'error-field is-invalid' : ''} ${fieldFocus === 'phone' ? 'focused' : ''}`}
                  id="phone"
                  placeholder="7XXXXXXX or 9XXXXXXX" /* Omani phone number example */
                  value={formData.phone}
                  onChange={handlePhoneChange} /* Specialized handler for phone formatting */
                  onFocus={() => handleFocus('phone')}
                  onBlur={handleBlur}
                  maxLength="8" /* 8 digits maximum */
                  pattern="[79][0-9]{7}" /* Pattern for Oman numbers */
                  required
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                <small className="form-text text-muted">
                  {t('delivery.phoneHint')} {/* Purpose explanation */}
                </small>
              </div>

              {/* Preferred Delivery Time selection with emoji-enhanced options */}
              {/* Preferred Delivery Time */}
              <div className="form-group">
                <label htmlFor="preferredTime" className="form-label">
                  Preferred Delivery Time {/* Optional field - no asterisk */}
                </label>
                <select
                  name="preferredTime"
                  className="form-control"
                  id="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                >
                  <option value="morning">🌅 Morning (9 AM - 12 PM)</option> {/* Time slot with morning emoji */}
                  <option value="afternoon">☀️ Afternoon (12 PM - 5 PM)</option> {/* Time slot with sun emoji */}
                  <option value="evening">🌙 Evening (5 PM - 8 PM)</option> {/* Time slot with moon emoji */}
                </select>
                <small className="form-text text-muted">
                  We'll try our best to deliver during your preferred time {/* Manage expectations */}
                </small>
              </div>

              {/* Optional delivery notes for special instructions */}
              {/* Delivery Notes */}
              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Delivery Notes <small className="text-muted">(Optional)</small> {/* Clearly marked optional */}
                </label>
                <textarea
                  name="message"
                  className="form-control"
                  id="message"
                  rows="4"
                  placeholder="Any special delivery instructions, gate codes, security information, or specific landmarks..." /* Comprehensive examples */
                  value={formData.message}
                  onChange={handleInputChange}
                ></textarea>
                <small className="form-text text-muted">
                  Help our delivery team locate you easily {/* Practical guidance */}
                </small>
              </div>

              {/* Conditional loading animation during form processing */}
              {/* Loading Animation */}
              {isSubmitting && (
                <div className="loading-animation">
                  <div className="loading-spinner"></div> {/* Animated spinner visual */}
                  <p>{t('delivery.processingRequest')}</p> {/* Loading state message */}
                </div>
              )}

              {/* Form submission button with dynamic states */}
              {/* Submit Button */}
              <div className="form-group">
                <button
                  type="submit"
                  className="btn btn-submit delivery-btn"
                  disabled={isSubmitting} /* Disable during processing to prevent duplicate submissions */
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span> {/* Bootstrap spinner */}
                      {t('delivery.processing')} {/* Loading state button text */}
                    </>
                  ) : (
                    t('delivery.confirmOrder') /* Default button text with clear action */
                  )}
                </button>
                <small className="form-text text-muted d-block mt-2">
                  {/* By confirming, you agree to our delivery terms and conditions Legal disclaimer */}
                </small>
              </div>
            </form>

            {/* Advanced delivery timeline section - shows after successful submission */}
            {/* Advanced Delivery Timeline */}
            <div className="advanced-timeline-section">
              {/* Timeline header with progress indicator */}
              <div className="timeline-header">
                <h4 style={{ color: '#7B4F2C', margin: 0 }}>Delivery Timeline</h4> {/* Timeline title with brand color */}
                <div className="progress-indicator">
                  <span className="progress-text">{progress}% Complete</span> {/* Progress percentage display */}
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }} /* Dynamic width based on progress state */
                    ></div> {/* Animated progress bar fill */}
                  </div>
                </div>
              </div>

              {/* Timeline steps container with staggered animations */}
              <div className="advanced-timeline">
                {/* Map through timeline steps to render each step with dynamic status */}
                {timelineSteps.map((step, index) => (
                  <div
                    key={step.step} /* Unique key for React rendering optimization */
                    className={`timeline-item ${step.status} ${currentStep === step.step ? 'current' : ''
                      }`} /* Dynamic classes for completed/pending/current states */
                    style={{ animationDelay: `${index * 0.2}s` }} /* Staggered animation timing */
                  >
                    {/* Timeline visual connector and step marker */}
                    <div className="timeline-connector">
                      <div className="connector-line"></div> {/* Vertical line connecting steps */}
                      <div className="step-marker">
                        <span className="step-icon">{step.icon}</span> {/* Step-specific icon */}
                        <div className="status-dot"></div> {/* Animated status indicator */}
                      </div>
                    </div>

                    {/* Timeline step content area */}
                    <div className="timeline-content">
                      <div className="timeline-header-content">
                        <h6 className="step-title">{step.title}</h6> {/* Step title */}
                        <span className="step-time">{step.time}</span> {/* Estimated completion time */}
                      </div>
                      <p className="step-description">{step.description}</p> {/* Step description */}

                      {/* Conditional rendering - shows additional info for current active step */}
                      {/* Additional info for current step */}
                      {currentStep === step.step && (
                        <div className="current-step-info">
                          <div className="estimated-time">
                            <span className="time-icon">⏱️</span> {/* Time estimation icon */}
                            Estimated: {index === timelineSteps.length - 1 ? '2 hours' : '1 hour'} {/* Dynamic time estimate */}
                          </div>
                        </div>
                      )}

                      {/* Conditional rendering - shows progress animation for current active step */}
                      {/* Progress animation for current step */}
                      {currentStep === step.step && (
                        <div className="step-progress">
                          <div className="step-progress-bar">
                            <div className="step-progress-fill"></div> {/* Animated progress within current step */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline controls and delivery estimate information */}
              {/* Timeline Controls */}
              <div className="timeline-controls">
                <div className="delivery-estimate">
                  <div className="estimate-card">
                    <div className="estimate-icon">📅</div> {/* Calendar icon for delivery estimate */}
                    <div className="estimate-info">
                      <strong>Estimated Delivery</strong> {/* Estimate title */}
                      <span>Within 2 business days</span> {/* Delivery timeframe promise */}
                    </div>
                  </div>
                </div>
                {/* Additional timeline controls can be added here in the future */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer /> {/* Render footer component with links and information */}
    </div>
  );
};

// Export the component for use in other parts of the application
export default Delivery;