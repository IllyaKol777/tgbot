const { AdvertisementLink } = require('../models');
const { v4: uuidv4 } = require('uuid');

class AdvertisementController {
    async handleAdvertisementLinks(ctx) {
        try {
            const links = await AdvertisementLink.findAll();

            if (links.length === 0) {
                await ctx.reply('Немає жодних рекламних посилань.');
            } else {
                for (const link of links) {
                    await ctx.reply(link.title, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Отримати посилання', callback_data: `get_link_${link.id}` }],
                                [{ text: 'Видалити посилання', callback_data: `delete_link_${link.id}` }]
                            ]
                        }
                    });
                }
            }

            await ctx.reply('Меню:', {
                reply_markup: {
                    keyboard: [
                        [{ text: 'Додати посилання' }],
                        [{ text: 'Назад' }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });

        } catch (error) {
            console.error('Error in handleAdvertisementLinks:', error);
            await ctx.reply('Сталася помилка при отриманні рекламних посилань.');
        }
    }

    async handleAddLink(ctx) {
        try {
            ctx.session = ctx.session || {};
            ctx.session.awaitingLinkTitle = true;
            await ctx.reply('Введіть назву для нового рекламного посилання:');
        } catch (error) {
            console.error('Error in handleAddLink:', error);
            await ctx.reply('Сталася помилка при підготовці до додавання нового посилання.');
        }
    }

    async handleNewLinkTitle(ctx) {
        try {
            const title = ctx.message.text;
            const uniqueId = uuidv4();
            const link = `https://t.me/HelpTeachChatGPTBot?start=${uniqueId}`;

            await AdvertisementLink.create({ title, link });

            ctx.session.awaitingLinkTitle = false;

            await ctx.reply('Посилання успішно додано.');
            await this.handleAdvertisementLinks(ctx);
        } catch (error) {
            console.error('Error in handleNewLinkTitle:', error);
            await ctx.reply('Сталася помилка при додаванні нового посилання.');
        }
    }

    async handleGetLink(ctx) {
        try {
            const linkId = ctx.callbackQuery.data.split('_')[2];
            const link = await AdvertisementLink.findByPk(linkId);

            if (link) {
                await ctx.reply(`Ваше посилання: ${link.link}`);
            } else {
                await ctx.reply('Посилання не знайдено.');
            }
        } catch (error) {
            console.error('Error in handleGetLink:', error);
            await ctx.reply('Сталася помилка при отриманні посилання.');
        }
    }

    async handleDeleteLink(ctx) {
        try {
            const linkId = ctx.callbackQuery.data.split('_')[2];
            await AdvertisementLink.destroy({ where: { id: linkId } });

            await ctx.reply('Посилання успішно видалено.');
            await this.handleAdvertisementLinks(ctx);
        } catch (error) {
            console.error('Error in handleDeleteLink:', error);
            await ctx.reply('Сталася помилка при видаленні посилання.');
        }
    }
}

module.exports = new AdvertisementController();
