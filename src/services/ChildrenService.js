const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const employeeModel = require('../models/employeeModel')
const { Prisma } = require("@prisma/client");
const sendemailService = require('../services/sendemailservices')

const getAllEmployees = async () => {
    const employees = await employeeModel.findMany();
    return employees;
};

const getEmployeeById = async (id) => {
    return await employeeModel.findUnique({ where: { id } });
};

const createEmployee = async (employeeDetails) => {
    console.log("Income to create an employee.....");
    const hashedPassword = await bcrypt.hash(employeeDetails.password, 10);
    return new Promise((resolve, reject) => {
        employeeModel.findUnique({ where: { email: employeeDetails.email } }).then((isfound) => {
            if (isfound) {
                console.log("Sorry... credentials already exist... \n try to login :)");
                reject(new Error("P2002"));
            } else {
                const data = {
                    name: employeeDetails.name,
                    email: employeeDetails.email,
                    password: hashedPassword,
                    address: employeeDetails.address,
                    phoneNumber: employeeDetails.phoneNumber,
                    profile_img: employeeDetails.profile_img,
                };
                employeeModel.create({ data }).then((res) => {
                    console.log("employee has been created sucessfully..");
                    console.log(res);
                    resolve(true);
                })
                    .catch((error) => {
                        console.log("Sorry cannot create an account for you... :(");
                        if (error instanceof Prisma.PrismaClientKnownRequestError) {
                            if (error.code === 'P2002') {
                                reject(new Error("P2002"));
                            } else {
                                reject(new Error("Prisma error"));
                            }
                        } else {
                            reject(new Error("Unexpected error"));
                        }
                    });
            }
        }).catch((error) => {
            reject(new Error("Unexpected error"));
        });
    });
};


const updateEmployee = async (id, employeeDetails) => {
    const updateData = { ...employeeDetails };

    if (employeeDetails.password) {
        updateData.password = await bcrypt.hash(employeeDetails.password, 10);
    }
    const isfound = await employeeModel.findUnique({ where: { id } })
    if (isfound) {
        new Promise(async (resolve, reject) => {
            employeeModel.update({
                where: { id },
                data: updateData,
            }).then((response) => { resolve(response) }).catch((error) => { reject(error) })
        })
        return true
    }
    else {
        return false
    }
};

const deleteEmployee = async (id, userId) => {
    console.log("Income to delete Employee");

    const employee = await employeeModel.findUnique({ where: { id } })
    try {
        if (employee) {
            console.log("Employee found");

            await employeeModel.delete({ where: { id } }).then((admin) => {
                console.log("Employee deleted");
                return admin
            })
                .catch((error) => {
                    console.log(error);
                    return error
                })
        }
        else {
            console.log("Employee not found");
            return ('Employee not found')
        }
        // if (admin.Role == 'Admin') {
        // }
        // else {
        //     console.log("Not an Admin");

        //     return ('Not an Admin')
        // }
    }
    catch (error) {
        if (error === 'Not an admin') {
            console.error("User is not authorized to delete");
        } else {
            console.error("Error deleting user:", error);
        }
        throw error;
    }
};

function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

const forgotpassword = async (email) => {
    console.log("Incoming request to forgot password....");

    try {
        const employee = await employeeModel.findUnique({ where: { email: email } });

        if (!employee) {
            console.log("Employee not found");
            return 'Not Found';
        }

        const id = employee.id;
        console.log("Employee found...");

        const otp = generateOTP();
        await employeeModel.update({
            where: { id },
            data: { forgot_code: otp, code_expiary: new Date(Date.now() + 10 * 60000) }  // 10 minutes expiry
        });

        console.log("Forgot code and expiry updated...");

        const response = await sendemailService.sendForgotCode(email, otp, employee.name);
        console.log("Email sending response:", response);

        if (response === 'OTP Sent') {
            console.log("OTP Sent for forgot request");
            return 'OTP Sent';
        } else {
            console.log("Error in sending forgot OTP email");
            return 'Error in Mailing';
        }

    } catch (error) {
        console.log("Error in processing forgot password request:", error);
        return 'Error in processing request';
    }
};


const verifyForgototp = async (email, otp, password) => {
    try {
        console.log("Incoming request to verify the forgot OTP code...", email, otp, password);

        // Fetch the employee record by email
        const employee = await employeeModel.findUnique({ where: { email: email } });

        if (!employee) {
            // Handle if no employee is found
            console.log("Employee not found");
            return { message: 'Employee not found', status: false };
        }

        // Check if the OTP is valid and not expired
        if (new Date() < employee.code_expiary && otp === employee.forgot_code) {
            console.log("OTP is valid, resetting password...");

            // Update the employee's password and clear OTP and expiry
            const hpass = await bcrypt.hash(password, 10);
            await employeeModel.update({
                where: { email },
                data: { forgot_code: null, code_expiary: null, password: hpass }
            });

            console.log("Password updated successfully");
            return { message: 'Success', status: true };
        } else {
            console.log("Invalid OTP or expired code");
            return { message: 'Invalid OTP or expired code', status: false };
        }
    } catch (error) {
        console.error("Error in resetting password:", error);
        return { message: 'Error in resetting', error: error.message, status: false };
    }
};


const login = async (email, password) => {
    console.log("Request income to login....");
    try {
        const employee = await employeeModel.findUnique({
            where: {
                email: email
            }
        })
        //console.log("Employee is", employee, password);
        const matchs = await bcrypt.compare(password, employee.password);

        if (employee && matchs) {
            console.log("Login sucess.... sending token.....");
            const token = generateToken(employee);
            return { token };
        } else {
            console.log("Invalid user credentials");
            return email
        }

    } catch (error) {

        console.log("Error while login....");
        throw new Error("Error while login");
    }


}

// Generating JWT Token for successful login
function generateToken(employee) {
    console.log("Creating token....");
    const secretKey = process.env.JWT_SECRET; // Use environment variable for the secret key
    const expiresIn = "1h";
    console.log("Token generated");
    return jwt.sign({ user: employee.id, name: employee.name, img: employee.profile_img }, secretKey, { expiresIn });
}

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    login,
    forgotpassword,
    verifyForgototp
};
