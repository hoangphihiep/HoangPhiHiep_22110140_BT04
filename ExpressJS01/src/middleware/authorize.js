// Middleware kiểm tra role
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Kiểm tra xem user đã được authenticate chưa
        if (!req.user) {
            return res.status(401).json({
                EC: 1,
                EM: "Bạn chưa đăng nhập"
            });
        }

        const userRole = req.user.role;

        // Kiểm tra role của user có trong danh sách allowed không
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                EC: 1,
                EM: `Bạn không có quyền truy cập. Yêu cầu: ${allowedRoles.join(' hoặc ')}`
            });
        }

        console.log(`✅ User ${req.user.email} authorized as ${userRole}`);
        next();
    };
};

// Middleware chỉ cho phép Admin
const isAdmin = authorize('Admin');

// Middleware cho phép User và Admin
const isUser = authorize('User', 'Admin');

// Middleware kiểm tra user chỉ truy cập data của chính mình
const isSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            EC: 1,
            EM: "Bạn chưa đăng nhập"
        });
    }

    const requestedUserId = req.params.userId || req.params.id;
    const currentUserId = req.user.userId || req.user.id;
    const userRole = req.user.role;

    // Admin có thể truy cập mọi user
    if (userRole === 'Admin') {
        return next();
    }

    // User chỉ truy cập được data của chính mình
    if (requestedUserId && requestedUserId !== currentUserId) {
        return res.status(403).json({
            EC: 1,
            EM: "Bạn chỉ có thể truy cập thông tin của chính mình"
        });
    }

    next();
};

// Middleware kiểm tra ownership (chủ sở hữu resource)
const isOwnerOrAdmin = (getOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                EC: 1,
                EM: "Bạn chưa đăng nhập"
            });
        }

        const userRole = req.user.role;
        const currentUserId = req.user.userId || req.user.id;

        // Admin có full access
        if (userRole === 'Admin') {
            return next();
        }

        try {
            // Lấy ownerId của resource (callback function)
            const ownerId = await getOwnerId(req);

            if (ownerId !== currentUserId) {
                return res.status(403).json({
                    EC: 1,
                    EM: "Bạn không có quyền thao tác với resource này"
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                EC: -1,
                EM: "Lỗi khi kiểm tra quyền sở hữu"
            });
        }
    };
};

module.exports = {
    authorize,
    isAdmin,
    isUser,
    isSelfOrAdmin,
    isOwnerOrAdmin
};