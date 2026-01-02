import express from "express";
import proxy from "express-http-proxy";

const router = express.Router();

const COMPETITION_SERVICE_URL =
    process.env.COMPETITION_SERVICE_URL || "http://localhost:3003";

const attachUserHeaders = (proxyReqOpts, srcReq) => {
    if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
        proxyReqOpts.headers["x-user-phone"] = srcReq.user.phone;
    }
    return proxyReqOpts;
};

const buildProxy = (basePath) =>
    proxy(COMPETITION_SERVICE_URL, {
        proxyReqPathResolver: (req) => `${basePath}${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    });

router.use("/tournaments", buildProxy("/tournaments"));

router.use("/matches", buildProxy("/matches"));

router.use("/participants", buildProxy("/participants"));

router.use("/locations", buildProxy("/locations"));

export default router;
