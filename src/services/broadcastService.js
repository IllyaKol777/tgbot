const { ScheduledBroadcast } = require('../models');
const moment = require('moment-timezone');
const schedule = require('node-schedule');
const { Op } = require('sequelize');


class BroadcastService {

    constructor(telegram) {
        this.telegram = telegram;
    }

    async addButtons(ctx, text) {
        try {
            console.log("Отриманий текст для кнопок:", text);

            const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
            console.log("Розбито на рядки:", rows);

            const buttons = rows.map(row => {
                console.log("Обробка рядка:", row);
                const buttonPairs = row.split(' / ').map(pair => pair.trim());
                console.log("Розбито на пари кнопок:", buttonPairs);

                return buttonPairs.map(buttonText => {
                    const splitIndex = buttonText.lastIndexOf(' - ');
                    if (splitIndex === -1) throw new Error('Неправильний формат кнопки');
                    const name = buttonText.slice(0, splitIndex).trim();
                    const url = buttonText.slice(splitIndex + 3).trim();
                    console.log("Назва:", name, "URL:", url);

                    if (!name || !url) throw new Error('Неправильний формат кнопки');
                    return { text: name, url: url };
                });
            });

            ctx.session.broadcastButtons = buttons;
            await ctx.reply('Кнопки додано.');

            const content = ctx.session.broadcastContent;
            console.log("Контент після додавання кнопок:", content);

            if (content.type === 'photo') {
                await ctx.replyWithPhoto(content.file_id, { caption: content.caption, reply_markup: { inline_keyboard: buttons } });
            } else if (content.type === 'video') {
                await ctx.replyWithVideo(content.file_id, { caption: content.caption, reply_markup: { inline_keyboard: buttons } });
            } else if (content.type === 'document') {
                await ctx.replyWithDocument(content.file_id, { caption: content.caption, reply_markup: { inline_keyboard: buttons } });
            } else if (content.type === 'text') {
                await ctx.reply(content.text, { reply_markup: { inline_keyboard: buttons } });
            } else {
                throw new Error("Невідомий тип контенту або контент не визначено.");
            }
        } catch (error) {
            console.error('Error in addButtons:', error);
            await ctx.reply('Сталася помилка при додаванні кнопок. Перевірте формат введення.');
        }
    }


