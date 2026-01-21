import Application from '../models/Application.js';
import Pet from '../models/Pet.js';
import { emitToUser } from '../utils/socket.js';

// @desc    Apply for adoption
// @route   POST /api/applications
// @access  Private (User)
export const applyForAdoption = async (req, res) => {
    try {
        const { petId, message } = req.body;

        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }

        if (pet.status !== 'Available') {
             return res.status(400).json({ success: false, message: 'Pet is not available for adoption' });
        }

        const alreadyApplied = await Application.findOne({
            user: req.user.id,
            pet: petId
        });

        if (alreadyApplied) {
            return res.status(400).json({ success: false, message: 'You have already applied for this pet' });
        }

        const application = await Application.create({
            user: req.user.id,
            pet: petId,
            message
        });

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private (User)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user.id }).populate('pet');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (Admin)
export const getAllApplications = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Application.countDocuments();

        const applications = await Application.find()
            .populate('pet')
            .populate('user', 'name email')
            .skip(startIndex)
            .limit(limit)
            .sort('-createdAt');

        // Pagination result
        const pagination = {};

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
            count: applications.length,
            pagination: {
                ...pagination,
                pages: Math.ceil(total / limit),
                total
            },
            data: applications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Admin)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        let application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const oldStatus = application.status;

        // Prevent double action if status is same
        if (oldStatus === status) {
             return res.status(400).json({ success: false, message: `Application is already ${status}` });
        }

        // 1. If approving, check if pet is already adopted by SOMEONE ELSE
        if (status === 'Approved') {
            const pet = await Pet.findById(application.pet);
            if (pet.status === 'Adopted') {
                return res.status(400).json({ success: false, message: 'Pet is already adopted' });
            }
            // Mark pet as adopted
            await Pet.findByIdAndUpdate(application.pet, { status: 'Adopted' });
        }

        // 2. If rejecting an ALREADY APPROVED application, revert pet to Available
        if (status === 'Rejected' && oldStatus === 'Approved') {
            await Pet.findByIdAndUpdate(application.pet, { status: 'Available' });
        }

        // Update application
        application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true })
            .populate('pet')
            .populate('user', 'name email');

        // Emit socket event to notify user
        emitToUser(application.user._id.toString(), 'applicationUpdated', {
            applicationId: application._id,
            status: application.status,
            userId: application.user._id,
            petName: application.pet.name
        });

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
