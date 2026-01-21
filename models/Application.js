import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    pet: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pet',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    message: {
        type: String,
        required: [true, 'Please add a message with your application']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent user from applying to the same pet twice
applicationSchema.index({ user: 1, pet: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
