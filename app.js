require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios')
const whatsappRoutes = require('./routes/whatsappRoute');
const { handleWebhook } = require('./verifyPayment'); // Import the webhook handler
const paymentRoutes=require('./routes/paymentRoutes')

const app = express();
/*app.use(cors({
    origin: 'http://localhost:5173', // Your React App's Origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true
}));*/
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
// Routes
app.use('/api/whatsapp', whatsappRoutes);
app.post('/paystack/webhook', handleWebhook); 
app.post('/api/payment',paymentRoutes)








app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
