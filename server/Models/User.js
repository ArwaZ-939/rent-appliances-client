import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user: {type:String, required:true, unique:true},
    isAdmin: { type: Boolean, default: false },
    imgUrl: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    gender: { type: String, default: "" },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpires: { type: Date }
});

const UserModel = mongoose.model('User', userSchema, 'users');
export default UserModel;