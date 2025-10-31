import "../css/Register.css";
import ValidationRegister from "../../validations/RegisterValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from "../sections/Header";
import Footer from "../sections/Footer";
import forget from "../assets/forget.png";
import axios from "axios";
import * as Yup from "yup";

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters !!")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character !!")
    .required("Password is required !!"),
  conPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Password must be match !!")
    .required("Password is required !!"),
});

const ResetPassword = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [cpasswordVisible, setCPasswordVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const { token } = useParams();

  const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
    };
    
    const toggleCPasswordVisibility = () => {
      setCPasswordVisible(!cpasswordVisible);
    };
  
        const onSubmit = (data) => {
          axios.post("http://localhost:5000/reset-password", { email, otp, newPassword: data.password })
            .then(response => {
              if (response.data.message === 'Password reset successful.') {
                alert('The password changed successfully');
                navigate("/login");
              } else {
                alert(response.data.message || 'Failed to reset password');
              }
            })
            .catch(error => {
              alert(error.response?.data?.message || 'An error occurred');
            });
        };

    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm({
        resolver: yupResolver(resetPasswordSchema),
      });
return(
    <>
    <Header/>
        <form className="container-register" onSubmit={handleSubmit(onSubmit)}>
        <div className="left-section">
            <h2 className="signip">Change Password</h2>
            <div className="input-group">
              <div className="input-group-prepend">
              <span className="error small">{errors.email?.message}</span>
          <div className="input-group">

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
                placeholder="New Password"
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
                placeholder="Confirm New Password"
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
            <br />
            <br />
            <button type="submit" className="cssbuttons-io-button" color="#7B4F2C">
              submit
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
          </div>
          </div>
            </div>
            <div className="right-section">
                    <img src={forget} alt="Signup Illustration" />
                  </div>
        </form>
        <Footer/>
    </>
)
};

export default ResetPassword;