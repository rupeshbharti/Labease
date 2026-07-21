import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/user.routes.js';
import labRoutes from './routes/lab.routes.js';
import adminRoutes from './routes/admin.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import familyRoutes from './routes/family.routes.js';
import addressRoutes from './routes/address.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import orderRoutes from './routes/order.routes.js';
import phleboRoutes from './routes/phlebo.routes.js';
import revenueRoutes from './routes/revenue.routes.js';
import promoRoutes from './routes/promo.routes.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
});

// Configure Socket.io rooms for location tracking
io.on('connection', (socket) => {
  console.log('⚡ Realtime Client connected:', socket.id);

  // Client joins tracking room for a booking
  socket.on('join-tracking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
    console.log(`📡 Client joined room booking_${bookingId}`);
  });

  // Phlebotomist sends live coordinates update
  socket.on('location-update', ({ bookingId, lat, lng, eta }) => {
    console.log(`📍 Location update for booking_${bookingId}:`, { lat, lng, eta });
    // Broadcast coordinates to all other clients in the booking room (patient/lab)
    socket.to(`booking_${bookingId}`).emit('location-update', { lat, lng, eta });
  });

  socket.on('disconnect', () => {
    console.log('⚡ Realtime Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development and mobile WebView apps
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/users/family', familyRoutes);
app.use('/api/users/addresses', addressRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/labs', catalogRoutes);
app.use('/api/labs', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/phlebo', phleboRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/promo', promoRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
server.listen(port, () => {
  console.log(`🚀 LabEase API Server running on port ${port}`);
});
