import Pet from '../models/Pet.js';

// @desc    Get all pets
// @route   GET /api/pets
// @access  Public
export const getPets = async (req, res) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        let databaseQuery = Pet.find(JSON.parse(queryStr));

        // Search by name
        if (req.query.search) {
             const searchRegex = new RegExp(req.query.search, 'i');
             databaseQuery = databaseQuery.find({ name: searchRegex });
        }

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            databaseQuery = databaseQuery.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            databaseQuery = databaseQuery.sort(sortBy);
        } else {
            databaseQuery = databaseQuery.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Pet.countDocuments(JSON.parse(queryStr));

        databaseQuery = databaseQuery.skip(startIndex).limit(limit);

        // Executing query
        const pets = await databaseQuery;

        // Pagination result
        const pagination = {};
        const totalPages = Math.ceil(total / limit);
        pagination.pages = totalPages;

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: pets.length,
            pagination,
            data: pets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Public
export const getPet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }

        res.status(200).json({ success: true, data: pet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private (Admin)
export const createPet = async (req, res) => {
    try {
        // Add user to req.body
        req.body.addedBy = req.user.id;

        // Check if files were uploaded
        if (req.files) {
             req.body.images = req.files.map(file => file.path);
        }

        const pet = await Pet.create(req.body);

        res.status(201).json({
            success: true,
            data: pet
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private (Admin)
export const updatePet = async (req, res) => {
    try {
        let pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }

        // Handle images
        let imagesToKeep = pet.images; // Default to keeping all current images

        // If existingImages is sent, it means we only want to keep these
        if (req.body.existingImages !== undefined) {
            if (Array.isArray(req.body.existingImages)) {
                imagesToKeep = req.body.existingImages;
            } else if (req.body.existingImages === "") {
                 imagesToKeep = [];
            } else {
                imagesToKeep = [req.body.existingImages];
            }
        }

        // Add new uploaded images
        let newImages = [];
        if (req.files && req.files.length > 0) {
             newImages = req.files.map(file => file.path);
        }

        req.body.images = [...imagesToKeep, ...newImages];

        pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: pet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private (Admin)
export const deletePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }

        await pet.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
