const Product = require('../models/Product.model');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');
const AppError = require('../utils/AppError');

const PRODUCT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const getProducts = async ({
    category,
    condition,
    minPrice,
    maxPrice,
    search,
    sort
}) => {
    const query = { status: 'available' };

    if (category) query.category = category;
    if (condition) query.condition = condition;

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
        query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };

    return Product.find(query)
        .populate('seller', 'name email college')
        .sort(sortOption);
};

const getProduct = async (productId) => {
    if (!PRODUCT_ID_PATTERN.test(productId)) {
        throw new AppError('Product not found', 404);
    }

    const product = await Product.findById(productId)
        .populate('seller', 'name email phone college');

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    product.views += 1;
    await product.save();

    return product;
};

const createProduct = async (productData, sellerId, files) => {
    const data = {
        ...productData,
        seller: sellerId
    };

    if (files && files.length > 0) {
        data.images = await uploadMultipleToCloudinary(files);
    }

    return Product.create(data);
};

const updateProduct = async (productId, productData, userId, files) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (product.seller.toString() !== userId) {
        throw new AppError('Not authorized to update this product', 403);
    }

    const data = { ...productData };
    let images = [];

    if (data.existingImages) {
        const existing = Array.isArray(data.existingImages)
            ? data.existingImages
            : [data.existingImages];
        images = [...existing];
    }

    if (files && files.length > 0) {
        const newImageUrls = await uploadMultipleToCloudinary(files);
        images = [...images, ...newImageUrls];
    }

    if (images.length > 0 || data.existingImages !== undefined) {
        data.images = images;
    }

    delete data.existingImages;

    return Product.findByIdAndUpdate(productId, data, {
        new: true,
        runValidators: true
    });
};

const deleteProduct = async (productId, userId) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (product.seller.toString() !== userId) {
        throw new AppError('Not authorized to delete this product', 403);
    }

    await product.deleteOne();
};

const getMyProducts = async (userId) => {
    return Product.find({ seller: userId });
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts
};
