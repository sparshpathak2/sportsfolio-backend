import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import tournamentRoutes from './modules/tournaments/tournament.routes.js';
import matchRoutes from './modules/matches/match.routes.js';
import { attachUser } from './middlewares/attachUser.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

/* CORS for mobile apps */
app.use(cors({
    origin: true, // allow all origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
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

/* Attach user for protected routes */
app.use(attachUser);

/* Public routes */
app.use('/tournaments', tournamentRoutes);
app.use('/matches', matchRoutes);

// /* Attach user for protected routes */
// app.use(attachUser);

/* Default route */
app.get('/', (req, res) => res.send('API is running...'));

/* Start server */
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});

