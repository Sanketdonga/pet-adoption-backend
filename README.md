# Pet Adoption Backend

This is the backend API for the Pet Adoption Platform, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Register, Login, Logout, Profile Management, Password Reset (using JWT & Cookies).
- **Pet Management**: Admin can Create, Read, Update, and Delete pet listings. Public users can view and filter pets.
- **Adoption Applications**: Users can apply to adopt pets. Admins can view, approve, or reject applications.
- **Image Upload**: Support for uploading pet images (using Cloudinary/Multer).
- **Emails**: Automated emails for password resets using Nodemailer.
- **Data Seeding**: Script to populate the database with dummy data.

## Technologies

- Node.js & Express
- MongoDB & Mongoose
- JSON Web Token (JWT)
- Bcryptjs
- Nodemailer
- Multer

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas URI)

### Installation

1.  Clone the repository and navigating to the backend folder.
2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the root directory with the following variables:

    ```env
    NODE_ENV=development
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=30d
    
    # Email Configuration (for password reset)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_MAIL=your_email@gmail.com
    SMTP_PASSWORD=your_app_password
    FROM_EMAIL=your_email@gmail.com
    FROM_NAME=PetAdopt
    
    # Client URL (for reset links)
    CLIENT_URL=http://localhost:5173
    ```

### Running the Server

- **Development Mode** (with Nodemon):

    ```bash
    npm run dev
    ```

- **Production Mode**:

    ```bash
    npm start
    ```

### Database Seeder

To populate the database with dummy users and pets:

- **Import Data**:
    ```bash
    npm run data:import
    ```

- **Destroy Data**:
    ```bash
    npm run data:destroy
    ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update profile details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

### Pets
- `GET /api/pets` - Get all pets (Public, supports pagination/filtering)
- `GET /api/pets/:id` - Get single pet (Public)
- `POST /api/pets` - Create a pet (Admin only)
- `PUT /api/pets/:id` - Update a pet (Admin only)
- `DELETE /api/pets/:id` - Delete a pet (Admin only)

### Applications
- `POST /api/applications` - Submit adoption application (User)
- `GET /api/applications/my` - Get logged-in user's applications
- `GET /api/applications` - Get all applications (Admin only)
- `PUT /api/applications/:id` - Update application status (Admin only)