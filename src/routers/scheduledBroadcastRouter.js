const scheduledBroadcastController = require('../controllers/scheduledBroadcastController');

module.exports = (bot) => {
    bot.hears('Список відлежання', scheduledBroadcastController.handleScheduledList.bind(scheduledBroadcastController));

    bot.on('callback_query', async (ctx, next) => {
        const data = ctx.callbackQuery.data;

        if (data.startsWith('delete_scheduled_')) {
            await scheduledBroadcastController.handleDeleteScheduled(ctx);
        } else if (data.startsWith('change_scheduled_')) {
            await scheduledBroadcastController.handleChangeScheduled(ctx);
        } else {
            return await next(); // Передаємо далі, якщо callback не підходить для scheduledBroadcastController
        }
    });

    bot.on('text', async (ctx, next) => {
        if (ctx.session.awaitingNewTime) {
            await scheduledBroadcastController.handleNewScheduledTime(ctx);
        } else {
            return await next(); // Передаємо далі, якщо текст не підходить для scheduledBroadcastController
        }
    });
};
