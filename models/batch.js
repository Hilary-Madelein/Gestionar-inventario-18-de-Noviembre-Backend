'use strict';

module.exports = (sequelize, DataTypes) => {
    const batch = sequelize.define('batch', {
        code: { type: DataTypes.STRING(50), unique: true },
        expirationDate: { type: DataTypes.DATE },
        expiryDate: { type: DataTypes.DATE },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });

    batch.associate = function (models) {
        batch.belongsTo(models.product, { foreignKey: 'productId' });
        batch.hasMany(models.itemKardex, { foreignKey: 'batchId', as: 'itemKardex' });
    }

    return batch;
};
