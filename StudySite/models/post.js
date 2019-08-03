module.exports = (sequelize, DataTypes) => (
    sequelize.define('post', {
        title: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        img: {
            type: DataTypes.STRING(200), //For URL
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);