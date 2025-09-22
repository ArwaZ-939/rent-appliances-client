import React, { useState } from "react";
import "../css/Login.css";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import EmailValidation from "../../validations/EmailValidation";
import Header from "../sections/Header";
import Footer from "../sections/Footer";
import axios from "axios";

const Password = () => {
  const [faild, setFaild] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(EmailValidation),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/request-otp", { email: data.email });
      setLoading(false);
      if (response.data.message === 'OTP sent to email.') {
        navigate("/otp", { state: { email: data.email } });
      } else {
        setFaild(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      setLoading(false);
      setFaild(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const onInvalid = (errors) => {
    console.error("Validation errors:", errors);
  };

  return (
    <>
      <Header />
      <form className="container-login" onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="right-section-login">
          <h2 className="signin">Forgot Password</h2>
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
              required
              {...register("email")}
            />
          </div>
          <button type="submit" className="cssbuttons-io-button">
            verify
            <div className="icon">
              <svg
                height="24"
                width="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path
                  d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </button>
          <span className="error small">{faild}</span>
        </div>
      </form>
      <Footer />
    </>
  );
};

export default Password;