module.exports = (sequelize, DataTypes) => (
    sequelize.define('chapter', {
        title: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        number: {
            type: DataTypes.INTEGER(10),
            allowNull: false,
        }
    }, {
        timestamps: true,
        paranoid: true,
    })
);