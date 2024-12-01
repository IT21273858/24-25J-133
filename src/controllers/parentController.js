const parentService = require('../services/parentService');
const parentModel = require('../models/parentModel');

// Controller to get all parents
const getAllParents = async (req, res) => {
    try {
        // Retrieve all parents using the parent service
        const parents = await parentService.getAllParents();
        if (parents) {
            // Respond with a success status and the data
            res.status(200).json({ status: true, parents, message: "Data retrieved successfully" });
        } else {
            // If no parents found, respond with 404
            res.status(404).json({ status: false, message: "No data available" });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: 'Error retrieving parents' });
    }
};

// Controller to get a parent by ID
const getParentById = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Retrieve parent data by ID
        const parent = await parentService.getParentById(id);
        if (parent) {
            // Respond with success if parent found
            res.status(200).json({ status: true, parent, message: "Parent found" });
        } else {
            // Respond with 404 if parent not found
            res.status(404).json({ status: false, error: 'Parent not found' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Error retrieving parent' });
    }
};

// Controller to create a new parent
const createParent = (req, res) => {
    try {
        // Use parent service to create a new parent
        const parent = parentService.createParent(req.body);
        parent
            .then(() => {
                // Respond with success status when parent is created
                res.status(201).json({ status: true, message: "Parent created successfully" });
            })
            .catch((error) => {
                // Handle specific and generic errors
                if (error.message === 'P2002') {
                    res.status(403).json({ status: false, message: "New user cannot be created with this email", code: "P2002" });
                } else {
                    res.status(404).json({ status: false, message: "Parent creation unsuccessful" });
                }
            });
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: `Parent could not be created - ${error}` });
    }
};

// Controller to update an existing parent
const updateParent = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Use parent service to update parent data
        const parent = await parentService.updateParent(id, req.body);
        if (parent) {
            // Respond with success if parent is updated
            res.status(200).json({ status: true, message: "Parent updated successfully" });
        } else {
            // Respond with 404 if parent not found for update
            res.status(404).json({ status: false, message: "No user found to update" });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: 'Parent could not be updated' });
    }
};

// Controller to delete a parent
const deleteParent = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    const userId = req.body.id; // Get user ID from request body
    try {
        // Use parent service to delete parent
        const response = await parentService.deleteParent(id, userId);
        if (response === 'Not a Parent') {
            res.status(403).json({ status: false, message: response });
        } else if (response === 'Parent not found') {
            res.status(404).json({ status: false, message: response });
        } else {
            res.status(200).json({ status: true, message: 'Parent deleted' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Parent could not be deleted' });
    }
};

// Controller to handle forgot password functionality
const forgotParent = async (req, res) => {
    const email = req.body.email; // Extract email from request body
    try {
        // Check if parent with the email exists
        const parent = await parentModel.findUnique({ where: { email } });

        if (!parent) {
            console.log("Parent not found");
            return res.status(404).json({ status: false, message: "Parent not found" });
        }

        // Handle forgot password via parent service
        const response = await parentService.forgotpassword(email);

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
        // Use parent service to verify OTP and reset password
        const result = await parentService.verifyForgototp(req.body.email, req.body.otp, req.body.password);
        console.log("Response from verifyForgototp:", result);

        // Handle response based on the result
        if (result.message === 'Success') {
            res.status(200).json({ status: true, message: "Password reset success" });
        } else if (result.message === 'Parent not found') {
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
        // Use parent service to login and retrieve token
        const { token } = await parentService.login(req.body.email, req.body.password);
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
    getAllParents,
    getParentById,
    createParent,
    updateParent,
    deleteParent,
    login,
    forgotParent,
    verifyotp
};
