const userController = require('../controllers/userController');

module.exports = (bot) => {
    bot.hears('Статистика', userController.getStatistics.bind(userController));
};
