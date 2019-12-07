module.exports = (sequelize, DataTypes) => (
    sequelize.define('subject', {
        title: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique:true,
        },
        content: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },
        video: {
            type: DataTypes.STRING(),
            allowNull: true,
        }
    }, {
        timestamps: true,
        paranoid: true,
    })
);