const { User } = require('../models');

class AdminController {
    async handleAdminList(ctx) {
        try {
            const admins = await User.findAll({ where: { isAdmin: true } });
            if (admins.length === 0) {
                await ctx.reply('Немає жодного адміністратора.');
                return;
            }

            let message = 'Список адмінів:\n';
            admins.forEach(admin => {
                message += `${admin.username} (${admin.telegramId})\n`;
            });

            await ctx.reply(message);
        } catch (error) {
            console.error('Error in handleAdminList:', error);
            await ctx.reply('Сталася помилка при отриманні списку адмінів.');
        }
    }

    async handleAddAdmin(ctx) {
        try {
            ctx.session = ctx.session || {};
            ctx.session.awaitingAdminId = true;
            await ctx.reply('Введіть chat ID юзера, якого потрібно зробити адміністратором:');
        } catch (error) {
            console.error('Error in handleAddAdmin:', error);
            await ctx.reply('Сталася помилка при додаванні адміна.');
        }
    }

    async handleNewAdminId(ctx) {
        const chatId = ctx.message.text;
        try {
            const user = await User.findOne({ where: { telegramId: chatId } });
            if (user) {
                await User.update({ isAdmin: true }, { where: { telegramId: chatId } });
                await ctx.reply(`Юзера ${user.username} (${user.telegramId}) призначено адміністратором.`);
            } else {
                await ctx.reply('Юзера з таким chat ID немає в базі.');
            }

            ctx.session.awaitingAdminId = false;
        } catch (error) {
            console.error('Error in handleNewAdminId:', error);
            await ctx.reply('Сталася помилка при призначенні юзера адміністратором.');
        }
    }
}

module.exports = new AdminController();
