'use strict';
const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const account = sequelize.define('account', {
        email: { type: DataTypes.STRING(60), allowNull: false, unique: true },
        password: { type: DataTypes.STRING(250), allowNull: false },
        externalId: { type: DataTypes.UUID, defaultValue: UUIDV4 },
        status: { type: DataTypes.ENUM("ACEPTADO", "DENEGADO", "ESPERA"), defaultValue: "ESPERA" },
    }, {
        freezeTableName: true
    });

    account.associate = function (models) {
        account.belongsTo(models.person, { foreignKey: 'personId' });
    }
    return account;
};
