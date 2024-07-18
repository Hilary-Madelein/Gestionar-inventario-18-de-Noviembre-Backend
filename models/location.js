'use strict';

module.exports = (sequelize, DataTypes) => {
    const location = sequelize.define('location', {
        block: { type: DataTypes.INTEGER, defaultValue: 0 },
        roomNumber: { type: DataTypes.INTEGER, defaultValue: 0 },
        parallel: { type: DataTypes.CHAR(2), defaultValue: 'A' },
        level: { type: DataTypes.STRING(15), defaultValue: "PRINCIPAL" },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });

    location.associate = function (models) {
        location.hasOne(models.warehouse, { foreignKey: 'locationId', as: 'warehouse' });
    }

    return location;    
};
