module.exports = (sequelize, DataTypes) => (
    sequelize.define('comment', {
        conetent: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        img: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);