module.exports = (sequelize, DataTypes) => (
    sequelize.define('program', {
        cover: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        introduction: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        url_key: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);