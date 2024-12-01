const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const parentModel = require('../models/parentModel');
const { Prisma } = require("@prisma/client");
const sendemailService = require('../services/sendemailservices');

// Fetch all parents and their associated children
const getAllParents = async () => {
    const parents = await parentModel.findMany({
        include: {
            Children: true // Include children in the response
        }
    });
    return parents;
};

// Fetch a specific parent by their ID
const getParentById = async (id) => {
    return await parentModel.findUnique({
        where: { id }, // Find by unique ID
        include: { Children: true } // Include children in the response
    });
};

// Create a new parent
const createParent = async (parentDetails) => {
    console.log("Incoming request to create a parent...");

    // Hash the parent password
    const hashedPassword = await bcrypt.hash(parentDetails.password, 10);
    return new Promise((resolve, reject) => {
        // Check if the email already exists in the database
        parentModel.findUnique({ where: { email: parentDetails.email } }).then((isfound) => {
            if (isfound) {
                console.log("Email already exists. Prompting user to login.");
                reject(new Error("P2002")); // Error for duplicate entry
            } else {
                const data = {
                    name: parentDetails.name,
                    email: parentDetails.email,
                    password: hashedPassword,
                    profile_img: parentDetails.profile_img,
                    address: parentDetails.address,
                    phoneNumber: parentDetails.phoneNumber,
                };
                // Create a new parent in the database
                parentModel.create({ data }).then((res) => {
                    console.log("Parent created successfully:", res);
                    resolve(true);
                }).catch((error) => {
                    console.log("Failed to create parent account.", error);
                    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                        console.log("Error in parent creation", error);
                        reject(new Error("P2002")); // Duplicate error
                    } else {
                        console.log("Error in parent creation", error);
                        reject(new Error("Unexpected error"));
                    }
                });
            }
        }).catch((error) => {
            console.log("Error in parent creation", error);
            reject(new Error("Unexpected error"));
        });
    });
};

// Update parent details
const updateParent = async (id, parentDetails) => {
    const updateData = { ...parentDetails };

    // Hash the password if it's being updated
    if (parentDetails.password) {
        updateData.password = await bcrypt.hash(parentDetails.password, 10);
    }

    // Check if the parent exists
    const isfound = await parentModel.findUnique({ where: { id } });
    if (isfound) {
        return new Promise((resolve, reject) => {
            parentModel.update({
                where: { id },
                data: updateData,
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    } else {
        return false; // Parent not found
    }
};

// Delete a parent by ID
const deleteParent = async (id, userId) => {
    console.log("Incoming request to delete parent");

    const parent = await parentModel.findUnique({ where: { id } });
    if (parent) {
        try {
            console.log("Parent found, proceeding to delete...");
            await parentModel.delete({ where: { id } });
            console.log("Parent deleted successfully");
            return true;
        } catch (error) {
            console.error("Error while deleting parent:", error);
            return error;
        }
    } else {
        console.log("Parent not found");
        return 'Parent not found';
    }
};

// Generate a random OTP of specified length
function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

// Handle forgot password functionality
const forgotpassword = async (email) => {
    console.log("Processing forgot password request...");

    try {
        // Check if the parent exists
        const parent = await parentModel.findUnique({ where: { email } });
        if (!parent) {
            console.log("Parent not found");
            return 'Not Found';
        }

        const id = parent.id;
        console.log("Parent found, generating OTP...");

        // Generate OTP and set expiry time
        const otp = generateOTP();
        await parentModel.update({
            where: { id },
            data: { forgot_code: otp, code_expiary: new Date(Date.now() + 10 * 60000) } // 10 minutes expiry
        });

        console.log("Forgot code and expiry updated.");

        // Send OTP via email
        const response = await sendemailService.sendForgotCode(email, otp, parent.name);
        if (response === 'OTP Sent') {
            console.log("OTP sent successfully.");
            return 'OTP Sent';
        } else {
            console.log("Error while sending OTP.");
            return 'Error in Mailing';
        }
    } catch (error) {
        console.error("Error in forgot password process:", error);
        return 'Error in processing request';
    }
};

// Verify OTP and reset password
const verifyForgototp = async (email, otp, password) => {
    try {
        console.log("Verifying OTP for forgot password request...");

        // Fetch parent details by email
        const parent = await parentModel.findUnique({ where: { email } });

        if (!parent) {
            console.log("Parent not found.");
            return { message: 'Parent not found', status: false };
        }

        // Validate OTP and expiry
        if (new Date() < parent.code_expiary && otp === parent.forgot_code) {
            console.log("Valid OTP. Resetting password...");
            const hashedPassword = await bcrypt.hash(password, 10);
            await parentModel.update({
                where: { email },
                data: { forgot_code: null, code_expiary: null, password: hashedPassword }
            });
            return { message: 'Success', status: true };
        } else {
            console.log("Invalid OTP or expired code.");
            return { message: 'Invalid OTP or expired code', status: false };
        }
    } catch (error) {
        console.error("Error in resetting password:", error);
        return { message: 'Error in resetting', error: error.message, status: false };
    }
};

// Login functionality
const login = async (email, password) => {
    console.log("Processing login request...");
    try {
        // Find parent by email
        const parent = await parentModel.findUnique({ where: { email } });

        if (parent && await bcrypt.compare(password, parent.password)) {
            console.log("Login successful, generating token...");
            const token = generateToken(parent);
            return { token };
        } else {
            console.log("Invalid credentials.");
            return null;
        }
    } catch (error) {
        console.error("Error during login:", error);
        throw new Error("Error during login");
    }
};

// Generate JWT token
function generateToken(parent) {
    console.log("Generating JWT token...");
    const secretKey = process.env.JWT_SECRET; // Use environment variable for the secret key
    const expiresIn = "1h"; // Token expiry time
    return jwt.sign(
        { user: parent.id, name: parent.name, img: parent.profile_img },
        secretKey,
        { expiresIn }
    );
}

// Export the service functions
module.exports = {
    getAllParents,
    getParentById,
    createParent,
    updateParent,
    deleteParent,
    login,
    forgotpassword,
    verifyForgototp
};
