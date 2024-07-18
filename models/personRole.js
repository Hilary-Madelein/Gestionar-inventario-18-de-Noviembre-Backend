'use strict';
const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const personRole = sequelize.define('personRole', {
        externalId: { type: DataTypes.UUID, defaultValue: UUIDV4 },
    }, {
        freezeTableName: true
    });

    personRole.associate = function (models) {
        personRole.belongsTo(models.person, { foreignKey: 'personId' });
        personRole.belongsTo(models.role, { foreignKey: 'roleId' });
    }
    return personRole;
};
