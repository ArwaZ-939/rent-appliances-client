import * as Yup from 'yup';

const ValidationRegisterSchema = Yup.object().shape({
    username: Yup.string().required("Username is required !!").matches(/^[a-zA-Z][a-zA-Z0-9]*$/,"Username must start with a letter and can only contain letters and numbers, no special characters."),
    ProfileUrl:Yup.string().url("Must be valid link !!").notRequired(),
    email:Yup.string().email("Invalid email fromat !!").matches(/^[a-zA-Z0-9._%+-]+@(gmail\.com)$/, 'Email must be a Gmail address').required("Email is required !!"),
    password: Yup.string().min(8, "Password must be at least 8 characters !!").matches(/[!@#$%^&*(),.?":{}|<>]/,"Password must contain at least one special character !!").required("Password is required !!"),
    conPassword:Yup.string().oneOf([Yup.ref("password")],'Password must be match !!').required("Password is required !!"),
    checkbox:Yup.bool().oneOf([true],"You must agree all the terms"),
    gender: Yup.string().required("Gender is required !!")
})


export default ValidationRegisterSchema;