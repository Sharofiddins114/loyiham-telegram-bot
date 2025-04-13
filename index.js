require('dotenv').config();
const express = require('express');
const { telegramWebhook } = require('./telegram');
const { initializeSheets } = require('./sheets');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3100;

// Middleware — JSON tanish
app.use(express.json());

// Webhook yo'li
app.post('/webhook', telegramWebhook);

// Sog‘lomlikni tekshirish (Health check)
app.get('/', (req, res) => {
  res.status(200).send('✅ Bot ishga tushgan!');
});

// Serverni ishga tushurish
async function startServer() {
  try {
    await initializeSheets();
    app.listen(PORT, () => {
      logger.info(`🚀 Server ${PORT}-portda ishga tushdi`);
      logger.info(`📡 Webhook manzil: ${process.env.WEBHOOK_URL}/webhook`);
    });
  } catch (error) {
    logger.error('❌ Server ishga tushirishda xato:', error);
    process.exit(1);
  }
}

startServer();