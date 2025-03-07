const childService = require('../services/ChildrenService');
const childModel = require('../models/childrenModel');

// Controller to get all Children
const getAllChildrens = async (req, res) => {
    try {
        // Retrieve all Children using the children service
        const Children = await childService.getAllChildrens();
        if (Children) {
            // Respond with a success status and the data
            res.status(200).json({ status: true, Children, message: "Data retrieved successfully" });
        } else {
            // If no Children found, respond with 404
            res.status(404).json({ status: false, message: "No data available" });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: 'Error retrieving Children' });
    }
};

// Controller to get a child by ID
const getChildById = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Retrieve child data by ID
        const child = await childService.getChildById(id);
        if (child) {
            // Respond with success if child found
            res.status(200).json({ status: true, child, message: "Child found" });
        } else {
            // Respond with 404 if child not found
            res.status(404).json({ status: false, error: 'Child not found' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Error retrieving child' });
    }
};

// Controller to create a new child
const createChild = (req, res) => {
    try {
        // Use child service to create a new child
        const child = childService.createChild(req.body);

        child
            .then(() => {
                // Respond with success status when child is created
                res.status(201).json({ status: true, message: "Child created successfully" });
            })
            .catch((error) => {
                // Handle specific and generic errors
                if (error.message === 'P2002') {
                    res.status(403).json({ status: false, message: "New user cannot be created with this email", code: "P2002" });
                } else {
                    res.status(404).json({ status: false, message: "Child creation unsuccessful Please Provide full details", code: "P4002" });
                }
            });
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: `Child could not be created - ${error}` });
    }
};

// Controller to update an existing child
const updateChild = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Use child service to update child data
        const child = await childService.updateChild(id, req.body);
        if (child) {
            // Respond with success if child is updated
            res.status(200).json({ status: true, message: "Child updated successfully" });
        } else {
            // Respond with 404 if child not found for update
            res.status(404).json({ status: false, message: "No user found to update" });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: 'Child could not be updated' });
    }
};

// Controller to delete a child
const deleteChild = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    const userId = req.body.id; // Get user ID from request body
    try {
        // Use child service to delete child
        const response = await childService.deleteChild(id, userId);
        if (response === 'Not a Child') {
            res.status(403).json({ status: false, message: response });
        } else if (response === 'Child not found') {
            res.status(404).json({ status: false, message: response });
        } else {
            res.status(200).json({ status: true, message: 'Child deleted' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Child could not be deleted' });
    }
};

// Controller to handle forgot password functionality
const forgotChild = async (req, res) => {
    const email = req.body.email; // Extract email from request body
    try {
        // Check if child with the email exists
        const child = await childModel.findUnique({ where: { email } });

        if (!child) {
            console.log("Child not found");
            return res.status(404).json({ status: false, message: "Child not found" });
        }

        // Handle forgot password via child service
        const response = await childService.forgotpassword(email);

        if (response === 'Not Found') {
            res.status(404).json({ status: false, message: 'Email not found' });
        } else if (response === 'OTP Sent') {
            res.status(200).json({ status: true, message: 'Reset link sent successfully :)' });
        } else if (response === 'Error in Mailing') {
            res.status(500).json({ status: false, message: 'Error in sending email' });
        } else {
            res.status(500).json({ status: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.log("Error in forgot password process:", error);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
};

// Controller to verify OTP for password reset
const verifyotp = async (req, res) => {
    try {
        // Use child service to verify OTP and reset password
        const result = await childService.verifyForgototp(req.body.email, req.body.otp, req.body.password);
        console.log("Response from verifyForgototp:", result);

        // Handle response based on the result
        if (result.message === 'Success') {
            res.status(200).json({ status: true, message: "Password reset success" });
        } else if (result.message === 'Child not found') {
            res.status(404).json({ status: false, error: 'Email not found' });
        } else if (result.message === 'Invalid OTP or expired code') {
            res.status(400).json({ status: false, error: 'Invalid OTP or expired code' });
        } else if (result.message === 'Error in resetting') {
            res.status(403).json({ status: false, error: result.error });
        } else {
            res.status(400).json({ status: false, error: 'Unknown error occurred' });
        }
    } catch (error) {
        console.log("Error while resetting:", error);
        res.status(500).json({ message: 'Error while resetting password', error: error.message });
    }
};

// Controller to handle login
const login = async (req, res) => {
    try {
        // Use child service to login and retrieve token
        const { token } = await childService.login(req.body.email, req.body.password);
        console.log("Response from login is....", token);

        if (token !== undefined) {
            // Set cookie with token and respond with success
            res.cookie('token', token, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "none",
                secure: true,
                Domain: process.env.Origins
            }).status(200).json({ status: true, token });
        } else {
            // Respond with 404 if login fails
            res.status(404).json({ status: false, error: 'Invalid login credentials' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ message: `Error while login`, error });
    }
};

// Export all controllers
module.exports = {
    getAllChildrens,
    getChildById,
    createChild,
    updateChild,
    deleteChild,
    login,
    forgotChild,
    verifyotp
};
