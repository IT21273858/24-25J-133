const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const childrenModel = require('../models/childrenModel');
const { Prisma } = require("@prisma/client");
const sendemailService = require('../services/sendemailservices');

// Fetch all childrens and their associated children
const getAllChildrens = async () => {
    const childrens = await childrenModel.findMany({
        include: {
            parent: true, // Include children in the response
            ChildLevel: true,  // Include childLevel in the response
            GameScore: {
                include:{game:true}
            } // Include gameScore in the response
        }
    });
    return childrens;
};

// Fetch a specific child by their ID
const getChildById = async (id) => {
    return await childrenModel.findUnique({
        where: { id }, // Find by unique ID
        include: {
            parent: true, // Include children in the response
            ChildLevel: true,  // Include childLevel in the response
            GameScore: {
                include:{game:true}

            } // Include gameScore in the response
        }
    });
};

// Create a new child
const createChild = async (childDetails) => {
    console.log("Incoming request to create a child...");

    // Hash the child password
    const hashedPassword = await bcrypt.hash(childDetails.password, 10);
    return new Promise((resolve, reject) => {
        // Check if the email already exists in the database
        childrenModel.findUnique({ where: { email: childDetails.email } }).then((isfound) => {
            if (isfound) {
                console.log("Email already exists. Prompting user to login.");
                reject(new Error("P2002")); // Error for duplicate entry
            } else {
                const data = {
                    name: childDetails.name,
                    email: childDetails.email,
                    password: hashedPassword,
                    profile_img: childDetails.profile_img,
                    parent_id: childDetails.parent_id,
                    address: childDetails.address,
                    phoneNumber: childDetails.phoneNumber,
                };
                // Create a new child in the database
                childrenModel.create({ data }).then((res) => {
                    console.log("Child created successfully:", res);
                    resolve(true);
                }).catch((error) => {
                    console.log("Failed to create child account.", error);
                    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                        console.log("Error in child creation", error);
                        reject(new Error("P2002")); // Duplicate error
                    } else {
                        console.log("Error in child creation", error);
                        reject(new Error("Unexpected error"));
                    }
                });
            }
        }).catch((error) => {
            console.log("Error in child creation", error);
            reject(new Error("Unexpected error"));
        });
    });
};

// Update child details
const updateChild = async (id, childDetails) => {
    const updateData = { ...childDetails };

    // Hash the password if it's being updated
    if (childDetails.password) {
        updateData.password = await bcrypt.hash(childDetails.password, 10);
    }

    // Check if the child exists
    const isfound = await childrenModel.findUnique({ where: { id } });
    if (isfound) {
        return new Promise((resolve, reject) => {
            childrenModel.update({
                where: { id },
                data: updateData,
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    } else {
        return false; // Child not found
    }
};

// Delete a child by ID
const deleteChild = async (id, userId) => {
    console.log("Incoming request to delete child");

    const child = await childrenModel.findUnique({ where: { id } });
    if (child) {
        try {
            console.log("child found, proceeding to delete...");
            await childrenModel.delete({ where: { id } });
            console.log("child deleted successfully");
            return true;
        } catch (error) {
            console.error("Error while deleting child:", error);
            return error;
        }
    } else {
        console.log("child not found");
        return 'Child not found';
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
        // Check if the child exists
        const child = await childrenModel.findUnique({ where: { email } });
        if (!child) {
            console.log("Child not found");
            return 'Not Found';
        }

        const id = child.id;
        console.log("Child found, generating OTP...");

        // Generate OTP and set expiry time
        const otp = generateOTP();
        await childrenModel.update({
            where: { id },
            data: { forgot_code: otp, code_expiary: new Date(Date.now() + 10 * 60000) } // 10 minutes expiry
        });

        console.log("Forgot code and expiry updated.");

        // Send OTP via email
        const response = await sendemailService.sendForgotCode(email, otp, child.name);
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

        // Fetch child details by email
        const child = await childrenModel.findUnique({ where: { email } });

        if (!child) {
            console.log("child not found.");
            return { message: 'child not found', status: false };
        }

        // Validate OTP and expiry
        if (new Date() < child.code_expiary && otp === child.forgot_code) {
            console.log("Valid OTP. Resetting password...");
            const hashedPassword = await bcrypt.hash(password, 10);
            await childrenModel.update({
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
        // Find child by email
        const child = await childrenModel.findUnique({ where: { email } });

        if (child && await bcrypt.compare(password, child.password)) {
            console.log("Login successful, generating token...");
            const token = generateToken(child);
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
function generateToken(child) {
    console.log("Generating JWT token...");
    const secretKey = process.env.JWT_SECRET; // Use environment variable for the secret key
    const expiresIn = "1h"; // Token expiry time
    return jwt.sign(
        { user: child.id, name: child.name, img: child.profile_img },
        secretKey,
        { expiresIn }
    );
}

// Export the service functions
module.exports = {
    getAllChildrens,
    getChildById,
    createChild,
    updateChild,
    deleteChild,
    login,
    forgotpassword,
    verifyForgototp
};
