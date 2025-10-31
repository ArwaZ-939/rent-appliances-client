import "../css/Register.css";
import { useForm } from "react-hook-form";
import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../sections/Header";
import Footer from "../sections/Footer";
import forget from "../assets/forget.png";
import axios from "axios";

const Otp = () => {
const { token } = useParams();
const location = useLocation();
const navigate = useNavigate();
const email = location.state?.email || "";

const {
register,
handleSubmit,
formState: { errors },
} = useForm();

const onSubmit = (data) => {
axios.post("http://localhost:5000/verify-otp", { email, otp: data.otp })
.then(response => {
if (response.data.message === 'OTP verified.') {
navigate("/reset-password", { state: { email, otp: data.otp } });
} else {
alert(response.data.message || "Failed to verify OTP");
}
})
.catch(error => {
console.error("Error verifying OTP:", error);
alert("An error occurred. Please try again later.");
});
};

useEffect(() => {
// No need to reset state as we're not using Redux
}, []);

return (
<>
<Header />
<form className="container-register" onSubmit={handleSubmit(onSubmit)}>
<div className="left-section">
<h2 className="signip">Enter OTP</h2>
<div className="input-group">
<div className="input-group-prepend">
<span className="input-group-text">
{errors.otp ? (
<i className="bi bi-key-fill icon-error"></i>
) : (
<i className="bi bi-key-fill"></i>
)}
</span>
</div>
<input
type="text"
className="form-control"
placeholder="Enter OTP"
{...register("otp", { required: "OTP is required" })}
/>
</div>
<span className="error small">{errors.otp?.message}</span>
<br />
<button type="submit" className="cssbuttons-io-button">
Verify
<div className="icon">
<svg height="24" width="24" viewBox="0 0 24 24">
<path d="M0 0h24v24H0z" fill="none"></path>
<path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" color="#7B4F2C" ></path>
</svg>
</div>
</button>
</div>
<div className="right-section">
<img src={forget} alt="OTP Verification" />
</div>
</form>
<Footer />
</>
);
};

export default Otp;