import * as yup from "yup";

const EmailValidation = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
});

export default EmailValidation;
