'use strict';

module.exports = (sequelize, DataTypes) => {
    const warehouseManager = sequelize.define('warehouseManager', {
        startDate: { type: DataTypes.DATE },
        endDate: { type: DataTypes.DATE },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });

    warehouseManager.associate = function (models) {
        warehouseManager.belongsTo(models.warehouse, { foreignKey: 'warehouseId' });
        warehouseManager.belongsTo(models.person, { foreignKey: 'personId' });
    }

    return warehouseManager;
};
