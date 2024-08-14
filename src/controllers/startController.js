const { User, StartPost, NextPost, AviatorPost, MinesPost, AdminPost } = require('../models');
const path = require('path');

class StartController {
    async handleStartCommand(ctx) {
        // Перевірка чи користувач є в базі
        const telegramId = ctx.from.id.toString();
        const username = ctx.from.username || 'NoUsername';
        let user = await User.findOne({ where: { telegramId } });

        if (!user) {
            // Якщо користувача немає в базі, додаємо його
            user = await User.create({ telegramId, username });
        }

        // Виводимо перше повідомлення з кнопкою "Next ✅"
        const startPost = await StartPost.findOne();
        if (startPost) {
            await ctx.reply(startPost.text, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Next ✅', callback_data: 'next_step' }]
                    ]
                }
            });
        }
    }

    async handleNextStep(ctx) {
        // Виводимо відео з текстом та двома кнопками
        const nextPost = await NextPost.findOne();
        if (nextPost) {
            const videoPath = path.resolve(__dirname, '../../videos', `${nextPost.video_name}.mp4`);
            await ctx.replyWithVideo({ source: videoPath }, {
                caption: nextPost.text,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🚀AVIATOR', callback_data: 'aviator_step' }],
                        [{ text: 'ه💣MINES💣', callback_data: 'mines_step' }]
                    ]
                }
            });
        }
    }

    async handleAviatorStep(ctx) {
        const aviatorPost = await AviatorPost.findOne();
        if (aviatorPost) {
            const videoPath = path.resolve(__dirname, '../../videos', `${aviatorPost.video_name}.mp4`);
            await ctx.replyWithVideo({ source: videoPath }, {
                caption: aviatorPost.text
            });
        }

        const adminPost = await AdminPost.findOne();
        if (adminPost) {
            await ctx.reply(`${adminPost.text}\n${adminPost.link}`);
        }

        await this.showMainMenu(ctx);
    }

    async handleMinesStep(ctx) {
        const minesPost = await MinesPost.findOne();
        if (minesPost) {
            const videoPath = path.resolve(__dirname, '../../videos', `${minesPost.video_name}.mp4`);
            await ctx.replyWithVideo({ source: videoPath }, {
                caption: minesPost.text
            });
        }

        const adminPost = await AdminPost.findOne();
        if (adminPost) {
            await ctx.reply(`${adminPost.text}\n${adminPost.link}`);
        }

        await this.showMainMenu(ctx);
    }

    async showMainMenu(ctx) {
        const user = await User.findOne({ where: { telegramId: ctx.from.id.toString() } });

        const buttons = [
            [{ text: '🚀AVIATOR' }, { text: 'ه💣MINES💣' }, { text: '👇 Subscribe to the channel' }]
        ];

        if (user.isAdmin) {
            buttons.push([{ text: 'Панель адміністратора' }]);
        }

        await ctx.reply('Оберіть опцію:', {
            reply_markup: {
                keyboard: buttons,
                resize_keyboard: true
            }
        });
    }

    async handleAdminPanel(ctx) {
        await ctx.reply('Панель адміністратора:', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Розсилка повідомлень' }],
                    [{ text: 'Статистика' }, { text: 'Рекламні посилання' }],
                    [{ text: 'Список постів' }, { text: 'Список відлежання' }],
                    [{ text: 'Додати адміна' }, { text: 'Список адмінів' }],
                    [{ text: 'Назад' }]
                ],
                resize_keyboard: true
            }
        });
    }

    async handleBackToMainMenu(ctx) {
        await this.showMainMenu(ctx);
    }
}

module.exports = new StartController();
