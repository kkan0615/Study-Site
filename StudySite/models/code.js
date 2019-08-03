module.exports = (sequelize, DataTypes) => (
    sequelize.define('code', {
        name: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique:true,
        }
    }, {
        timestamps: true,
        paranoid: true,
    })
);