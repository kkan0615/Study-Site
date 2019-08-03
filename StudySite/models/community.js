module.exports = (sequelize, DataTypes) => (
    sequelize.define('community', {
        title: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        title_url: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        img_logo: {
            type: DataTypes.STRING(200), //For URL
            allowNull: true,
        },
        img_background: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        bar_color: {
            type: DataTypes.STRING(10),
            allowNull: true,
        }
    }, {
        timestamps: true,
        paranoid: true,
    })
);