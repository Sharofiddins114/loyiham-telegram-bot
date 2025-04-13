const { GoogleSpreadsheet } = require('google-spreadsheet');
const logger = require('./logger');

let doc;

async function initializeSheets() {
  try {
    doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
    await doc.loadInfo(); // MUHIM
    logger.info('Google Sheets muvaffaqiyatli ulandi');
  } catch (error) {
    logger.error('Sheets ulanishida xato:', error);
    throw error;
  }
}

async function saveToSheet(data) {
  try {
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      'Sana': data.date.toLocaleString(),
      'User ID': data.userId,
      'Ism': data.firstName,
      'Familiya': data.lastName,
      'Username': data.username,
      'File ID': data.fileId,
      'Unique ID': data.fileUniqueId,
      'Hajmi': data.fileSize,
      'Davomiylik': data.duration,
      'Holat': '✅ Qabul qilindi'
    });
    logger.info(`Sheetga yozildi: ${data.fileUniqueId}`);
  } catch (error) {
    logger.error('Sheetga yozishda xato:', error);
  }
}

module.exports = { initializeSheets, saveToSheet };