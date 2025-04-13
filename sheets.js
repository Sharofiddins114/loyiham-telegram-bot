// sheets.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const logger = require('./logger');
require('dotenv').config();

const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

async function initializeSheets() {
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
    await doc.loadInfo();
    logger.info(`Google Sheets muvaffaqiyatli ulandi: "${doc.title}"`);
  } catch (error) {
    logger.error('Sheets ulanishda xatolik:', error);
    throw error;
  }
}

async function isDuplicate(fileUniqueId) {
  try {
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadCells('A1:I1000');

    const rows = await sheet.getRows();
    return rows.some(row => row['File Unique ID'] === fileUniqueId);
  } catch (error) {
    logger.error('Takroriylikni tekshirishda xatolik:', error);
    return false; // Xato bo‘lsa, har ehtimolga qarshi yozishga ruxsat beriladi
  }
}

async function saveToSheet(data) {
  try {
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      'Sana': data.date.toLocaleString(),
      'Username': data.username,
      'User ID': data.userId,
      'File ID': data.fileId,
      'File Unique ID': data.fileUniqueId,
      'File Size': data.fileSize,
      'Duration': data.duration,
      'Status': '✅ Qabul qilindi',
      'Foydalanuvchi': `${data.firstName} ${data.lastName}`.trim()
    });
    logger.info(`Sheetga yozildi: ${data.fileUniqueId}`);
  } catch (error) {
    logger.error('Sheetga yozishda xatolik:', error);
    throw error;
  }
}

module.exports = {
  initializeSheets,
  saveToSheet,
  isDuplicate
};
