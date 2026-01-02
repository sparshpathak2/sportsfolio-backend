import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { attachUser } from './middlewares/attachUser.middleware.js';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

/* CORS for mobile apps */
app.use(cors({
    origin: true, // allow all origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-Id"]
}));

/* JSON + URL-encoded parser */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Request Logger */
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const userId = req.user?.id || 'anonymous';
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms) | user=${userId}`);
    });
    next();
});

app.use(cookieParser());

/* Public routes */
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

/* Attach user for protected routes */
app.use(attachUser);

/* Default route */
app.get('/', (req, res) => res.send('API is running...'));

/* Start server */
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
