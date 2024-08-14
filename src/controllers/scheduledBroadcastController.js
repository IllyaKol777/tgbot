const { ScheduledBroadcast } = require('../models');
const moment = require('moment');

class ScheduledBroadcastController {
    async handleScheduledList(ctx) {
        try {
            const broadcasts = await ScheduledBroadcast.findAll({
                where: { status: 'pending' },
                order: [['scheduledTime', 'ASC']]
            });

            if (broadcasts.length === 0) {
                await ctx.reply('Немає запланованих розсилок.');
                return;
            }

            for (const broadcast of broadcasts) {
                const time = moment(broadcast.scheduledTime).format('DD.MM.YYYY HH:mm');
                let message = `📅 Заплановано на: ${time}\n\n`;

                if (broadcast.broadcastContent.type === 'text') {
                    message += broadcast.broadcastContent.text;
                } else if (broadcast.broadcastContent.type === 'photo') {
                    message += broadcast.broadcastContent.caption;
                } else if (broadcast.broadcastContent.type === 'video') {
                    message += broadcast.broadcastContent.caption;
                } else if (broadcast.broadcastContent.type === 'document') {
                    message += broadcast.broadcastContent.caption;
                }

                // Додаємо кнопки до повідомлення
                if (broadcast.buttons && broadcast.buttons.length > 0) {
                    message += '\n\nКнопки:\n';
                    broadcast.buttons.forEach(row => {
                        row.forEach(button => {
                            message += `${button.text}: ${button.url}\n`;
                        });
                    });
                }

                if (broadcast.broadcastContent.type === 'photo') {
                    await ctx.replyWithPhoto(broadcast.broadcastContent.file_id, {
                        caption: message,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Змінити час', callback_data: `change_scheduled_${broadcast.id}` }],
                                [{ text: 'Видалити', callback_data: `delete_scheduled_${broadcast.id}` }]
                            ]
                        }
                    });
                } else if (broadcast.broadcastContent.type === 'video') {
                    await ctx.replyWithVideo(broadcast.broadcastContent.file_id, {
                        caption: message,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Змінити час', callback_data: `change_scheduled_${broadcast.id}` }],
                                [{ text: 'Видалити', callback_data: `delete_scheduled_${broadcast.id}` }]
                            ]
                        }
                    });
                } else if (broadcast.broadcastContent.type === 'document') {
                    await ctx.replyWithDocument(broadcast.broadcastContent.file_id, {
                        caption: message,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Змінити час', callback_data: `change_scheduled_${broadcast.id}` }],
                                [{ text: 'Видалити', callback_data: `delete_scheduled_${broadcast.id}` }]
                            ]
                        }
                    });
                } else {
                    await ctx.reply(message, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Змінити час', callback_data: `change_scheduled_${broadcast.id}` }],
                                [{ text: 'Видалити', callback_data: `delete_scheduled_${broadcast.id}` }]
                            ]
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error in handleScheduledList:', error);
            await ctx.reply('Сталася помилка при отриманні списку запланованих розсилок.');
        }
    }

    async handleDeleteScheduled(ctx) {
        try {
            const id = ctx.callbackQuery.data.split('_')[2];
            await ScheduledBroadcast.destroy({ where: { id } });
            await ctx.reply('Розсилку видалено.');
            await this.handleScheduledList(ctx); // Оновити список після видалення
        } catch (error) {
            console.error('Error in handleDeleteScheduled:', error);
            await ctx.reply('Сталася помилка при видаленні розсилки.');
        }
    }

    async handleChangeScheduled(ctx) {
        try {
            const id = ctx.callbackQuery.data.split('_')[2];
            ctx.session = ctx.session || {};
            ctx.session.scheduledId = id;
            ctx.session.awaitingNewTime = true;
            await ctx.reply('Введіть новий час у форматі ГГ:ХХ (24-годинний формат). Наприклад, 14:30.');
        } catch (error) {
            console.error('Error in handleChangeScheduled:', error);
            await ctx.reply('Сталася помилка при зміні часу розсилки.');
        }
    }

    async handleNewScheduledTime(ctx) {
        const newTimeString = ctx.message.text;
        const scheduledId = ctx.session.scheduledId;

        try {
            const [hours, minutes] = newTimeString.split(':').map(Number);
            const scheduledTime = moment().startOf('day').add(hours, 'hours').add(minutes, 'minutes').toDate();

            await ScheduledBroadcast.update({ scheduledTime }, { where: { id: scheduledId } });

            ctx.session.awaitingNewTime = false;
            ctx.session.scheduledId = null;

            await ctx.reply('Час розсилки оновлено.');
            await this.handleScheduledList(ctx); // Оновити список після зміни часу
        } catch (error) {
            console.error('Error in handleNewScheduledTime:', error);
            await ctx.reply('Сталася помилка при оновленні часу розсилки.');
        }
    }
}

module.exports = new ScheduledBroadcastController();



