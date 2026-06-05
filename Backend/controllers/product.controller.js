const productService = require('../services/product.service');

const sendErrorResponse = (res, error, fallbackMessage) => {
    const response = {
        success: false,
        message: error.isOperational ? error.message : fallbackMessage
    };

    if (!error.isOperational) {
        response.error = error.message;
    }

    return res.status(error.statusCode || 500).json(response);
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts(req.query);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching products');
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await productService.getProduct(req.params.id);

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching product');
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(
            req.body,
            req.user.id,
            req.files
        );

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error creating product');
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(
            req.params.id,
            req.body,
            req.user.id,
            req.files
        );

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error updating product');
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id, req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error deleting product');
    }
};

// @desc    Get user's products
// @route   GET /api/products/my-products
// @access  Private
exports.getMyProducts = async (req, res) => {
    try {
        const products = await productService.getMyProducts(req.user.id);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching your products');
    }
};
