// const { Sequelize, DataTypes } = require('sequelize');
//
// // Налаштування підключення до бази даних
// const sequelize = new Sequelize({
//     dialect: 'sqlite',
//     storage: './database.sqlite'
// });
//
// // Визначення моделі користувача з додаванням колонки username
// const User = sequelize.define('User', {
//     telegramId: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true
//     },
//     username: {
//         type: DataTypes.STRING,  // Додано колонку username
//         allowNull: false
//     },
//     isAdmin: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false
//     }
// });
//
// (async () => {
//     try {
//         // Синхронізація моделі з базою даних (оновлення структури таблиці)
//         await sequelize.sync({ alter: true });
//
//         // Додавання адміністратора
//         const adminUser = await User.create({
//             telegramId: '5755114757',
//             username: 'mrakeno',
//             isAdmin: true
//         });
//
//         console.log('Адміністратора додано:', adminUser.toJSON());
//     } catch (error) {
//         console.error('Помилка при додаванні адміністратора:', error);
//     } finally {
//         await sequelize.close();
//     }
// })();

//
// const { Sequelize, DataTypes } = require('sequelize');
// const { StartPost, NextPost, AviatorPost, MinesPost, SubscribePost, AdminPost } = require('./models');
//
// // Ініціалізація Sequelize
// const sequelize = new Sequelize({
//     dialect: 'sqlite',
//     storage: './database.sqlite'
// });
//
// async function insertTestData() {
//     try {
//         // Синхронізація моделей з базою даних
//         await sequelize.sync();
//
//         // Вставка даних у таблицю start_post
//         await StartPost.create({
//             text: 'These robot signals are for games such as :\n🚀AVIATOR\n💣MINES.\nTo find out how the robots work, click on the "Learn more" button.'
//         });
//
//         // Вставка даних у таблицю next_post
//         await NextPost.create({
//             text: 'Select the BOT you wish to receive ✍️',
//             video_name: 'next_video'
//         });
//
//         // Вставка даних у таблицю aviator_post
//         await AviatorPost.create({
//             text: '🚀Aviator Bot is a bot that calculates average odds and divides them into 10 matches. Following the signals of this bot you have to place 10 bets with the same odds. You activate automatic betting and automatic withdrawal and every 10 games you change the odds. You can get access to this bot from the administrator by writing to him.',
//             video_name: 'aviator_video'
//         });
//
//         // Вставка даних у таблицю mines_post
//         await MinesPost.create({
//             text: '💣Mines Bot is a bot that detects the approximate location of bombs. The asterisks indicate the boxes where you must click to avoid hitting the bomb. Repeat the bot and little by little your balance will start to grow. Access to this bot can be obtained from the administrator by writing to him.',
//             video_name: 'mines_video'
//         });
//
//         // Вставка даних у таблицю subscribe_post
//         await SubscribePost.create({
//             text: '👇 Subscribe to the channel',
//             link: 'https://t.me/+kgiTI6v1zDtjMjAy'
//         });
//
//         // Вставка даних у таблицю admin_post
//         await AdminPost.create({
//             text: '👇 Write to the Administrator 👇.',
//             link: 'https://t.me/peterfloyd_bots'
//         });
//
//         console.log('Дані успішно додані до бази даних.');
//     } catch (error) {
//         console.error('Сталася помилка при вставці даних:', error);
//     } finally {
//         await sequelize.close();
//     }
// }
//
// insertTestData();


const { User } = require('./models');

async function addAdmin() {
    try {
        // Перевіряємо, чи існує вже такий користувач в базі
        let user = await User.findOne({ where: { telegramId: '609460211' } });

        if (!user) {
            // Якщо користувача немає в базі, додаємо його
            user = await User.create({
                telegramId: '609460211',
                username: 'ginexty',
                isAdmin: true
            });
            console.log(`Користувача ${user.username} додано як адміністратора.`);
        } else {
            // Якщо користувач вже є в базі, оновлюємо його статус
            await User.update({ isAdmin: true }, { where: { telegramId: '609460211' } });
            console.log(`Користувач ${user.username} вже існує. Статус оновлено на адміністратора.`);
        }
    } catch (error) {
        console.error('Помилка при додаванні адміністратора:', error);
    }
}

// Викликаємо функцію для додавання адміністратора
addAdmin();

