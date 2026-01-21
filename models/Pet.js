import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    breed: {
        type: String,
        required: [true, 'Please add a breed']
    },
    species: {
        type: String,
        required: [true, 'Please add a species (e.g., Dog, Cat)']
    },
    age: {
        type: Number,
        required: [true, 'Please add an age']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Unknown'],
        default: 'Unknown'
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    images: {
        type: [String], // Array of URLs
        default: []
    },
    status: {
        type: String,
        enum: ['Available', 'Pending', 'Adopted'],
        default: 'Available'
    },
    addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Pet', petSchema);
