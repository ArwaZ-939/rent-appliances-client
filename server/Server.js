import express, { application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./Models/User.js";
import ApplianceModel from "./Models/Appliance.js";
import FeedbackModel from "./Models/Feedback.js";
import OrderModel from "./Models/Order.js";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import Appliance from './Models/Appliance.js';
import twilio from 'twilio';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

let app = express();
app.use(cors());
app.use(express.json());
const MongConnect = "mongodb+srv://Shifw:Sh121212@cluster0.djsr0sq.mongodb.net/Renting_household_appliances";
mongoose.connect(MongConnect,{
    //useNewUrlParser: true,
    //useUnifiedTopology:true
});


//Search by Keyword - Enhanced to support both English and Arabic
app.get('/api/suggestions', async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    // Search in both English name and Arabic name fields
    const suggestions = await Appliance.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { name_ar: { $regex: keyword, $options: 'i' } }
      ]
    }).limit(10); // limit suggestions

    // Return both English and Arabic names for better matching
    const results = suggestions.map(item => ({
      name: item.name,
      name_ar: item.name_ar || null
    }));

    res.json(results);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'arw93955@gmail.com',
        pass: 'ivjd rpcm pbme tuam',
    },
});

// api for insert new User
app.post("/addUser", async (req, res) => {
    console.log("Received /addUser request", req.body);
    try {
        const user = await UserModel.findOne({ user: req.body.user });
        const email = await UserModel.findOne({ email: req.body.email });


        if (user) {
            return res.status(400).json({ message: "User already exists." });
        } else if (email) {
            return res.status(400).json({ message: "Email already exists." });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);


            const newUser = new UserModel({
                user: req.body.user,
                password: hashedPassword, 
                isAdmin: req.body.isAdmin || false,
                email: req.body.email,
                gender: req.body.gender,
                imgUrl: req.body.imgUrl,
            });

            await newUser.save();
            // Return the user object as expected by the frontend
            return res.status(201).json({ UserServer: newUser, message: "User added successfully." });
        }
    }catch (error) {
        console.error("Error saving user:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// api for login User
app.post("/getUser", async (req, res) => {
    try {
        const user = await UserModel.findOne({ user: { $regex: `^${req.body.user}$`, $options: 'i' } });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        } else {
            // Compare the hashed password
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (isMatch) {
                return res.status(200).json({ user: user, message: "Login successful." });
            } else {
                return res.status(401).json({ message: "Invalid password." });
            }
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// api to update user details
app.put('/updateUser/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const { password, imgUrl, gender, newUsername, email } = req.body;

        console.log("=== UPDATE USER REQUEST ===");
        console.log("Current username:", user);
        console.log("Request body:", req.body);

        const existingUser = await UserModel.findOne({ user });
        if (!existingUser) {
            console.log("User not found:", user);
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log("Found existing user:", {
            id: existingUser._id,
            username: existingUser.user,
            email: existingUser.email,
            gender: existingUser.gender
        });

        // Check for username uniqueness if newUsername is provided
        if (newUsername && newUsername !== user) {
            const usernameExists = await UserModel.findOne({ user: newUsername.toLowerCase() });
            if (usernameExists) {
                console.log("Username already exists:", newUsername);
                return res.status(400).json({ message: 'Username already exists.' });
            }
        }

        // Check for email uniqueness if email is provided
        if (email && email !== existingUser.email) {
            const emailExists = await UserModel.findOne({ email: email });
            if (emailExists) {
                console.log("Email already exists:", email);
                return res.status(400).json({ message: 'Email already exists.' });
            }
        }

        // Track what fields are being updated
        const updates = {};

        // Update allowed fields
        if (password) {
            existingUser.password = await bcrypt.hash(password, 10);
            updates.password = "***HASHED***";
        }
        if (imgUrl) {
            existingUser.imgUrl = imgUrl;
            updates.imgUrl = imgUrl;
        }
        if (gender) {
            existingUser.gender = gender;
            updates.gender = gender;
        }
        if (newUsername && newUsername !== user) {
            existingUser.user = newUsername.toLowerCase();
            updates.user = newUsername.toLowerCase();
        }
        if (email && email !== existingUser.email) {
            existingUser.email = email;
            updates.email = email;
        }

        console.log("Fields to be updated:", updates);

        // Save the updated user to database
        const updatedUser = await existingUser.save();
        
        console.log("User updated successfully in database:", {
            id: updatedUser._id,
            username: updatedUser.user,
            email: updatedUser.email,
            gender: updatedUser.gender
        });

        res.status(200).json({ 
            message: 'User updated successfully.', 
            user: {
                id: updatedUser._id,
                user: updatedUser.user,
                email: updatedUser.email,
                gender: updatedUser.gender,
                imgUrl: updatedUser.imgUrl,
                isAdmin: updatedUser.isAdmin
            }
        });
    } catch (error) {
        console.error("=== ERROR UPDATING USER ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

// api to verify user update in database
app.get('/verifyUserUpdate/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log("=== VERIFYING USER UPDATE ===");
        console.log("Checking username:", username);

        const user = await UserModel.findOne({ user: username.toLowerCase() });
        if (!user) {
            console.log("User not found for verification:", username);
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log("User found in database:", {
            id: user._id,
            username: user.user,
            email: user.email,
            gender: user.gender,
            imgUrl: user.imgUrl,
            isAdmin: user.isAdmin,
            updatedAt: user.updatedAt
        });

        res.status(200).json({
            message: 'User verification successful',
            user: {
                id: user._id,
                user: user.user,
                email: user.email,
                gender: user.gender,
                imgUrl: user.imgUrl,
                isAdmin: user.isAdmin,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error("=== ERROR VERIFYING USER ===");
        console.error("Error details:", error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

// api for get Users details
app.get("/getUsers", async (req, res) => {
    try {
        console.log("Fetching all users...");
        // Fetch ALL users (including admins)
        const users = await UserModel.find({});
        console.log("Found users:", users.length);
        console.log("Users:", users.map(u => ({ id: u._id, user: u.user, email: u.email, isAdmin: u.isAdmin })));
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// api for insert new Appliance
app.post("/inserAppliance", async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        
        // Normalize price if it's a string (e.g., "5 OR" -> 5)
        let normalizedPrice = 0;
        if (req.body.price) {
            if (typeof req.body.price === 'string') {
                const priceMatch = req.body.price.toString().match(/\d+(\.\d+)?/);
                normalizedPrice = priceMatch ? parseFloat(priceMatch[0]) : parseFloat(req.body.price) || 0;
            } else {
                normalizedPrice = parseFloat(req.body.price) || 0;
            }
        }
        
        const newAppliance = new ApplianceModel({
            name: req.body.name,
            name_ar: req.body.name_ar || "",
            imgUrl: req.body.imgUrl || "",
            price: normalizedPrice,
            details: req.body.details,
            details_ar: req.body.details_ar || "",
            available: req.body.available,
        });
        
        console.log("Creating appliance:", newAppliance);
        await newAppliance.save();
        console.log("Appliance saved successfully");
        return res.status(201).json({ message: "Appliance added successfully." });
    } catch (error) {
        console.error("Error saving appliance:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});

// api for aggrecation to get User Appliances
app.get("/getSpecificAppliance", async (req, res) => {
    try {
        const ApplianceWithUser = await ApplianceModel.aggregate([
            {
                $lookup: {
                    from: "users", 
                    localField: "name", // Field in ApplianceModel
                    foreignField: "user", // Field in UserModel for joining
                    as: "userdata"
                }
            },
            {
                "$project": {
                    "userdata.password": 0, // ignore password
                    "userdata.user": 0 // ignore user
                }
            }
        ]);
        if (!ApplianceWithUser || ApplianceWithUser.length === 0) {
            return res.status(404).json({ message: "No appliances found." });
        }
        res.json({ Appliance: ApplianceWithUser });
    } catch (error) {
        console.error("Error fetching specific appliances:", error); 
        return res.status(500).json({ message: error.message });
    }
});

// Test endpoint to check if delete route is working
app.delete('/test-delete', (req, res) => {
    console.log("=== TEST DELETE ROUTE HIT ===");
    res.json({ message: 'Delete route working' });
});

// Test endpoint to check database connection
app.get('/test-db', async (req, res) => {
    try {
        console.log("=== TESTING DATABASE CONNECTION ===");
        const userCount = await UserModel.countDocuments();
        console.log("Database connected. Total users:", userCount);
        res.json({ 
            message: 'Database connected', 
            userCount: userCount,
            connection: mongoose.connection.readyState 
        });
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Test endpoint to manually delete a user (for debugging)
app.delete('/test-delete-user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log("=== MANUAL DELETE TEST ===");
        console.log("Attempting to delete user with ID:", id);
        
        const user = await UserModel.findById(id);
        console.log("User found:", user);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const result = await UserModel.findByIdAndDelete(id);
        console.log("Delete result:", result);
        
        // Verify deletion
        const verify = await UserModel.findById(id);
        console.log("User still exists after deletion:", verify);
        
        res.json({ 
            message: 'User deleted manually', 
            deletedUser: result,
            stillExists: !!verify
        });
    } catch (error) {
        console.error("Manual delete error:", error);
        res.status(500).json({ message: 'Manual delete error', error: error.message });
    }
});

// api for delete any User
app.delete('/deleteUser/:id', async (req, res) => {
    console.log("=== DELETE USER ROUTE HIT ===");
    console.log("Route params:", req.params);
    console.log("Full URL:", req.url);
    console.log("Method:", req.method);
    
    try {
      const { id } = req.params; 
      console.log("=== DELETE USER REQUEST ===");
      console.log("Deleting user with ID:", id);
      console.log("Request body:", req.body);
      console.log("Request headers:", req.headers);
      
      // First check if user exists
      const existingUser = await UserModel.findById(id);
      console.log("Existing user found:", existingUser);
      
      if (!existingUser) {
        console.log("User not found with ID:", id);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete the user
      const deletedUser = await UserModel.findByIdAndDelete(id);
      console.log("User deleted successfully:", deletedUser);
      
      // Verify deletion by trying to find the user again
      const verifyDeletion = await UserModel.findById(id);
      console.log("Verification - user still exists:", verifyDeletion);
      
      res.status(200).json({ 
        message: 'User deleted successfully', 
        deletedUser: {
          id: deletedUser._id,
          username: deletedUser.user,
          email: deletedUser.email
        }
      });
    } catch (error) {
      console.error("=== ERROR DELETING USER ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  });

// api for delete any appliance
app.delete('/appliances/:id', async (req, res) => {
    try {
        const deletedAppliance = await ApplianceModel.findByIdAndDelete(req.params.id);

        if (!deletedAppliance) {
            return res.status(404).json({ message: 'Appliance not found' });
        }

        res.status(200).json({ message: 'Appliance deleted successfully', appliance: deletedAppliance });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting appliance', error: error.message });
    }
});

// Test route to check if server is receiving PUT requests
app.put('/test-update', (req, res) => {
    console.log("=== TEST UPDATE ROUTE HIT ===");
    res.json({ message: 'Test route working' });
});

// api for update any appliance
app.put('/updateAppliance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, name_ar, imgUrl, price, details, details_ar, available } = req.body;

        console.log("=== UPDATE APPLIANCE REQUEST ===");
        console.log("Appliance ID:", id);
        console.log("Request body:", req.body);
        console.log("Request headers:", req.headers);

        // First, let's check if we can find ANY appliances
        const allAppliances = await ApplianceModel.find({});
        console.log("All appliances in database:", allAppliances.map(app => ({ id: app._id, name: app.name })));

        // Find the appliance by ID
        const appliance = await ApplianceModel.findById(id);
        console.log("Found appliance:", appliance);

        if (!appliance) {
            console.log("Appliance not found with ID:", id);
            return res.status(404).json({ message: 'Appliance not found.' });
        }

        // Normalize existing price field if it's a string (e.g., "5 OR" -> 5)
        if (typeof appliance.price === 'string') {
            const priceMatch = appliance.price.toString().match(/\d+(\.\d+)?/);
            if (priceMatch) {
                appliance.price = parseFloat(priceMatch[0]);
            }
        }

        // Update appliance details
        if (name) appliance.name = name;
        if (name_ar !== undefined) appliance.name_ar = name_ar;
        if (imgUrl !== undefined) appliance.imgUrl = imgUrl;
        if (price) {
            // Normalize new price if it's a string
            if (typeof price === 'string') {
                const priceMatch = price.toString().match(/\d+(\.\d+)?/);
                appliance.price = priceMatch ? parseFloat(priceMatch[0]) : parseFloat(price);
            } else {
                appliance.price = parseFloat(price);
            }
        }
        if (details) appliance.details = details;
        if (details_ar !== undefined) appliance.details_ar = details_ar;
        if (available !== undefined) appliance.available = available;

        console.log("Updated appliance before save:", appliance);
        const updatedAppliance = await appliance.save();
        console.log("Appliance updated successfully:", updatedAppliance);
        res.status(200).json({ message: 'Appliance updated successfully', appliance: updatedAppliance });
    } catch (error) {
        console.error("=== ERROR UPDATING APPLIANCE ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: 'Error updating appliance', error: error.message });
    }
});

// Request OTP endpoint
app.post('/request-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes 
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        await transporter.sendMail({
            from: 'arw93955@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}. It expires in 10 minutes.`
        });
        return res.json({ message: 'OTP sent to email.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Failed to send OTP.' });
    }
});

// Verify OTP endpoint
app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user || !user.otp || !user.otpExpires) {
            return res.status(400).json({ message: 'OTP not requested.' });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }
        if (user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP expired.' });
        }
        // OTP is valid
        return res.json({ message: 'OTP verified.' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ message: 'Failed to verify OTP.' });
    }
});

// Reset password endpoint
app.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user || !user.otp || !user.otpExpires) {
            return res.status(400).json({ message: 'OTP not requested.' });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }
        if (user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP expired.' });
        }
        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Failed to reset password.' });
    }
});

// api for get user profile
app.get("/getUserProfile/:username", async (req, res) => {
    try {
        const user = await UserModel.findOne({ user: req.params.username.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Return user data without sensitive information
        const userData = {
            user: user.user,
            email: user.email,
            gender: user.gender,
            imgUrl: user.imgUrl,
            isAdmin: user.isAdmin
        };
        return res.status(200).json(userData);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// api for insert new Feedback
app.post("/addFeedback", async (req, res) => {
    try {
        console.log("Received feedback request body:", req.body);
        
        // Validate required fields
        if (!req.body.message || !req.body.message.trim()) {
            return res.status(400).json({ message: "Feedback message is required." });
        }
        
        const newFeedback = new FeedbackModel({
            user: req.body.user || "Anonymous",
            email: req.body.email || "",
            message: req.body.message.trim(),
            rating: req.body.rating || 0,
        });
        
        console.log("Creating feedback:", newFeedback);
        await newFeedback.save();
        console.log("Feedback saved successfully");
        return res.status(201).json({ message: "Feedback submitted successfully." });
    } catch (error) {
        console.error("Error saving feedback:", error);
        // Return more specific error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error: " + error.message });
        }
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});

// api for get all Feedback
app.get("/getFeedback", async (req, res) => {
    try {
        console.log("Fetching all feedback...");
        const feedbacks = await FeedbackModel.find({}).sort({ createdAt: -1 });
        console.log("Found feedbacks:", feedbacks.length);
        return res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// api for delete any Feedback
app.delete('/feedback/:id', async (req, res) => {
    try {
        const deletedFeedback = await FeedbackModel.findByIdAndDelete(req.params.id);

        if (!deletedFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json({ message: 'Feedback deleted successfully', feedback: deletedFeedback });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting feedback', error: error.message });
    }
});

// api for get orders by username
app.get("/getUserOrders/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const orders = await OrderModel.find({ user: username }).sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// api for get all orders
app.get("/getAllOrders", async (req, res) => {
    try {
        const orders = await OrderModel.find({}).sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// api to check if user has active orders (not returned)
app.get("/checkActiveOrders/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const activeOrders = await OrderModel.find({ 
            user: username,
            status: { $in: ['pending', 'active'] }
        });
        return res.status(200).json({ 
            hasActiveOrders: activeOrders.length > 0,
            activeOrders: activeOrders 
        });
    } catch (error) {
        console.error("Error checking active orders:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// api for create new order
app.post("/addOrder", async (req, res) => {
    try {
        console.log("Received order request body:", req.body);
        
        // Validate required fields
        if (!req.body.user || !req.body.email || !req.body.appliance) {
            return res.status(400).json({ message: "User, email, and appliance are required." });
        }
        
        // Find an available appliance with the matching name
        const availableAppliance = await ApplianceModel.findOne({
            name: req.body.appliance,
            available: true
        });
        
        if (!availableAppliance) {
            return res.status(400).json({ message: "No available appliances of this type. Please try another appliance." });
        }
        
        // Normalize price field if it's a string (e.g., "5 OR" -> 5)
        // Use updateOne to avoid validation issues with existing string prices
        let updateData = { available: false };
        
        if (typeof availableAppliance.price === 'string') {
            const priceMatch = availableAppliance.price.toString().match(/\d+(\.\d+)?/);
            if (priceMatch) {
                updateData.price = parseFloat(priceMatch[0]);
            }
        }
        
        // Update the appliance using updateOne to avoid full document validation
        await ApplianceModel.updateOne(
            { _id: availableAppliance._id },
            { $set: updateData }
        );
        console.log(`Appliance ${availableAppliance._id} (${availableAppliance.name}) marked as unavailable`);
        
        const newOrder = new OrderModel({
            user: req.body.user,
            email: req.body.email,
            appliance: req.body.appliance,
            applianceId: availableAppliance._id,
            startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
            endDate: req.body.endDate ? new Date(req.body.endDate) : new Date(),
            totalAmount: req.body.totalAmount || 0,
            status: req.body.status || 'pending',
            deliveryAddress: req.body.deliveryAddress || {}
        });
        
        console.log("Creating order:", newOrder);
        await newOrder.save();
        console.log("Order saved successfully");
        return res.status(201).json({ message: "Order created successfully.", order: newOrder });
    } catch (error) {
        console.error("Error saving order:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error: " + error.message });
        }
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});

// API endpoint to send notifications (Email or SMS)
app.post('/sendNotification', async (req, res) => {
  try {
    const { username, notificationType, message, phoneNumber, email } = req.body;
    
    console.log('Received notification request:', { username, notificationType, email, phoneNumber });
    
    if (!notificationType || !message) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    // Email Notification using nodemailer
    if (notificationType === 'email' && email) {
      try {
        await transporter.sendMail({
          from: 'arw93955@gmail.com',
          to: email,
          subject: 'AppliRent - Rental Booking Confirmation',
          text: message,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7B4F2C;">AppliRent Rental Confirmation</h2>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p>Thank you for choosing AppliRent!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          `
        });
        
        console.log(`Email sent to ${email} for user ${username}`);
        return res.status(200).json({ 
          message: 'Email notification sent successfully.',
          type: 'email'
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return res.status(500).json({ 
          message: 'Failed to send email notification.', 
          error: emailError.message 
        });
      }
    }
    
    // SMS Notification using Twilio
    if (notificationType === 'sms' && phoneNumber) {
      try {
        // Format Oman phone number
        let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
        
        // Add Oman country code if not present
        if (!formattedPhone.startsWith('968') && formattedPhone.length === 8) {
          formattedPhone = `+968${formattedPhone}`;
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = `+${formattedPhone}`;
        }
        
        // Initialize Twilio client directly with credentials
        const twilioClient = twilio(
          'ACbb3ade67e9ac05762b25d017481c3564',
          '47941b7f1e48f477bbd379a4f19b7e93'
        );
        
        await twilioClient.messages.create({
          body: message,
          from: '+16562339994',
          to: formattedPhone
        });
        
        console.log(`SMS sent to ${formattedPhone} for user ${username}`);
        return res.status(200).json({ 
          message: 'SMS notification sent successfully.', 
          type: 'sms'
        });
      } catch (smsError) {
        console.error('Error sending SMS:', smsError);
        return res.status(500).json({ 
          message: 'Failed to send SMS notification.', 
          error: smsError.message 
        });
      }
    }
    
    return res.status(400).json({ message: 'Invalid notification parameters.' });
  } catch (error) {
    console.error('Error in sendNotification endpoint:', error);
    return res.status(500).json({ 
      message: 'Internal server error.', 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});