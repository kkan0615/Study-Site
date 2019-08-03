module.exports = (sequelize, DataTypes) => (
    sequelize.define('chat', {
        customer: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        content: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);