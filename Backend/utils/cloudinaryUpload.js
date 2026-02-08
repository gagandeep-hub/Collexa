const cloudinary = require('../config/cloudinary.config');

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer memory storage
 * @param {string} folder - The folder name in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadToCloudinary = (fileBuffer, folder = 'collexa-products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file objects from multer
 * @returns {Promise<Array<string>>} - Array of secure URLs
 */
const uploadMultipleToCloudinary = async (files) => {
    const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
    return Promise.all(uploadPromises);
};

module.exports = { uploadToCloudinary, uploadMultipleToCloudinary };
