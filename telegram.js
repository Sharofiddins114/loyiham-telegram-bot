const { Telegraf } = require('telegraf');
const { saveToSheet, isDuplicate } = require('./sheets');
const logger = require('./logger');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Middleware: Admin cheklovi (hozircha faollashtirilmagan)
// bot.use(async (ctx, next) => {
//   if (ctx.from && ctx.from.id.toString() !== process.env.ADMIN_ID) {
//     logger.warn(`Ruxsatsiz kirish urinishi: ${ctx.from.id}`);
//     return ctx.reply('⚠️ Sizga ruxsat yo'q!');
//   }
//   return next();
// });

async function handleVideo(ctx) {
  try {
    const video = ctx.message.video_note || ctx.message.video;
    if (!video) {
      return ctx.reply('❗️ Video topilmadi. Iltimos, qayta yuboring.');
    }

    const user = ctx.from;
    const now = new Date();

    // Takroriylikni tekshirish
    const duplicate = await isDuplicate(video.file_unique_id);
    if (duplicate) {
      logger.info(`Takror video: ${video.file_unique_id}`);
      await ctx.reply('⚠️ Bu video allaqachon yuborilgan.');
      return;
    }

    // Google Sheetsga yozish
    await saveToSheet({
      date: now,
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || 'Noma'lum',
      fileId: video.file_id,
      fileUniqueId: video.file_unique_id,
      fileSize: video.file_size || 0,
      duration: video.duration || 0
    });

    await ctx.reply('✅ Video qabul qilindi. Rahmat!');

    // Admin uchun bildirishnoma
    if (user.id.toString() !== process.env.ADMIN_ID) {
      const adminMsg = `📌 Yangi video:
👤 ${user.first_name}
🆔 ${user.id}
⏱ ${now.toLocaleString()}`;
      await bot.telegram.sendMessage(process.env.ADMIN_ID, adminMsg);
    }
  } catch (error) {
    logger.error('Video qayta ishlashda xato:', error);
    await ctx.reply('❗️ Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.');
  }
}

// Bot video handlerlari
bot.on('video_note', handleVideo);
bot.on('video', handleVideo);

// Webhook orqali yangilanishni qabul qilish
module.exports.telegramWebhook = async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhookda xatolik:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
