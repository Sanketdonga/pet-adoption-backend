import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

let io;
const userSocketMap = {}; // userId -> socketId

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Middleware to verify token from cookie
    io.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || '');
            const token = cookies.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected: ' + socket.id);
        
        // Auto-register user from verified token
        if (socket.userId) {
            userSocketMap[socket.userId] = socket.id;
            console.log(`User ${socket.userId} mapped to socket ${socket.id}`);
        }
        
        socket.on('disconnect', () => {
             console.log('Client disconnected');
             if (socket.userId && userSocketMap[socket.userId] === socket.id) {
                 delete userSocketMap[socket.userId];
             }
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export const emitEvent = (event, data) => {
    if(io) {
        io.emit(event, data);
    }
};

export const emitToUser = (userId, event, data) => {
    const socketId = userSocketMap[userId];
    if (io && socketId) {
        io.to(socketId).emit(event, data);
    }
};
