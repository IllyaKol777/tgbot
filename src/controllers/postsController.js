// const { StartPost, NextPost, AviatorPost, MinesPost, SubscribePost, AdminPost } = require('../models');
// const path = require('path');
// const fs = require('fs');
//
// class PostController {
//     async handlePostList(ctx) {
//         try {
//             // Start Post
//             const startPost = await StartPost.findOne();
//             if (startPost) {
//                 await ctx.reply(startPost.text, {
//                     reply_markup: {
//                         inline_keyboard: [
//                             [{ text: 'Редагувати', callback_data: `edit_start_post_${startPost.id}` }]
//                         ]
//                     }
//                 });
//             }
//
//             // Next Post
//             const nextPost = await NextPost.findOne();
//             if (nextPost) {
//                 const videoPath = path.resolve(__dirname, '../../videos', `${nextPost.video_name}.mp4`);
//                 //const videoPath = path.resolve(__dirname, '../../videos', 'next_video.mp4');
//                 if (fs.existsSync(videoPath)) {
//                     await ctx.replyWithVideo({ source: videoPath }, {
//                         caption: nextPost.text,
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'Редагувати', callback_data: `edit_next_post_${nextPost.id}` }]
//                             ]
//                         }
//                     });
//                 }
//             }
//
//             // Aviator Post
//             const aviatorPost = await AviatorPost.findOne();
//             if (aviatorPost) {
//                 const videoPath = path.resolve(__dirname, '../../videos', `${aviatorPost.video_name}.mp4`);
//                 if (fs.existsSync(videoPath)) {
//                     await ctx.replyWithVideo({ source: videoPath }, {
//                         caption: aviatorPost.text,
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'Редагувати', callback_data: `edit_aviator_post_${aviatorPost.id}` }]
//                             ]
//                         }
//                     });
//                 }
//             }
//
//             // Mines Post
//             const minesPost = await MinesPost.findOne();
//             if (minesPost) {
//                 const videoPath = path.resolve(__dirname, '../../videos', `${minesPost.video_name}.mp4`);
//                 if (fs.existsSync(videoPath)) {
//                     await ctx.replyWithVideo({ source: videoPath }, {
//                         caption: minesPost.text,
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'Редагувати', callback_data: `edit_mines_post_${minesPost.id}` }]
//                             ]
//                         }
//                     });
//                 }
//             }
//
//             // Subscribe Post
//             const subscribePost = await SubscribePost.findOne();
//             if (subscribePost) {
//                 await ctx.reply(`${subscribePost.text}\n${subscribePost.link}`, {
//                     reply_markup: {
//                         inline_keyboard: [
//                             [{ text: 'Редагувати', callback_data: `edit_subscribe_post_${subscribePost.id}` }]
//                         ]
//                     }
//                 });
//             }
//
//             // Admin Post
//             const adminPost = await AdminPost.findOne();
//             if (adminPost) {
//                 await ctx.reply(`${adminPost.text}\n${adminPost.link}`, {
//                     reply_markup: {
//                         inline_keyboard: [
//                             [{ text: 'Редагувати', callback_data: `edit_admin_post_${adminPost.id}` }]
//                         ]
//                     }
//                 });
//             }
//         } catch (error) {
//             console.error('Error in handlePostList:', error);
//             await ctx.reply('Сталася помилка при отриманні списку постів.');
//         }
//     }
//
//     async handleEditPost(ctx) {
//         const callbackData = ctx.callbackQuery.data.split('_');
//         const postType = callbackData[1];
//         const postId = parseInt(callbackData[2]);
//
//         ctx.session = ctx.session || {};
//         ctx.session.editPostType = postType;
//         ctx.session.editPostId = postId;
//
//         try {
//             if (postType === 'start') {
//                 await ctx.reply('Введіть новий текст для поста:');
//             } else if (['next', 'aviator', 'mines'].includes(postType)) {
//                 await ctx.reply('Надішліть нове відео для поста:');
//                 ctx.session.awaitingVideo = true;
//             } else if (['subscribe', 'admin'].includes(postType)) {
//                 await ctx.reply('Введіть новий текст для поста:');
//             }
//         } catch (error) {
//             console.error('Error in handleEditPost:', error);
//             await ctx.reply('Сталася помилка при підготовці редагування.');
//         }
//     }
//
//     async handleNewVideo(ctx) {
//         if (!ctx.session.awaitingVideo) return;
//
//         try {
//             const video = ctx.message.video;
//             if (!video) {
//                 await ctx.reply('Будь ласка, надішліть відео.');
//                 return;
//             }
//
//             const videoPath = path.resolve(__dirname, '../../videos', video.file_id);
//             const fileStream = fs.createWriteStream(videoPath);
//
//             await new Promise((resolve, reject) => {
//                 ctx.telegram.getFileStream(video.file_id)
//                     .pipe(fileStream)
//                     .on('finish', resolve)
//                     .on('error', reject);
//             });
//
//             ctx.session.newVideoName = video.file_id;
//             ctx.session.awaitingVideo = false;
//
//             await ctx.reply('Відео збережено. Введіть новий текст для поста:');
//         } catch (error) {
//             console.error('Error in handleNewVideo:', error);
//             await ctx.reply('Сталася помилка при збереженні відео.');
//         }
//     }
//
//     async handleNewText(ctx) {
//         const postType = ctx.session.editPostType;
//         const postId = ctx.session.editPostId;
//         const newText = ctx.message.text;
//
//         try {
//             if (postType === 'start') {
//                 await StartPost.update({ text: newText }, { where: { id: postId } });
//             } else if (postType === 'next') {
//                 await NextPost.update({ text: newText, video_name: ctx.session.newVideoName }, { where: { id: postId } });
//             } else if (postType === 'aviator') {
//                 await AviatorPost.update({ text: newText, video_name: ctx.session.newVideoName }, { where: { id: postId } });
//             } else if (postType === 'mines') {
//                 await MinesPost.update({ text: newText, video_name: ctx.session.newVideoName }, { where: { id: postId } });
//             } else if (postType === 'subscribe') {
//                 await SubscribePost.update({ text: newText, link: ctx.session.newLink }, { where: { id: postId } });
//             } else if (postType === 'admin') {
//                 await AdminPost.update({ text: newText, link: ctx.session.newLink }, { where: { id: postId } });
//             }
//
//             ctx.session.editPostType = null;
//             ctx.session.editPostId = null;
//             ctx.session.newVideoName = null;
//             ctx.session.newLink = null;
//
//             await this.handlePostList(ctx); // Виводимо оновлений список постів
//         } catch (error) {
//             console.error('Error in handleNewText:', error);
//             await ctx.reply('Сталася помилка при оновленні поста.');
//         }
//     }
//
//     async handleNewLink(ctx) {
//         ctx.session.newLink = ctx.message.text;
//         await ctx.reply('Введіть новий текст для поста:');
//     }
// }
//
// module.exports = new PostController();

