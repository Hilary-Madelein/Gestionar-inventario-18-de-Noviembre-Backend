'use strict';

module.exports = (sequelize, DataTypes) => {
    const kardex = sequelize.define('kardex', {
        code: { type: DataTypes.STRING(40), defaultValue: "NO_DATA" },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });

    kardex.associate = function (models) {
        kardex.belongsTo(models.warehouse, {foreignKey: 'warehouseId'});
        kardex.belongsTo(models.product, {foreignKey: 'productId'});
        kardex.hasMany(models.itemKardex, { foreignKey: 'kardexId', as: 'itemKardex' });
    }

    return kardex;    
};