const { Telegraf, session } = require('telegraf');
const { sequelize } = require('./models');
const broadcastService = require('./services/broadcastService');
const config = require('../config.json');
const broadcastRouter = require('./routers/broadcastRouter');
const userRouter = require('./routers/userRouter');
const advertisementRouter = require('./routers/advertisementRouter');
const postRouter = require('./routers/postRouter');
const scheduledBroadcastRouter = require('./routers/scheduledBroadcastRouter');
const adminRouter = require('./routers/adminRouter');
const startRouter = require('./routers/startRouter');

const bot = new Telegraf(config.token);

bot.use(session());

postRouter(bot);
scheduledBroadcastRouter(bot);
adminRouter(bot);
startRouter(bot);
advertisementRouter(bot);
userRouter(bot);
broadcastRouter(bot);


bot.on('text', async (ctx) => {
    ctx.session = ctx.session || {};
    await ctx.reply("Виберіть дію з меню або введіть команду.");
});

(async () => {
    try {
        await sequelize.sync();
        console.log('Database synced successfully.');
        await bot.launch();
        console.log('Bot started.');

        setInterval(async () => {
            await broadcastService.processScheduledBroadcasts();
        }, 60000);
    } catch (error) {
        console.error('Failed to launch the bot:', error);
    }
})();
