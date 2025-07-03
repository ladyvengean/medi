import { asyncHandler } from "../utils/asyncHandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import User from "../models/user.models.js";
import { BloodDonation, AmbulanceRequest } from "../models/document.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// **REGISTER USER**
const registerUser = asyncHandler(async (req, res) => {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
        throw new Apierror(400, "All fields are required");
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
        throw new Apierror(409, "User with this phone number already exists");
    }

    const newUser = await User.create({
        name,
        phone,
        password,
    });

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            _id: newUser._id,
            name: newUser.name,
            phone: newUser.phone,
        },
    });
});

// **LOGIN USER**
const loginUser = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        throw new Apierror(400, "Phone number and password are required");
    }

    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
        throw new Apierror(401, "Invalid phone number or password");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new Apierror(401, "Invalid phone number or password");
    }

    const token = generateToken(user._id);
    return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            _id: user._id,
            name: user.name,
            phone: user.phone,
        },
    });
});

// **GET CURRENT USER**
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new Apierror(404, "User not found");
    }

    return res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            phone: user.phone,
        },
    });
});

// **BLOOD DONATION REQUEST**
const createBloodDonationRequest = asyncHandler(async (req, res) => {
    const { name, email, phone, bloodGroup, address, preferredDate } = req.body;

    if (!name || !email || !phone || !bloodGroup || !address || !preferredDate) {
        throw new Apierror(400, "All fields are required");
    }

    const bloodDonation = await BloodDonation.create({
        name,
        email,
        phone,
        bloodGroup,
        address,
        preferredDate,
        userId: req.user?._id // Optional user ID if authenticated
    });

    return res.status(201).json(
        new Apiresponse(201, bloodDonation, "Blood donation request submitted successfully")
    );
});

// **AMBULANCE REQUEST**
const createAmbulanceRequest = asyncHandler(async (req, res) => {
    const { patientName, contactNumber, emergencyType, pickupAddress, additionalInfo } = req.body;

    if (!patientName || !contactNumber || !emergencyType || !pickupAddress) {
        throw new Apierror(400, "Patient name, contact number, emergency type, and pickup address are required");
    }

    // Set priority based on emergency type
    let priority = 'medium';
    if (emergencyType === 'Heart Attack' || emergencyType === 'Breathing Problem') {
        priority = 'critical';
    } else if (emergencyType === 'Accident') {
        priority = 'high';
    }

    const ambulanceRequest = await AmbulanceRequest.create({
        patientName,
        contactNumber,
        emergencyType,
        pickupAddress,
        additionalInfo,
        priority,
        userId: req.user?._id // Optional user ID if authenticated
    });

    return res.status(201).json(
        new Apiresponse(201, ambulanceRequest, "Ambulance request submitted successfully")
    );
});

// **GET USER'S BLOOD DONATIONS**
const getUserBloodDonations = asyncHandler(async (req, res) => {
    const donations = await BloodDonation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    return res.status(200).json(
        new Apiresponse(200, donations, "Blood donations retrieved successfully")
    );
});

// **GET USER'S AMBULANCE REQUESTS**
const getUserAmbulanceRequests = asyncHandler(async (req, res) => {
    const requests = await AmbulanceRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    return res.status(200).json(
        new Apiresponse(200, requests, "Ambulance requests retrieved successfully")
    );
});

// **LOGOUT USER**
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1,
        },
    }, {
        new: true,
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json({
        success: true,
        message: "User logged out successfully"
    });
});

export { 
    registerUser, 
    loginUser, 
    getCurrentUser, 
    createBloodDonationRequest,
    createAmbulanceRequest,
    getUserBloodDonations,
    getUserAmbulanceRequests,
    logoutUser 
};