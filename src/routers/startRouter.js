const startController = require('../controllers/startController');
const { SubscribePost } = require('../models');

module.exports = (bot) => {
    bot.start(startController.handleStartCommand.bind(startController));

    bot.on('callback_query', async (ctx, next) => {
        const data = ctx.callbackQuery.data;

        if (data === 'next_step') {
            await startController.handleNextStep(ctx);
        } else if (data === 'aviator_step') {
            await startController.handleAviatorStep(ctx);
        } else if (data === 'mines_step') {
            await startController.handleMinesStep(ctx);
        } else {
            return await next(); // Передаємо далі, якщо callback не підходить
        }
    });

    bot.hears('Панель адміністратора', startController.handleAdminPanel.bind(startController));
    bot.hears('Назад', startController.handleBackToMainMenu.bind(startController));

    bot.hears('🚀AVIATOR', startController.handleAviatorStep.bind(startController));
    bot.hears('ه💣MINES💣', startController.handleMinesStep.bind(startController));
    bot.hears('👇 Subscribe to the channel', async (ctx) => {
        const subscribePost = await SubscribePost.findOne();
        if (subscribePost) {
            await ctx.reply(`${subscribePost.text}\n${subscribePost.link}`);
        }
    });
};
