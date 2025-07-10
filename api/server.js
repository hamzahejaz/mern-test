import express from 'express';
import cors from 'cors';
require('dotenv').config();

const authRoutes = require('./authRoutes/authRoutes');
const postRoutes = require('./postRoutes/postRoutes');

const  app =express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origins: ['http://localhost:3000', 'frontend url here'],
    credentials: true,
}));
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', postRoutes)

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running',timestamp: new Date().toISOString() });
});
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
}); 
if(process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('API Endpoints:');
    });
}