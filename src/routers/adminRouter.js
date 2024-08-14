const adminController = require('../controllers/adminController');

module.exports = (bot) => {
    bot.hears('Список адмінів', adminController.handleAdminList.bind(adminController));

    bot.hears('Додати адміна', adminController.handleAddAdmin.bind(adminController));

    bot.on('text', async (ctx, next) => {
        ctx.session = ctx.session || {};

        if (ctx.session.awaitingAdminId) {
            await adminController.handleNewAdminId(ctx);
        } else {
            return await next(); // Передаємо далі, якщо текст не підходить для adminController
        }
    });
};