// const { ScheduledBroadcast } = require('../models');
// const moment = require('moment');
//
// class ScheduledBroadcastController {
//     async handleScheduledList(ctx) {
//         try {
//             const broadcasts = await ScheduledBroadcast.findAll({
//                 where: { status: 'pending' },
//                 order: [['scheduledTime', 'ASC']]
//             });
//
//             if (broadcasts.length === 0) {
//                 await ctx.reply('Немає запланованих розсилок.');
//                 return;
//             }
//
//             for (const broadcast of broadcasts) {
//                 const time = moment(broadcast.scheduledTime).format('DD.MM.YYYY HH:mm');
//                 let message = `📅 Заплановано на: ${time}\n\n`;
//
//                 if (broadcast.broadcastContent.type === 'text') {
//                     message += broadcast.broadcastContent.text;
//                 } else if (broadcast.broadcastContent.type === 'photo') {
//                     message += broadcast.broadcastContent.caption;
//                 } else if (broadcast.broadcastContent.type === 'video') {
//                     message += broadcast.broadcastContent.caption;
//                 } else if (broadcast.broadcastContent.type === 'document') {
//                     message += broadcast.broadcastContent.caption;
//                 }
//
//                 const buttons = broadcast.buttons || [];
//
//                 if (broadcast.broadcastContent.type === 'photo') {
//                     await ctx.replyWithPhoto(broadcast.broadcastContent.file_id, {
//                         caption: message,
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'Змінити час', callback_data: `change_scheduled_${broadcast.id}` }],
//                                 [{ text: 'Видалити', callback_data: `delete_scheduled_${broadcast.id}` }]
//                             ]
//                         }
//                     });
//                 } else if (broadcast.broadcastContent.type === 'video') {
//                     await ctx.replyWithVideo(broadcast.broadcastContent.file_id, {
//                         caption: message,
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'Змінити час', callback_data: `change_scheduled_${broadcast.id}` }],
//                                 [{ text: 'Видалити', callback_data: `delete_scheduled_${broadcast.id}` }]
//                             ]
//                         }
//                     });
//                 } else if (broadcast.broadcastContent.type === 'document') {
//                     await ctx.replyWithDocument(broadcast.broadcastContent.file_id, {
//                         caption: message,
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'Змінити час', callback_data: `change_scheduled_${broadcast.id}` }],
//                                 [{ text: 'Видалити', callback_data: `delete_scheduled_${broadcast.id}` }]
//                             ]
//                         }
//                     });
//                 } else {
//                     await ctx.reply(message, {
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'Змінити час', callback_data: `change_scheduled_${broadcast.id}` }],
//                                 [{ text: 'Видалити', callback_data: `delete_scheduled_${broadcast.id}` }]
//                             ]
//                         }
//                     });
//                 }
//             }
//         } catch (error) {
//             console.error('Error in handleScheduledList:', error);
//             await ctx.reply('Сталася помилка при отриманні списку запланованих розсилок.');
//         }
//     }
//
//     async handleDeleteScheduled(ctx) {
//         try {
//             const id = ctx.callbackQuery.data.split('_')[2];
//             await ScheduledBroadcast.destroy({ where: { id } });
//             await ctx.reply('Розсилку видалено.');
//             await this.handleScheduledList(ctx); // Оновити список після видалення
//         } catch (error) {
//             console.error('Error in handleDeleteScheduled:', error);
//             await ctx.reply('Сталася помилка при видаленні розсилки.');
//         }
//     }
//
//     async handleChangeScheduled(ctx) {
//         try {
//             const id = ctx.callbackQuery.data.split('_')[2];
//             ctx.session = ctx.session || {};
//             ctx.session.scheduledId = id;
//             ctx.session.awaitingNewTime = true;
//             await ctx.reply('Введіть новий час у форматі ГГ:ХХ (24-годинний формат). Наприклад, 14:30.');
//         } catch (error) {
//             console.error('Error in handleChangeScheduled:', error);
//             await ctx.reply('Сталася помилка при зміні часу розсилки.');
//         }
//     }
//
//     async handleNewScheduledTime(ctx) {
//         const newTimeString = ctx.message.text;
//         const scheduledId = ctx.session.scheduledId;
//
//         try {
//             const [hours, minutes] = newTimeString.split(':').map(Number);
//             const scheduledTime = moment().startOf('day').add(hours, 'hours').add(minutes, 'minutes').toDate();
//
//             await ScheduledBroadcast.update({ scheduledTime }, { where: { id: scheduledId } });
//
//             ctx.session.awaitingNewTime = false;
//             ctx.session.scheduledId = null;
//
//             await ctx.reply('Час розсилки оновлено.');
//             await this.handleScheduledList(ctx); // Оновити список після зміни часу
//         } catch (error) {
//             console.error('Error in handleNewScheduledTime:', error);
//             await ctx.reply('Сталася помилка при оновленні часу розсилки.');
//         }
//     }
// }
//
// module.exports = new ScheduledBroadcastController();
