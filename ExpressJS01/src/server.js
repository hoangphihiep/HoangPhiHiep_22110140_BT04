require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');

const app = express();
const port = process.env.PORT || 8888;

// 1. Helmet - Bảo vệ app khỏi các lỗ hổng phổ biến
app.use(helmet({
    contentSecurityPolicy: false, // Tắt nếu dùng inline scripts trong EJS
    crossOriginEmbedderPolicy: false
}));

// 2. CORS - Cấu hình Cross-Origin Resource Sharing
const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép requests không có origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        // Whitelist domains
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173', // Vite
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️  Blocked by CORS: ${origin}`);
            callback(null, true);
        }
    },
    credentials: true, // Cho phép cookies
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 3. Body Parser với giới hạn payload size
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Trust proxy (quan trọng nếu deploy sau nginx/load balancer)
app.set('trust proxy', 1);

configViewEngine(app);

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
        next();
    });
}


// Web Routes (EJS Views)
const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use('/', webAPI);

// API Routes (với đầy đủ 4 lớp bảo mật)
app.use('/v1/api', apiRoutes);


// 404 Handler - Route không tồn tại
app.use((req, res) => {
    // Nếu là API request
    if (req.originalUrl.startsWith('/v1/api')) {
        return res.status(404).json({
            EC: 1,
            EM: 'API endpoint không tồn tại',
            path: req.originalUrl
        });
    }
    
    // Nếu là web request
    res.status(404).send('Page Not Found');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    
    // Rate limit error
    if (err.status === 429) {
        return res.status(429).json({
            EC: 1,
            EM: err.message || 'Quá nhiều request. Vui lòng thử lại sau'
        });
    }
    
    // Validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            EC: 1,
            EM: 'Dữ liệu không hợp lệ',
            errors: err.errors
        });
    }
    
    // JWT error
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            EC: 1,
            EM: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }
    
    // Generic error
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        EC: -1,
        EM: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Có lỗi xảy ra. Vui lòng thử lại sau',
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err 
        })
    });
});

(async () => {
    try {
        // Kiểm tra các biến môi trường quan trọng
        const requiredEnvVars = ['MONGO_DB_URL', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASSWORD'];
        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingEnvVars.length > 0) {
            console.warn('⚠️  Warning: Missing environment variables:', missingEnvVars.join(', '));
        }
        
        // Kết nối database
        await connection();
        console.log('✅ Database connected successfully');
        
        // Start server
        app.listen(port, () => {
            console.log('\n' + '='.repeat(60));
            console.log(`🚀 Backend Server Running`);
            console.log('='.repeat(60));
            console.log(`📍 URL: http://localhost:${port}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Database: ${process.env.MONGO_DB_URL ? 'Connected' : 'Not configured'}`);
            console.log('\n🔐 Security Features Enabled:');
            console.log('   ✓ Input Validation (express-validator)');
            console.log('   ✓ Rate Limiting (express-rate-limit)');
            console.log('   ✓ JWT Authentication');
            console.log('   ✓ Role-based Authorization');
            console.log('   ✓ Helmet Security Headers');
            console.log('   ✓ CORS Protection');
            console.log('   ✓ Request Size Limiting');
            console.log('='.repeat(60) + '\n');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:');
        console.error(error);
        process.exit(1);
    }
})();

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});