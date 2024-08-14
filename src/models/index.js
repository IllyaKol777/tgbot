const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const User = sequelize.define('User', {
    telegramId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

const ScheduledBroadcast = sequelize.define('ScheduledBroadcast', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    broadcastContent: {
        type: DataTypes.JSON,
        allowNull: false
    },
    buttons: {
        type: DataTypes.JSON,
        allowNull: true
    },
    scheduledTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
    }
});

const AdvertisementLink = sequelize.define('AdvertisementLink', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const StartPost = sequelize.define('start_post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const NextPost = sequelize.define('next_post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    video_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const AviatorPost = sequelize.define('aviator_post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    video_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const MinesPost = sequelize.define('mines_post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    video_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const SubscribePost = sequelize.define('subscribe_post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const AdminPost = sequelize.define('admin_post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = {
    sequelize,
    User,
    ScheduledBroadcast,
    AdvertisementLink,
    StartPost,
    NextPost,
    AviatorPost,
    MinesPost,
    SubscribePost,
    AdminPost
};

