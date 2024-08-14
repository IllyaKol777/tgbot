// const postController = require('../controllers/postsController');
//
// module.exports = (bot) => {
//     bot.hears('Редагувати пости', postController.handlePostList.bind(postController));
//
//     bot.on('callback_query', async (ctx, next) => {
//         const data = ctx.callbackQuery.data;
//
//         if (data.startsWith('edit_')) {
//             await postController.handleEditPost(ctx);
//         } else {
//             return await next();
//         }
//     });
//
//     bot.on('text', async (ctx, next) => {
//         if (ctx.session.awaitingVideo) {
//             await postController.handleNewVideo(ctx);
//         } else if (['start', 'next', 'aviator', 'mines', 'subscribe', 'admin'].includes(ctx.session.editPostType)) {
//             await postController.handleNewText(ctx);
//         } else {
//             return await next();
//         }
//     });
//
//     bot.on('message', async (ctx, next) => {
//         if (ctx.session.awaitingVideo) {
//             await postController.handleNewVideo(ctx);
//         } else {
//             return await next();
//         }
//     });
// };

const postController = require('../controllers/postsController');

module.exports = (bot) => {
    bot.hears('Список постів', postController.handlePostList.bind(postController));

    bot.on('callback_query', async (ctx, next) => {
        ctx.session = ctx.session || {}; // Ініціалізуємо ctx.session, якщо його ще немає

        const data = ctx.callbackQuery.data;

        if (data.startsWith('edit_')) {
            await postController.handleEditPost(ctx);
        } else {
            return await next(); // Передаємо далі, якщо callback не підходить для postController
        }
    });

    bot.on('text', async (ctx, next) => {
        ctx.session = ctx.session || {}; // Ініціалізуємо ctx.session, якщо його ще немає

        if (ctx.session.awaitingVideo) {
            await postController.handleNewVideo(ctx);
        } else if (['start', 'next', 'aviator', 'mines', 'subscribe', 'admin'].includes(ctx.session.editPostType)) {
            await postController.handleNewText(ctx);
        } else {
            return await next(); // Передаємо далі, якщо текст не підходить для postController
        }
    });

    bot.on('message', async (ctx, next) => {
        ctx.session = ctx.session || {}; // Ініціалізуємо ctx.session, якщо його ще немає

        if (ctx.session.awaitingVideo) {
            await postController.handleNewVideo(ctx);
        } else {
            return await next(); // Передаємо далі, якщо повідомлення не підходить для postController
        }
    });
};
