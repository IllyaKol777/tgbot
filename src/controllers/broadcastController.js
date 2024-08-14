const broadcastService = require('../services/broadcastService');
const { User } = require('../models');

class BroadcastController {
    async handleBroadcastCommand(ctx) {
        await broadcastService.prepareBroadcast(ctx);
    }


    async handleCallbackQuery(ctx) {
        const data = ctx.callbackQuery.data;
        if (data === 'broadcast_now') {
            await broadcastService.handleBroadcastNow(ctx);
        } else if (data === 'cancel_broadcast') {
            await broadcastService.cancelBroadcast(ctx);
        } else if (data === 'add_buttons') {
            await ctx.reply('Для додавання кнопок пришліть текст у відповідному форматі:\nНазва кнопки 1 - посилання 1\nНазва кнопки 2 - посилання 2\nабо:\nНазва кнопки 1 - посилання 1 / Назва кнопки 2 - посилання 2');
            ctx.session.awaitingButtons = true;
        } else if (data === 'send_broadcast') {
            const users = await User.findAll();
            await broadcastService.sendBroadcast(ctx, users);
        } else if (data === 'broadcast_later') {
            await broadcastService.handleDeferredBroadcast(ctx);
        } else if (data === 'schedule_today') {
            await broadcastService.askForTime(ctx, 'today');
        } else if (data === 'schedule_tomorrow') {
            await broadcastService.askForTime(ctx, 'tomorrow');
        } else if (data === 'schedule_day_after_tomorrow') {
            await broadcastService.askForTime(ctx, 'day_after_tomorrow');
        } else if (data === 'complete_scheduled_broadcast') {
            await broadcastService.completeScheduledBroadcast(ctx);
        }
    }

    async handleTextMessage(ctx) {
        ctx.session = ctx.session || {};

        if (ctx.session.awaitingContent) {
            await broadcastService.receiveContent(ctx);
        } else if (ctx.session.awaitingButtons) {
            await broadcastService.addButtons(ctx, ctx.message.text);
            ctx.session.awaitingButtons = false;
            if (!ctx.session.scheduledTime) {
                await ctx.reply('Розіслати зараз або відмінити розсилку:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Розіслати', callback_data: 'send_broadcast' }, { text: 'Відміна', callback_data: 'cancel_broadcast' }]
                        ]
                    }
                });
            } else {
                await broadcastService.completeScheduledBroadcast(ctx);
            }
        } else if (ctx.session.scheduledDay) {
            await broadcastService.scheduleBroadcast(ctx, ctx.message.text);
            delete ctx.session.scheduledDay;
        }
    }

}

module.exports = new BroadcastController();

