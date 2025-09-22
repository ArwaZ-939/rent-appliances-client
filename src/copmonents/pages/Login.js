import React, { useState } from "react";
import "../css/Login.css";
import loginLogo from "../assets/login.png";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import ValidationLogin from "../../validations/LoginValidation";
import axios from "axios";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [faild, setFaild] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    const user1 = { password: password, user: user.toLowerCase() };
    console.log("Attempting login with:", user1.user);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/getUser", user1);
      console.log("Login successful:", response.data);
      setLoading(false);
      if (response.data.user && response.data.user.isAdmin) {
        localStorage.setItem('username', response.data.user.user);
        console.log("Stored admin username:", response.data.user.user);
        navigate("/admin");
      } else if (response.data.user) {
        localStorage.setItem('username', response.data.user.user);
        console.log("Stored user username:", response.data.user.user);
        navigate("/home");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      setFaild("Invalid Username or Password !!");
    }
  };

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ValidationLogin),
  });

  const handelForgot = () => {
    navigate('/verifyEmail')
  }

  return (
    <>
      <form className="container-login">
        <div className="left-section-login ">
          <img src={loginLogo} alt="Signup Illustration" />
        </div>
        <div className="right-section-login ">
          <h2 className="signin">Sign in to your account</h2>
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
              id="name"
              className="form-control"
              placeholder="Username"
              {...register("username", {
                value: user,
                onChange: (e) => setUser(e.target.value),
              })}
            />
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
              id="password"
              className="form-control"
              placeholder="Password"
              {...register("password", {
                value: password,
                onChange: (e) => setPassword(e.target.value),
              })}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={togglePasswordVisibility}
              >
                <i
                  className={
                    passwordVisible ? "bi bi-eye" : "bi bi-eye-slash"
                  }
                  id="toggleIcon"
                ></i>
              </button>
            </div>
          </div>
          <button
            className="cssbuttons-io-button"
            onClick={submitForm(handleSubmit)}
          >
            Login
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
          <div className="create-account">
          <button className="tag-button right" onClick={handelForgot}>Forgot password?</button>
          <br/>
            <button className="tag-button" onClick={()=>navigate('/register')}>Create an account?</button>
          </div>
        </div>
      </form>
    </>
  );
};

export default Login;
