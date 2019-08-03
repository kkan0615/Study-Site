module.exports = (sequelize, DataTypes) => (
    sequelize.define('program', {
    }, {
        timestamps: true,
        paranoid: true,
    })
);