'use strict';

module.exports = (sequelize, DataTypes) => {
    const warehouse = sequelize.define('warehouse', {
        code: { type: DataTypes.STRING(50), unique: true },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });

    warehouse.associate = function (models) {
        warehouse.hasOne(models.warehouseManager, { foreignKey: 'warehouseId', as: 'warehouseManager' });
        warehouse.hasOne(models.location, { foreignKey: 'warehouseId', as: 'location' });
        warehouse.hasMany(models.kardex, { foreignKey: 'warehouseId', as: 'kardex' });
    }

    return warehouse;    
};
