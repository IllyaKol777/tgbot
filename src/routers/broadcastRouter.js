const broadcastController = require('../controllers/broadcastController');

module.exports = (bot) => {
    bot.hears('Розсилка повідомлень', broadcastController.handleBroadcastCommand.bind(broadcastController));
    bot.on('callback_query', async (ctx, next) => {
        const data = ctx.callbackQuery.data;

        if (data === 'broadcast_now' ||
            data === 'cancel_broadcast' ||
            data === 'add_buttons' ||
            data === 'send_broadcast' ||
            data === 'broadcast_later' ||
            data === 'schedule_today' ||
            data === 'schedule_tomorrow' ||
            data === 'schedule_day_after_tomorrow' ||
            data === 'complete_scheduled_broadcast') {

            await broadcastController.handleCallbackQuery(ctx);
        } else {
            return await next();
        }
    });
    bot.on('text', broadcastController.handleTextMessage.bind(broadcastController));
    bot.on('message', async (ctx, next) => {
        ctx.session = ctx.session || {};

        const message = ctx.message;

        console.log("Received message:", JSON.stringify(message, null, 2));

        if (ctx.session.awaitingContent) {
            await broadcastController.handleTextMessage(ctx);
        } else {
            return await next();
        }
    });
};
