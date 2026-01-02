import axios from "axios";

export const authMiddleware = async (req, res, next) => {

    // ✅ Always allow preflight
    if (req.method === "OPTIONS") {
        return next();
    }

    const publicRoutes = ["/login", "/signup", "/request-otp", "/verify-otp"];

    // allow login/signup requests without session
    // if (publicRoutes.includes(req.path)) return next();
    if (publicRoutes.some(route => req.path.endsWith(route))) {
        return next();
    }

    // const sessionId = req.cookies?.sessionId;

    const sessionId = req.headers["x-session-id"] || req.cookies?.sessionId;

    console.log("sessionId at authMiddleware:", sessionId)


    if (!sessionId) {
        return res.status(401).json({ message: "Unauthorized: No session" });
    }

    try {
        const response = await axios.post(
            `${process.env.PLATFORM_SERVICE_URL}/auth/verify-session`,
            // { sessionId },
            {},
            {
                headers: {
                    "x-session-id": sessionId,
                    Cookie: req.headers.cookie, // ✅ forward cookies
                },
            }
        );

        const { valid, user } = response.data;
        // console.log("response data from verify-session request", response.data)
        console.log("user from verify-session request", user)
        console.log("valid from verify-session request", valid)

        if (!valid || !user) {
            return res.status(401).json({ message: "Invalid session" });
        }

        req.user = user;

        console.log("user in req at auth:", req.user)

        req.headers["x-user-id"] = user.id;
        // req.headers["x-user-name"] = user.name;
        // req.headers["x-user-role"] = user.role?.name || "GUEST";
        // req.headers["x-dealer-id"] = user.dealerId || null;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({ message: "Auth check failed" });
    }
};
