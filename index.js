require('dotenv').config();
const express = require('express');
const { telegramWebhook } = require('./telegram');
const { initializeSheets } = require('./sheets');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.post('/webhook', telegramWebhook);

async function startServer() {
  await initializeSheets();
  app.listen(PORT, () => {
    logger.info(`Server ${PORT}-portda ishga tushdi`);
    logger.info(`Webhook manzil: ${process.env.WEBHOOK_URL}/webhook`);
  });
}

startServer();