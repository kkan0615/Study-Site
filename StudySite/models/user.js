module.exports = (sequelize, DataTypes) => (
    sequelize.define('user', {
        email: {
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true,
        },
        nickname: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        provider: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'local',
        },
        snsId: {
            type: DataTypes.STRING(50),
        },
        img: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: false,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);