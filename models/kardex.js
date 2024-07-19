'use strict';

module.exports = (sequelize, DataTypes) => {
    const kardex = sequelize.define('kardex', {
        code: { type: DataTypes.STRING(40), defaultValue: "NO_DATA" },
        maximumStock: { type: DataTypes.INTEGER, defaultValue: 0 },
        minimumStock: { type: DataTypes.INTEGER, defaultValue: 0 },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });

    kardex.associate = function (models) {
        kardex.belongsTo(models.warehouse, {foreignKey: 'warehouseId'});
        kardex.hasMany(models.itemKardex, { foreignKey: 'kardexId', as: 'itemKardex' });
        kardex.belongsTo(models.product, {foreignKey: 'productId'});
    }

    return kardex;    
};