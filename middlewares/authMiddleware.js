import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected routes token base
export const requireSignIn = async (req, res, next) => {
    try {
        // Modification: Check if authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send({
                success: false,
                message: "Authorization token missing", // Modification: Error response when no token is provided
            });
        }

        const decode = JWT.verify(
            authHeader,
            process.env.JWT_SECRET
        );
        req.user = decode;
        next();
    } catch (error) {
        console.log(error);
        // Modification: Return error response if token validation fails
        return res.status(401).send({
            success: false,
            message: "Token validation failed", // Modification: Error message when token verification fails
        });
    }
};

// Admin access
export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);

        // Modification: Check if the user exists
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found", // Modification: Error response when no user is found
            });
        }

        if (user.role !== 1) {
            return res.status(401).send({
                success: false,
                message: "UnAuthorized Access",
            });
        }

        next();
        
    } catch (error) {
        console.log(error);
        // Modification: Avoid exposing sensitive error information and return 500 for internal server error
        return res.status(500).send({
            success: false,
            message: "Error in admin middleware", // Modification: Simplified error message
        });
    }
};