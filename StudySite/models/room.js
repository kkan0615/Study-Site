module.exports = (sequelize, DataTypes) => (
    sequelize.define('room', {
        name: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);