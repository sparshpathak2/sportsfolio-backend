import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import platformRoutes from "./routes/platform.routes.js";
import competitionRoutes from "./routes/competition.routes.js";
// import notificationRoutes from "./routes/notification.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = express();

app.set("trust proxy", 1);

const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = "http://localhost:3000";

/* ======================================================
   1️⃣ CORS (FIRST)
   ====================================================== */
app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

/* ======================================================
   2️⃣ PRE-FLIGHT HANDLER (NO ROUTES, NO *)
   ====================================================== */
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
//     res.header("Access-Control-Allow-Credentials", "true");

//     if (req.method === "OPTIONS") {
//         res.header(
//             "Access-Control-Allow-Headers",
//             "Content-Type, Authorization, X-Requested-With"
//         );
//         res.header(
//             "Access-Control-Allow-Methods",
//             "GET, POST, PUT, PATCH, DELETE, OPTIONS"
//         );
//         return res.sendStatus(204);
//     }

//     next();
// });

/* ======================================================
   2️⃣ REQUEST LOGGER (GLOBAL)
   ====================================================== */
app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const userId = req.user?.id || "anonymous";

        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms) | user=${userId}`
        );
    });

    next();
});

app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

/* ======================================================
   3️⃣ COOKIES
   ====================================================== */
app.use(cookieParser());

/* ======================================================
   4️⃣ JSON PARSER
   ====================================================== */
app.use((req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.startsWith("multipart/form-data")) return next();
    express.json({ limit: "10mb" })(req, res, next);
});

/* ======================================================
   7️⃣ HEALTH
   ====================================================== */
app.get("/health", (req, res) => {
    res.json({ status: "API Gateway running ✅" });
});

/* ======================================================
   5️⃣ AUTH (OPTIONS NEVER REACH HERE)
   ====================================================== */
app.use(authMiddleware);

/* ======================================================
   6️⃣ ROUTES
   ====================================================== */
app.use("/api/platform-service", platformRoutes);
app.use("/api/competition-service", competitionRoutes);


/* ======================================================
   8️⃣ START
   ====================================================== */
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 API Gateway running on http://127.0.0.1:${PORT}`);
    console.log(`🌍 Public webhook endpoint: /api/integrations/fb/webhook`);
});