const { StartPost, NextPost, AviatorPost, MinesPost, SubscribePost, AdminPost } = require('../models');
const path = require('path');
const fs = require('fs');

class PostController {
    async handlePostList(ctx) {
        try {
            // Start Post
            const startPost = await StartPost.findOne();
            if (startPost) {
                await ctx.reply(startPost.text, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Редагувати', callback_data: `edit_start_post_${startPost.id}` }]
                        ]
                    }
                });
            }

            // Next Post
            const nextPost = await NextPost.findOne();
            if (nextPost) {
                const videoPath = path.resolve(__dirname, '../../videos', `${nextPost.video_name}.mp4`);
                if (fs.existsSync(videoPath)) {
                    await ctx.replyWithVideo({ source: videoPath }, {
                        caption: nextPost.text,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Редагувати', callback_data: `edit_next_post_${nextPost.id}` }]
                            ]
                        }
                    });
                }
            }

            // Aviator Post
            const aviatorPost = await AviatorPost.findOne();
            if (aviatorPost) {
                const videoPath = path.resolve(__dirname, '../../videos', `${aviatorPost.video_name}.mp4`);
                if (fs.existsSync(videoPath)) {
                    await ctx.replyWithVideo({ source: videoPath }, {
                        caption: aviatorPost.text,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Редагувати', callback_data: `edit_aviator_post_${aviatorPost.id}` }]
                            ]
                        }
                    });
                }
            }

            // Mines Post
            const minesPost = await MinesPost.findOne();
            if (minesPost) {
                const videoPath = path.resolve(__dirname, '../../videos', `${minesPost.video_name}.mp4`);
                if (fs.existsSync(videoPath)) {
                    await ctx.replyWithVideo({ source: videoPath }, {
                        caption: minesPost.text,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Редагувати', callback_data: `edit_mines_post_${minesPost.id}` }]
                            ]
                        }
                    });
                }
            }

            // Subscribe Post
            const subscribePost = await SubscribePost.findOne();
            if (subscribePost) {
                await ctx.reply(`${subscribePost.text}\n${subscribePost.link}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Редагувати', callback_data: `edit_subscribe_post_${subscribePost.id}` }]
                        ]
                    }
                });
            }

            // Admin Post
            const adminPost = await AdminPost.findOne();
            if (adminPost) {
                await ctx.reply(`${adminPost.text}\n${adminPost.link}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Редагувати', callback_data: `edit_admin_post_${adminPost.id}` }]
                        ]
                    }
                });
            }
        } catch (error) {
            console.error('Error in handlePostList:', error);
            await ctx.reply('Сталася помилка при отриманні списку постів.');
        }
    }

    async handleEditPost(ctx) {
        const callbackData = ctx.callbackQuery.data.split('_');
        const postType = callbackData[1];
        const postId = parseInt(callbackData[2]);

        ctx.session = ctx.session || {};
        ctx.session.editPostType = postType;
        ctx.session.editPostId = postId;
        ctx.session.awaitingText = ['start', 'subscribe', 'admin'].includes(postType);

        try {
            if (ctx.session.awaitingText) {
                await ctx.reply('Введіть новий текст для поста:');
            } else if (['next', 'aviator', 'mines'].includes(postType)) {
                await ctx.reply('Надішліть нове відео для поста:');
                ctx.session.awaitingVideo = true;
            }
        } catch (error) {
            console.error('Error in handleEditPost:', error);
            await ctx.reply('Сталася помилка при підготовці редагування.');
        }
    }

    async handleNewVideo(ctx) {
        if (!ctx.session.awaitingVideo) return;

        try {
            const video = ctx.message.video;
            if (!video) {
                await ctx.reply('Будь ласка, надішліть відео.');
                return;
            }

            const videoPath = path.resolve(__dirname, '../../videos', `${video.file_id}.mp4`);
            const fileStream = fs.createWriteStream(videoPath);

            await new Promise((resolve, reject) => {
                ctx.telegram.getFileStream(video.file_id)
                    .pipe(fileStream)
                    .on('finish', resolve)
                    .on('error', reject);
            });

            ctx.session.newVideoName = video.file_id;
            ctx.session.awaitingVideo = false;
            ctx.session.awaitingText = true;

            await ctx.reply('Відео збережено. Тепер введіть новий текст для поста:');
        } catch (error) {
            console.error('Error in handleNewVideo:', error);
            await ctx.reply('Сталася помилка при збереженні відео.');
        }
    }

    async handleNewText(ctx) {
        if (!ctx.session.awaitingText) return;

        const postType = ctx.session.editPostType;
        const postId = ctx.session.editPostId;
        const newText = ctx.message.text;

        try {
            if (postType === 'start') {
                await StartPost.update({ text: newText }, { where: { id: postId } });
            } else if (postType === 'next') {
                await NextPost.update({ text: newText, video_name: ctx.session.newVideoName }, { where: { id: postId } });
            } else if (postType === 'aviator') {
                await AviatorPost.update({ text: newText, video_name: ctx.session.newVideoName }, { where: { id: postId } });
            } else if (postType === 'mines') {
                await MinesPost.update({ text: newText, video_name: ctx.session.newVideoName }, { where: { id: postId } });
            } else if (postType === 'subscribe') {
                await SubscribePost.update({ text: newText, link: ctx.session.newLink }, { where: { id: postId } });
            } else if (postType === 'admin') {
                await AdminPost.update({ text: newText, link: ctx.session.newLink }, { where: { id: postId } });
            }

            // Очищення сесії після завершення редагування
            ctx.session.editPostType = null;
            ctx.session.editPostId = null;
            ctx.session.newVideoName = null;
            ctx.session.newLink = null;
            ctx.session.awaitingText = false;

            await this.handlePostList(ctx); // Виводимо оновлений список постів
        } catch (error) {
            console.error('Error in handleNewText:', error);
            await ctx.reply('Сталася помилка при оновленні поста.');
        }
    }

    async handleNewLink(ctx) {
        ctx.session.newLink = ctx.message.text;
        ctx.session.awaitingText = true; // Переходимо до очікування тексту після лінку
        await ctx.reply('Введіть новий текст для поста:');
    }
}

module.exports = new PostController();
