import React, { useState, useEffect } from "react";
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
  const [checkboxError, setCheckboxError] = useState("");
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [gender, setGender] = useState("");
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

  const handleSubmit = async (data) => {
    const user = {
      user: name.toLocaleLowerCase(),
      password: password,
      email: email,
      gender: gender,
      imgUrl: imgUrl,
    };
    try {
      const response = await axios.post("http://localhost:5000/addUser", user);
      setMessage("User added successfully.");
      navigate("/login");
    } catch (error) {
      if (error.response?.data?.message === "User already exists.") {
        setMessage("User already exists.");
      } else if (error.response?.data?.message === "Email already exists.") {
        setMessage("Email already exists.");
      } else {
        setMessage("Registration failed.");
      }
      setShowModal(true);
    }
  };

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ValidationRegister),
  });

  useEffect(() => {
    if (errors.checkbox) {
      setCheckboxError(errors.checkbox.message);
      setShowModal(true);
    } else {
      setCheckboxError("");
    }
  }, [errors]);

  return (
    <form className="container-register">
      <div className="left-section">
        <h2 className="signip">Sign up for a new account</h2>
        <span className="error small">{errors.username?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              {errors.username ? (
                <i className="bi bi-person-fill icon-error"></i>
              ) : (
                <i className="bi bi-person-fill"></i>
              )}
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            {...register("username", {
              value: name,
              onChange: (e) => setname(e.target.value),
            })}
            />
        </div>
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
            {...register("ProfileUrl", {
              value: imgUrl,
              onChange: (e) => setImgUrl(e.target.value),
            })}
            />
        </div>
        <span className="error small">{errors.email?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              {errors.email ? (
                <i className="bi bi-envelope-fill icon-error"></i>
              ) : (
                <i className="bi bi-envelope-fill"></i>
              )}
            </span>
          </div>
          <input
            type="email"
            className="form-control"
            placeholder="Your Email"
            {...register("email", {
              value: email,
              onChange: (e) => setemail(e.target.value),
            })}
            />
        </div>
        <span className="error small">{errors.gender?.message}</span>
        <div className="input-group">
      <div className="radio-input">
        <label>
          <input
            type="radio"
            value="Male"
            {...register("gender", {
              onChange: (e) => setGender(e.target.value),
            })}
            />
          <img className="rounded-circle" src={male} alt="male" height="18px" color="#7B4F2C"/>
          &nbsp;&nbsp;Male
        </label>
        <label>
          <input
            type="radio"
            value="Female"
            {...register("gender", {
              onChange: (e) => setGender(e.target.value),
            })}
            />
          <img className="rounded-circle" src={female} alt="female" height="18px" />
          &nbsp;&nbsp;Female
        </label>
        <span className="selection"></span>
      </div>
    </div>
        <span className="error small">{errors.password?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              {errors.password ? (
                <i className="bi bi-shield-lock-fill icon-error"></i>
              ) : (
                <i className="bi bi-shield-lock-fill"></i>
              )}
            </span>
          </div>
          <input
            type={passwordVisible ? "text" : "password"}
            className="form-control"
            placeholder="Password"
            {...register("password", {
              value: password,
              onChange: (e) => setpassword(e.target.value),
            })}
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
        <span className="error small">{errors.conPassword?.message}</span>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              {errors.conPassword ? (
                <i className="bi bi-shield-lock-fill icon-error"></i>
              ) : (
                <i className="bi bi-shield-lock-fill"></i>
              )}
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
        
        {/* Return Policy Section */}
        <div className="policy-section">
          <div className="policy-agreement">
            <label className="policy-checkbox">
              <input
                type="checkbox"
                {...register("policyAgreement")}
              />
              <span className="checkmark"></span>
              I agree to the <button 
                type="button" 
                className="policy-link" 
                onClick={() => setShowPolicyModal(true)}
              >
                Return Policy
              </button>
            </label>
            <span className="error small">{errors.policyAgreement?.message}</span>
          </div>
        </div>
        
        <br />
        <button type="button" className="cssbuttons-io-button" color="#7B4F2C" onClick={submitForm(handleSubmit)}>
          Register
          <div className="icon">
            <svg height="24" width="24" viewBox="0 0 24 24" >
              <path d="M0 0h24v24H0z" fill="none" ></path>
              <path
                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                 color="#7B4F2C"
                ></path>
            </svg>
          </div>
        </button>
        <div className="create-account">
        <button className="tag-button" onClick={() => navigate("/login")}>I am already a member</button>
        </div>
      </div>
      <div className="right-section">
        <img src={register1} alt="Signup Illustration" />
      </div>
      
      {/* Return Policy Modal */}
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
              <ul>
                <li>The device will be inspected and approved.</li>
                <li>If the customer wants to return the device before the expiry of the period, an amount will be returned (to be agreed upon by the customer and the renter).</li>
              </ul>
              
              <h5>4. Late Return Penalty:</h5>
              <p>Returns made after the agreed rental period may incur additional charges unless an extension was pre-approved.</p>
              
              <h5>5. The admin can block the user if he violates these policies twice.</h5>
              <p>When you click on "Submit", this indicates that you agree to these policies.</p>
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
