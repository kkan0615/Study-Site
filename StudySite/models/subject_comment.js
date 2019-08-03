module.exports = (sequelize, DataTypes) => (
    sequelize.define('subject_comment', {
        content: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);