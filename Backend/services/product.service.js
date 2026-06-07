const prisma = require('../lib/prisma');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');
const AppError = require('../utils/AppError');

// ─── Get Products (with filters) ──────────────────────────────────────────────

/**
 * Fetches available products with optional filters.
 * Mongoose ka query builder → Prisma ka where/orderBy object.
 */
const getProducts = async ({
    category,
    condition,
    minPrice,
    maxPrice,
    search,
    sort
}) => {
    // Build Prisma where clause
    const where = { status: 'available' };

    if (category) where.category = category;
    if (condition) where.condition = condition;

    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);   // $gte → gte
        if (maxPrice) where.price.lte = Number(maxPrice);   // $lte → lte
    }

    // Full-text search — Prisma mein PostgreSQL @db.Text fields pe mode: 'insensitive'
    // ya contains use hota hai. Schema mein @db.VarChar(100) hai.
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    // Sort options — Mongoose wala { price: 1 } → Prisma wala { price: 'asc' }
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { price: 'asc' };
    if (sort === 'price-high') orderBy = { price: 'desc' };

    return prisma.product.findMany({
        where,
        orderBy,
        include: {
            seller: {
                select: { id: true, name: true, email: true, college: true }
            }
        }
    });
};

// ─── Get Single Product ───────────────────────────────────────────────────────

const getProduct = async (productId) => {
    // MongoDB uses 24-char hex ObjectId — Prisma uses UUID (36 chars)
    // UUID format validation (basic)
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_PATTERN.test(productId)) {
        throw new AppError('Product not found', 404);
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            seller: {
                select: { id: true, name: true, email: true, phone: true, college: true, isVerified: true }
            }
        }
    });

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    // Increment view count — Mongoose ka product.views += 1 → Prisma increment
    await prisma.product.update({
        where: { id: productId },
        data: { views: { increment: 1 } }
    });

    return product;
};

// ─── Create Product ───────────────────────────────────────────────────────────

const createProduct = async (productData, sellerId, files) => {
    let images = [];

    if (files && files.length > 0) {
        images = await uploadMultipleToCloudinary(files);
    }

    return prisma.product.create({
        data: {
            title: productData.title,
            description: productData.description,
            price: Number(productData.price),
            originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
            category: productData.category,
            condition: productData.condition,
            college: productData.college || null,
            location: productData.location || null,
            images,
            sellerId    // Foreign key — Prisma uses sellerId (not seller: ObjectId)
        }
    });
};

// ─── Update Product ───────────────────────────────────────────────────────────

const updateProduct = async (productId, productData, userId, files) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    // Ownership check — Prisma mein product.seller → product.sellerId
    if (product.sellerId !== userId) {
        throw new AppError('Not authorized to update this product', 403);
    }

    const data = { ...productData };
    let images = [];

    // Keep existing images that the frontend sent back
    if (data.existingImages) {
        const existing = Array.isArray(data.existingImages)
            ? data.existingImages
            : [data.existingImages];
        images = [...existing];
    }

    // Upload new files and append
    if (files && files.length > 0) {
        const newImageUrls = await uploadMultipleToCloudinary(files);
        images = [...images, ...newImageUrls];
    }

    if (images.length > 0 || data.existingImages !== undefined) {
        data.images = images;
    }

    delete data.existingImages;

    // Convert price strings to numbers for Prisma Decimal
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.originalPrice !== undefined) data.originalPrice = data.originalPrice ? Number(data.originalPrice) : null;

    return prisma.product.update({
        where: { id: productId },
        data
    });
};

// ─── Delete Product ───────────────────────────────────────────────────────────

const deleteProduct = async (productId, userId) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (product.sellerId !== userId) {
        throw new AppError('Not authorized to delete this product', 403);
    }

    await prisma.product.delete({ where: { id: productId } });
};

// ─── My Products ──────────────────────────────────────────────────────────────

const getMyProducts = async (userId) => {
    return prisma.product.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: 'desc' }
    });
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts
};
