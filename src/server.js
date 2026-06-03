const express = require('express');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const mockRoutes = require('./routes/mock');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//Mounting admin routes under '/api' prefix
app.use('/api', adminRoutes);

app.use('/mock', mockRoutes);
// health check route to verify setup is working
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'MockFlow server running'
    });
});

app.listen(PORT, () => {
    console.log(`MockFlow Server is running on port ${PORT}`); //http://localhost:3000/api/mocks

});