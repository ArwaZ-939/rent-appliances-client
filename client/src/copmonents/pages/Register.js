import React, { useState } from "react";
import "../css/Register.css";
import register1 from "../assets/register1.jpg";
import { useNavigate } from "react-router-dom";
import ValidationRegister from "../../validations/RegisterValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import axios from "axios";
import male from "../assets/male.jpg";
import female from "../assets/female.png";

const Register = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [cpasswordVisible, setCPasswordVisible] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const toggleCPasswordVisibility = () => {
    setCPasswordVisible(!cpasswordVisible);
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(true);
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:5000/checkUsername/${username}`);
      setUsernameAvailable(!response.data.exists);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(true);
    }
  };

  const handleSubmit = async (data) => {
    const userData = {
      user: data.username.toLowerCase(),
      password: data.password,
      email: data.email,
      gender: data.gender,
      imgUrl: data.ProfileUrl || "",
    };
    
    try {
      const response = await axios.post("http://localhost:5000/addUser", userData);
      setMessage("Registration successful! Redirecting to login...");
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      
    } catch (error) {
      if (error.response?.data?.message === "User already exists.") {
        setMessage("Username already exists. Please choose a different username.");
      } else if (error.response?.data?.message === "Email already exists.") {
        setMessage("Email address already exists. Please use a different email.");
      } else {
        setMessage("Registration failed. Please try again.");
      }
      setShowModal(true);
    }
  };

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(ValidationRegister),
    mode: "onChange",
  });

  const handlePolicyClick = (e) => {
    e.preventDefault();
    setShowPolicyModal(true);
  };

  return (
    <form className="container-register" onSubmit={submitForm(handleSubmit)}>
      <div className="left-section">
        <h2 className="signip">Sign up for a new account</h2>
        
        {/* Username Field */}
        <span className="error small">{errors.username?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="bi bi-person-fill"></i>
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            {...register("username", {
              onChange: (e) => checkUsernameAvailability(e.target.value)
            })}
            onBlur={(e) => checkUsernameAvailability(e.target.value)}
          />
        </div>
        {/* {watch("username") && watch("username").length > 2 && (
          <span className={`small ${usernameAvailable ? 'text-success' : 'text-danger'}`}>
            {usernameAvailable ? '✓ Username available' : '✗ Username already taken'}
          </span>
        )} */}

        {/* Profile URL Field */}
        <span className="error small">{errors.ProfileUrl?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="bi bi-image-fill"></i>
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Profile Image Url (Optional)"
            {...register("ProfileUrl")}
          />
        </div>

        {/* Email Field */}
        <span className="error small">{errors.email?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="bi bi-envelope-fill"></i>
            </span>
          </div>
          <input
            type="email"
            className="form-control"
            placeholder="Your Email"
            {...register("email")}
          />
        </div>

        {/* Gender Field */}
        <span className="error small">{errors.gender?.message}</span>
        <div className="input-group">
          <div className="radio-input">
            <label>
              <input type="radio" value="Male" {...register("gender")} />
              <img className="rounded-circle" src={male} alt="male" height="18px" />
              &nbsp;&nbsp;Male
            </label>
            <label>
              <input type="radio" value="Female" {...register("gender")} />
              <img className="rounded-circle" src={female} alt="female" height="18px" />
              &nbsp;&nbsp;Female
            </label>
            <span className="selection"></span>
          </div>
        </div>

        {/* Password Field */}
        <span className="error small">{errors.password?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="bi bi-shield-lock-fill"></i>
            </span>
          </div>
          <input
            type={passwordVisible ? "text" : "password"}
            className="form-control"
            placeholder="Password"
            {...register("password")}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={togglePasswordVisibility}
            >
              <i className={passwordVisible ? "bi bi-eye" : "bi bi-eye-slash"}></i>
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <span className="error small">{errors.conPassword?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="bi bi-shield-lock-fill"></i>
            </span>
          </div>
          <input
            type={cpasswordVisible ? "text" : "password"}
            className="form-control"
            placeholder="Repeat your password"
            {...register("conPassword")}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={toggleCPasswordVisibility}
            >
              <i className={cpasswordVisible ? "bi bi-eye" : "bi bi-eye-slash"}></i>
            </button>
          </div>
        </div>
        
        {/* Policy Agreement */}
        <div className="policy-section">
          <div className="policy-agreement">
            <label className="policy-checkbox">
              <input type="checkbox" {...register("policyAgreement")} />
              <span className="checkmark"></span>
              I agree to the <button 
                type="button" 
                className="policy-link" 
                onClick={handlePolicyClick}
              >
                Return Policy
              </button>
            </label>
            <span className="error small">{errors.policyAgreement?.message}</span>
          </div>
        </div>
        
        <br />
        <button type="submit" className="cssbuttons-io-button">
          Register
          <div className="icon">
            <svg height="24" width="24" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"></path>
            </svg>
          </div>
        </button>
        
        <div className="create-account">
          <button className="tag-button" onClick={() => navigate("/login")}>
            I am already a member
          </button>
        </div>
      </div>
      
      <div className="right-section">
        <img src={register1} alt="Signup Illustration" />
      </div>
      
      {/* Success/Error Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div>
                <div className="modal-title">Registration Status</div>
              </div>
            </div>
            <div className="modal-body">
              {message}
            </div>
            <button 
              className="modal-close-button" 
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="policy-modal-overlay">
          <div className="policy-modal">
            <div className="policy-modal-header">
              <h3>Return Policy</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowPolicyModal(false)}
              >
                ×
              </button>
            </div>
            <div className="policy-modal-body">
              <h5>1. Return Window:</h5>
              <p>Rented appliances can be returned within 3 hours of delivery if they are defective, damaged, or not as described.</p>
              
              <h5>2. Condition of Return</h5>
              <p>The appliance must be returned in the same condition it was delivered — clean, undamaged, and with all accessories included.</p>
              
              <h5>3. Return Process:</h5>
              <p><strong>Contact our support team at "RentingHA3@gmail.com" or call us at "98939395".</strong> A pickup will be scheduled within 3 business hours.</p>
              
              <h5>4. Late Return Penalty:</h5>
              <p>Returns made after the agreed rental period may incur additional charges unless an extension was pre-approved.</p>
              
              <h5>5. Policy Violations</h5>
              <p>The admin can block the user if he violates these policies twice.</p>
              
              <h5>6. Device Collection</h5>
              <p>Upon the expiry of the agreed-upon period, the renter will be contacted to arrange a convenient time for the device to be collected.</p>
              <p>When you register, this indicates that you agree to these policies.</p>
            </div>
            <div className="policy-modal-footer">
              <button 
                className="policy-close-btn" 
                onClick={() => setShowPolicyModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default Register;