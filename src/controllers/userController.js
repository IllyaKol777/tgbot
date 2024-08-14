const { User } = require('../models');

class UserController {
    async getStatistics(ctx) {
        try {
            const userCount = await User.count();
            await ctx.reply(`Статистика:\nКількість юзерів: ${userCount}`);
        } catch (error) {
            console.error('Error in getStatistics:', error);
            await ctx.reply('Сталася помилка при отриманні статистики.');
        }
    }
}

module.exports = new UserController();
