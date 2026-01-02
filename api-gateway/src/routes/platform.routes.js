import express from "express";
import proxy from "express-http-proxy";

const router = express.Router();

const PLATFORM_SERVICE_URL =
    process.env.PLATFORM_SERVICE_URL || "http://localhost:3002";

/* ======================================================
   Attach user headers to downstream services
   ====================================================== */
const attachUserHeaders = (proxyReqOpts, srcReq) => {
    if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
        proxyReqOpts.headers["x-user-phone"] = srcReq.user.phone;
    }
    return proxyReqOpts;
};

/* ======================================================
   Reusable Proxy Builder
   ====================================================== */
const buildProxy = (basePath) =>
    proxy(PLATFORM_SERVICE_URL, {
        proxyReqPathResolver: (req) => `${basePath}${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    });

/* ======================================================
   AUTH
   ====================================================== */
router.use("/auth", buildProxy("/auth"));

/* ======================================================
   USERS
   ====================================================== */
router.use("/users", buildProxy("/users"));

/* ======================================================
   PROFILES (multi-sport profiles)
   ====================================================== */
router.use("/profiles", buildProxy("/profiles"));

/* ======================================================
   LOCATIONS
   ====================================================== */
router.use("/locations", buildProxy("/locations"));

export default router;
