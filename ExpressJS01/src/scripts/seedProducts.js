require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

// Dữ liệu sản phẩm mẫu
const sampleProducts = [
    // Electronics
    {
        name: 'iPhone 15 Pro Max',
        description: 'Flagship smartphone với chip A17 Pro, camera 48MP, màn hình OLED 6.7 inch',
        category: 'Electronics',
        price: 29990000,
        discount: 10,
        views: 1250,
        stock: 50,
        rating: 4.8,
        tags: ['smartphone', 'apple', 'iphone', '5g'],
        image: 'https://via.placeholder.com/300/0000FF/FFFFFF?text=iPhone+15'
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone cao cấp với bút S Pen, camera 200MP, màn hình Dynamic AMOLED 6.8 inch',
        category: 'Electronics',
        price: 27990000,
        discount: 15,
        views: 980,
        stock: 40,
        rating: 4.7,
        tags: ['smartphone', 'samsung', 'android', '5g'],
        image: 'https://via.placeholder.com/300/FF0000/FFFFFF?text=Galaxy+S24'
    },
    {
        name: 'MacBook Pro M3 14 inch',
        description: 'Laptop chuyên nghiệp với chip M3, RAM 16GB, SSD 512GB, màn hình Retina',
        category: 'Electronics',
        price: 45990000,
        discount: 5,
        views: 2100,
        stock: 25,
        rating: 4.9,
        tags: ['laptop', 'apple', 'macbook', 'professional'],
        image: 'https://via.placeholder.com/300/00FF00/FFFFFF?text=MacBook+Pro'
    },
    {
        name: 'Dell XPS 15',
        description: 'Laptop Windows cao cấp với Intel Core i7, RAM 32GB, RTX 4060',
        category: 'Electronics',
        price: 38990000,
        discount: 8,
        views: 1540,
        stock: 30,
        rating: 4.6,
        tags: ['laptop', 'dell', 'windows', 'gaming'],
        image: 'https://via.placeholder.com/300/FFFF00/000000?text=Dell+XPS'
    },
    {
        name: 'Sony WH-1000XM5',
        description: 'Tai nghe chống ồn chủ động hàng đầu, pin 30 giờ, âm thanh Hi-Res',
        category: 'Electronics',
        price: 8990000,
        discount: 20,
        views: 3200,
        stock: 100,
        rating: 4.9,
        tags: ['headphone', 'sony', 'wireless', 'noise-cancelling'],
        image: 'https://via.placeholder.com/300/FF00FF/FFFFFF?text=Sony+XM5'
    },

    // Fashion
    {
        name: 'Áo khoác da nam cao cấp',
        description: 'Áo khoác da bò thật 100%, thiết kế hiện đại, phong cách Hàn Quốc',
        category: 'Fashion',
        price: 2990000,
        discount: 25,
        views: 890,
        stock: 45,
        rating: 4.5,
        tags: ['jacket', 'leather', 'men', 'korean-style'],
        image: 'https://via.placeholder.com/300/8B4513/FFFFFF?text=Leather+Jacket'
    },
    {
        name: 'Váy dạ hội sang trọng',
        description: 'Váy dạ hội lụa cao cấp, thiết kế dáng A, thích hợp đi tiệc',
        category: 'Fashion',
        price: 3500000,
        discount: 30,
        views: 1200,
        stock: 20,
        rating: 4.7,
        tags: ['dress', 'evening', 'women', 'luxury'],
        image: 'https://via.placeholder.com/300/FF1493/FFFFFF?text=Evening+Dress'
    },
    {
        name: 'Giày thể thao Nike Air Max',
        description: 'Giày chạy bộ với công nghệ đệm khí Air Max, êm ái thoải mái',
        category: 'Fashion',
        price: 3200000,
        discount: 15,
        views: 2500,
        stock: 80,
        rating: 4.8,
        tags: ['shoes', 'nike', 'sports', 'running'],
        image: 'https://via.placeholder.com/300/000000/FFFFFF?text=Nike+Air+Max'
    },

    // Home & Living
    {
        name: 'Sofa da 3 chỗ ngồi',
        description: 'Sofa da bò Ý cao cấp, khung gỗ sồi, thiết kế hiện đại tối giản',
        category: 'Home',
        price: 15990000,
        discount: 10,
        views: 650,
        stock: 12,
        rating: 4.6,
        tags: ['sofa', 'furniture', 'leather', 'living-room'],
        image: 'https://via.placeholder.com/300/A0522D/FFFFFF?text=Leather+Sofa'
    },
    {
        name: 'Bộ nồi inox 5 đáy từ',
        description: 'Bộ 5 nồi inox 304 cao cấp, đáy 5 lớp, dùng được mọi loại bếp',
        category: 'Home',
        price: 2490000,
        discount: 20,
        views: 1800,
        stock: 60,
        rating: 4.7,
        tags: ['cookware', 'kitchen', 'stainless-steel', 'induction'],
        image: 'https://via.placeholder.com/300/C0C0C0/000000?text=Cookware+Set'
    },

    // Books
    {
        name: 'Đắc Nhân Tâm - Dale Carnegie',
        description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử',
        category: 'Books',
        price: 85000,
        discount: 0,
        views: 5200,
        stock: 200,
        rating: 4.9,
        tags: ['book', 'self-help', 'bestseller', 'communication'],
        image: 'https://via.placeholder.com/300/8B0000/FFFFFF?text=Dac+Nhan+Tam'
    },
    {
        name: 'Clean Code - Robert Martin',
        description: 'Sách lập trình về cách viết code sạch, dễ đọc, dễ bảo trì',
        category: 'Books',
        price: 280000,
        discount: 5,
        views: 3400,
        stock: 150,
        rating: 4.8,
        tags: ['book', 'programming', 'software', 'technical'],
        image: 'https://via.placeholder.com/300/4169E1/FFFFFF?text=Clean+Code'
    },

    // Sports
    {
        name: 'Xe đạp địa hình Giant ATX 27.5',
        description: 'Xe đạp địa hình 21 cấp, khung nhôm, phuộc giảm sóc',
        category: 'Sports',
        price: 7890000,
        discount: 12,
        views: 420,
        stock: 18,
        rating: 4.5,
        tags: ['bicycle', 'mountain-bike', 'giant', 'outdoor'],
        image: 'https://via.placeholder.com/300/228B22/FFFFFF?text=Mountain+Bike'
    },
    {
        name: 'Vợt cầu lông Yonex Astrox 99',
        description: 'Vợt cầu lông chuyên nghiệp, sợi carbon, trọng lượng 88g',
        category: 'Sports',
        price: 4200000,
        discount: 10,
        views: 890,
        stock: 35,
        rating: 4.7,
        tags: ['badminton', 'racket', 'yonex', 'professional'],
        image: 'https://via.placeholder.com/300/FF4500/FFFFFF?text=Badminton+Racket'
    },

    // Beauty
    {
        name: 'Kem chống nắng La Roche-Posay SPF50+',
        description: 'Kem chống nắng phổ rộng, không gây bết dính, phù hợp da nhạy cảm',
        category: 'Beauty',
        price: 420000,
        discount: 15,
        views: 2800,
        stock: 120,
        rating: 4.8,
        tags: ['skincare', 'sunscreen', 'laroche', 'spf50'],
        image: 'https://via.placeholder.com/300/87CEEB/FFFFFF?text=Sunscreen'
    },
    {
        name: 'Son môi MAC Ruby Woo',
        description: 'Son lì lâu trôi, màu đỏ ruby kinh điển, dưỡng ẩm',
        category: 'Beauty',
        price: 680000,
        discount: 0,
        views: 3500,
        stock: 90,
        rating: 4.9,
        tags: ['lipstick', 'mac', 'makeup', 'matte'],
        image: 'https://via.placeholder.com/300/DC143C/FFFFFF?text=MAC+Lipstick'
    }
];

// Hàm seed data
const seedProducts = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('✓ Connected to MongoDB');

        // Xóa dữ liệu cũ
        await Product.deleteMany({});
        console.log('✓ Cleared old products');

        // Thêm dữ liệu mới
        await Product.insertMany(sampleProducts);
        console.log(`✓ Inserted ${sampleProducts.length} sample products`);

        // Hiển thị thống kê
        const categories = await Product.distinct('category');
        console.log('\n📊 Statistics:');
        for (const category of categories) {
            const count = await Product.countDocuments({ category });
            console.log(`   - ${category}: ${count} products`);
        }

        console.log('\n✅ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

// Chạy seed
seedProducts();
