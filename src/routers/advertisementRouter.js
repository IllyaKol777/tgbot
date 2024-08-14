const advertisementController = require('../controllers/advertisementController');

module.exports = (bot) => {
    bot.hears('Рекламні посилання', advertisementController.handleAdvertisementLinks.bind(advertisementController));
    bot.hears('Додати посилання', advertisementController.handleAddLink.bind(advertisementController));
    bot.on('callback_query', async (ctx, next) => {
        ctx.session = ctx.session || {};

        if (ctx.callbackQuery.data.startsWith('get_link_')) {
            await advertisementController.handleGetLink(ctx);
        } else if (ctx.callbackQuery.data.startsWith('delete_link_')) {
            await advertisementController.handleDeleteLink(ctx);
        } else {
            return await next();
        }
    });
    bot.on('text', async (ctx, next) => {
        ctx.session = ctx.session || {};

        if (ctx.session.awaitingLinkTitle) {
            await advertisementController.handleNewLinkTitle(ctx);
        } else {
            return await next();
        }
    });
};