    async prepareBroadcast(ctx) {
        ctx.session = ctx.session || {};
        try {
            await ctx.reply('Виберіть тип розсилки:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'На зараз', callback_data: 'broadcast_now' }, { text: 'Відложена', callback_data: 'broadcast_later' }],
                        [{ text: 'Відміна', callback_data: 'cancel_broadcast' }]
                    ]
                }
            });
        } catch (error) {
            console.error('Error in prepareBroadcast:', error);
            await ctx.reply('Сталася помилка при підготовці до розсилки.');
        }
    }

    async handleBroadcastNow(ctx) {
        ctx.session = ctx.session || {};
        try {
            ctx.session.awaitingContent = true;
            await ctx.reply('Вибрана розсилка на зараз!\nПришліть текст або файл для розсилки!');
        } catch (error) {
            console.error('Error in handleBroadcastNow:', error);
            await ctx.reply('Сталася помилка при підготовці розсилки.');
        }
    }

    async cancelBroadcast(ctx) {
        ctx.session = ctx.session || {};
        try {
            ctx.session.awaitingContent = false;
            ctx.session.awaitingButtons = false;
            await ctx.reply('Розсилку відмінено.');
        } catch (error) {
            console.error('Error in cancelBroadcast:', error);
            await ctx.reply('Сталася помилка при відміні розсилки.');
        }
    }

    async receiveContent(ctx) {
        try {
            const message = ctx.message;
            ctx.session = ctx.session || {};
            ctx.session.broadcastContent = {};

            if (message.photo) {
                ctx.session.broadcastContent = {
                    type: 'photo',
                    file_id: message.photo[message.photo.length - 1].file_id,
                    caption: message.caption || ''
                };
                await ctx.replyWithPhoto(ctx.session.broadcastContent.file_id, { caption: ctx.session.broadcastContent.caption });
            } else if (message.video) {
                ctx.session.broadcastContent = {
                    type: 'video',
                    file_id: message.video.file_id,
                    caption: message.caption || ''
                };
                await ctx.replyWithVideo(ctx.session.broadcastContent.file_id, { caption: ctx.session.broadcastContent.caption });
            } else if (message.document) {
                ctx.session.broadcastContent = {
                    type: 'document',
                    file_id: message.document.file_id,
                    caption: message.caption || ''
                };
                await ctx.replyWithDocument(ctx.session.broadcastContent.file_id, { caption: ctx.session.broadcastContent.caption });
            } else if (message.text) {
                ctx.session.broadcastContent = {
                    type: 'text',
                    text: message.text
                };
                await ctx.reply(ctx.session.broadcastContent.text);
            } else {
                await ctx.reply('Надісланий формат не підтримується.');
                return;
            }

            console.log("Контент збережений у сесії:", ctx.session.broadcastContent);

            ctx.session.awaitingContent = false;


            if (ctx.session.scheduledTime) {
                await ctx.reply('Додайте кнопки або завершіть планування:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Додати кнопки', callback_data: 'add_buttons' }],
                            [{ text: 'Завершити планування', callback_data: 'complete_scheduled_broadcast' }, { text: 'Відміна', callback_data: 'cancel_broadcast' }]
                        ]
                    }
                });
            } else {
                await ctx.reply('Додайте кнопки або розішліть зараз:', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Додати кнопки', callback_data: 'add_buttons' }],
                            [{ text: 'Розіслати', callback_data: 'send_broadcast' }, { text: 'Відміна', callback_data: 'cancel_broadcast' }]
                        ]
                    }
                });
            }
        } catch (error) {
            console.error('Error in receiveContent:', error);
            await ctx.reply('Сталася помилка при обробці вашого контенту.');
        }
    }


    async sendBroadcast(ctx, users) {
        try {
            const content = ctx.session.broadcastContent;
            const buttons = ctx.session.broadcastButtons || [];
            let success = 0;
            let failed = 0;

            for (const user of users) {
                try {
                    if (content.type === 'photo') {
                        await ctx.telegram.sendPhoto(user.telegramId, content.file_id, {
                            caption: content.caption,
                            reply_markup: {
                                inline_keyboard: buttons
                            }
                        });
                    } else if (content.type === 'video') {
                        await ctx.telegram.sendVideo(user.telegramId, content.file_id, {
                            caption: content.caption,
                            reply_markup: {
                                inline_keyboard: buttons
                            }
                        });
                    } else if (content.type === 'document') {
                        await ctx.telegram.sendDocument(user.telegramId, content.file_id, {
                            caption: content.caption,
                            reply_markup: {
                                inline_keyboard: buttons
                            }
                        });
                    } else if (content.type === 'text') {
                        await ctx.telegram.sendMessage(user.telegramId, content.text, {
                            reply_markup: {
                                inline_keyboard: buttons
                            }
                        });
                    }

                    success++;
                } catch (error) {
                    console.error(`Failed to send message to ${user.telegramId}:`, error);
                    failed++;
                }
            }

            await ctx.reply(`Розсилка завершена. Вдалося надіслати: ${success}, не вдалося надіслати: ${failed}.`);
        } catch (error) {
            console.error('Error in sendBroadcast:', error);
            await ctx.reply('Сталася помилка при розсилці повідомлення.');
        }
    }

    async handleDeferredBroadcast(ctx) {
        await ctx.reply('Вибрана розсилка по таймеру', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Сьогодні', callback_data: 'schedule_today' }],
                    [{ text: 'Завтра', callback_data: 'schedule_tomorrow' }],
                    [{ text: 'Післязавтра', callback_data: 'schedule_day_after_tomorrow' }]
                ]
            }
        });
    }

    async askForTime(ctx, dayOption) {
        ctx.session = ctx.session || {};
        ctx.session.scheduledDay = dayOption;

        await ctx.reply('Введіть час у форматі ГГ:ХХ (24-годинний формат). Наприклад, 14:30.');
    }

    async scheduleBroadcast(ctx, timeString) {
        ctx.session = ctx.session || {};
        const { scheduledDay } = ctx.session;
        const [hours, minutes] = timeString.split(':').map(Number);

        let scheduledTime = moment.tz('Europe/Kyiv').startOf('day').add(hours, 'hours').add(minutes, 'minutes');

        if (scheduledDay === 'tomorrow') {
            scheduledTime.add(1, 'day');
        } else if (scheduledDay === 'day_after_tomorrow') {
            scheduledTime.add(2, 'days');
        }

        if (scheduledTime.isBefore(moment.tz('Europe/Kyiv'))) {
            await ctx.reply('Вказаний час уже пройшов. Будь ласка, введіть правильний час.');
            return;
        }

        ctx.session.scheduledTime = scheduledTime.toDate();
        ctx.session.awaitingContent = true;

        await ctx.reply('Розсилку заплановано на ' + scheduledTime.format('DD.MM.YYYY HH:mm') + '. Тепер введіть текст або надішліть файл для розсилки.');
    }


    async completeScheduledBroadcast(ctx) {
        if (!ctx.session.scheduledTime) {
            await ctx.reply('Щось пішло не так. Будь ласка, спробуйте знову.');
            return;
        }

        const broadcastData = {
            userId: ctx.from.id,
            broadcastContent: ctx.session.broadcastContent,
            buttons: ctx.session.broadcastButtons,
            scheduledTime: ctx.session.scheduledTime
        };

        const scheduledBroadcast = await ScheduledBroadcast.create(broadcastData);

        schedule.scheduleJob(scheduledBroadcast.scheduledTime, () => {
            this.sendScheduledBroadcast(scheduledBroadcast, ctx.telegram);
        });

        await ctx.reply('Розсилку успішно заплановано на ' + moment(ctx.session.scheduledTime).format('DD.MM.YYYY HH:mm') + '.');

        delete ctx.session.scheduledTime;
        delete ctx.session.broadcastContent;
        delete ctx.session.broadcastButtons;
        delete ctx.session.awaitingContent;
    }



    async sendScheduledBroadcast(broadcast, telegram) {
        const content = broadcast.broadcastContent;
        const buttons = broadcast.buttons || [];

        try {
            if (content.type === 'photo') {
                await telegram.sendPhoto(broadcast.userId, content.file_id, {
                    caption: content.caption,
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                });
            } else if (content.type === 'video') {
                await telegram.sendVideo(broadcast.userId, content.file_id, {
                    caption: content.caption,
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                });
            } else if (content.type === 'document') {
                await telegram.sendDocument(broadcast.userId, content.file_id, {
                    caption: content.caption,
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                });
            } else if (content.type === 'text') {
                await telegram.sendMessage(broadcast.userId, content.text, {
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                });
            }

            broadcast.status = 'completed';
            await broadcast.save();

        } catch (error) {
            console.error(`Failed to send scheduled broadcast to ${broadcast.userId}:`, error);
        }
    }



    async processScheduledBroadcasts() {
        const now = moment.tz('Europe/Kyiv');
        const broadcasts = await ScheduledBroadcast.findAll({
            where: {
                scheduledTime: {
                    [Op.lte]: now.toDate()
                },
                status: 'pending'
            }
        });

        for (const broadcast of broadcasts) {
            const content = broadcast.broadcastContent;
            const buttons = broadcast.buttons || [];

            // Створення контексту для відправки
            const fakeCtx = {
                telegram: {
                    sendPhoto: async (id, fileId, options) => {
                        console.log(`Sending photo to ${id}`);
                        await this.sendPhoto(id, fileId, options);
                    },
                    sendVideo: async (id, fileId, options) => {
                        console.log(`Sending video to ${id}`);
                        await this.sendVideo(id, fileId, options);
                    },
                    sendDocument: async (id, fileId, options) => {
                        console.log(`Sending document to ${id}`);
                        await this.sendDocument(id, fileId, options);
                    },
                    sendMessage: async (id, text, options) => {
                        console.log(`Sending message to ${id}`);
                        await this.sendMessage(id, text, options);
                    }
                },
                session: { broadcastContent: content, broadcastButtons: buttons }
            };

            await this.sendBroadcast(fakeCtx, [{ telegramId: broadcast.userId }]);

            // Оновлення статусу розсилки як виконаної
            broadcast.status = 'completed';
            await broadcast.save();
        }
    }


}

module.exports = new BroadcastService();


