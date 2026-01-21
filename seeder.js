import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/User.js';
import Pet from './models/Pet.js';
import { connectDB } from './config/db.js';

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const importData = async () => {
    try {
        // Find an admin user to assign pets to
        const adminUser = await User.findOne({ role: 'admin' });

        if (!adminUser) {
            console.error('Error: No admin user found to assign pets to.'.red.inverse);
            process.exit(1);
        }

        const speciesList = ['Dog', 'Cat', 'Bird', 'Other'];
        const breeds = {
            'Dog': ['Labrador', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'German Shepherd'],
            'Cat': ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Bengal', 'Sphynx'],
            'Bird': ['Parrot', 'Canary', 'Finch', 'Cockatiel'],
            'Other': ['Hamster', 'Rabbit', 'Turtle']
        };
        const names = ['Bella', 'Max', 'Charlie', 'Luna', 'Lucy', 'Cooper', 'Bailey', 'Daisy', 'Rocky', 'Buddy', 'Milo', 'Sadie', 'Oliver', 'Lola', 'Teddy'];
        const descriptions = [
            'Friendly and energetic, loves to play fetch.',
            'Calm and cuddly, perfect for apartment living.',
            'A bit shy at first but very loving once she gets to know you.',
            'Loves treats and belly rubs.',
            'Great with kids and other pets.',
            'Needs a lot of exercise and outdoor time.',
            'Very intelligent and easy to train.',
            'Senior pet looking for a quiet retirement home.'
        ];

        const pets = [];

        for (let i = 0; i < 40; i++) {
            const species = speciesList[Math.floor(Math.random() * speciesList.length)];
            const breedList = breeds[species];
            const breed = breedList[Math.floor(Math.random() * breedList.length)];
            const name = names[Math.floor(Math.random() * names.length)] + ' ' + (i + 1);
            const age = Math.floor(Math.random() * 10) + 1; // 1 to 10
            const description = descriptions[Math.floor(Math.random() * descriptions.length)];
            const gender = Math.random() > 0.5 ? 'Male' : 'Female';
            
            // Random image based on species (placeholder)
            let image = '';
            if (species === 'Dog') image = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
            if (species === 'Cat') image = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
            if (species === 'Bird') image = 'https://images.unsplash.com/photo-1552728089-57bdde30beb8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
            if (species === 'Other') image = 'https://images.unsplash.com/photo-1585110396065-8b30855a73a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';

            pets.push({
                name,
                species,
                breed,
                age,
                gender,
                description,
                images: [image], // Use the placeholder image
                addedBy: adminUser._id,
                status: 'Available'
            });
        }

        await Pet.insertMany(pets);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Pet.deleteMany();
        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
