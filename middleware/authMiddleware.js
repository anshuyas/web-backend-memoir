import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
    const secret = process.env.JWT_SECRET;
    console.log("JWT_SECRET from .env:", secret ? "Loaded" : "Not Set");

    const authHeader = req.header("Authorization");
    console.log("Authorization Header:", authHeader || "None");

    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid token format. Expected 'Bearer <token>'." });
    }

    try {
        const decoded = jwt.verify(token, secret);
        console.log("Decoded Token:", decoded);

        if (!decoded.userId) {
            return res.status(403).json({ message: "Invalid token. User ID missing." });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};
