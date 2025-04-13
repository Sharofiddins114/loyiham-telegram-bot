const { Telegraf } = require('telegraf');
const { saveToSheet } = require('./sheets');
const logger = require('./logger');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

async function handleVideo(ctx) {
  try {
    const video = ctx.message.video_note || ctx.message.video;
    const user = ctx.from;
    const now = new Date();

    await saveToSheet({
      date: now,
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      fileId: video.file_id,
      fileUniqueId: video.file_unique_id,
      fileSize: video.file_size,
      duration: video.duration || 0
    });

    await ctx.reply('✅ Qabul qilindi!');
    if (user.id.toString() !== process.env.ADMIN_ID) {
      await bot.telegram.sendMessage(
        process.env.ADMIN_ID,
        `📌 Yangi video:\n👤 ${user.first_name}\n🆔 ${user.id}\n⏱ ${now.toLocaleString()}`
      );
    }
  } catch (error) {
    logger.error('Video qayta ishlashda xato:', error);
  }
}

module.exports.telegramWebhook = async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhookda xato:', error);
    res.status(500).send('Internal Server Error');
  }
};

bot.on('video_note', handleVideo);
bot.on('video', handleVideo);
bot.launch();