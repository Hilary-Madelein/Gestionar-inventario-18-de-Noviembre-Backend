'use strict';

module.exports = (sequelize, DataTypes) => {
    const product = sequelize.define('product', {
        name: { type: DataTypes.STRING(40), defaultValue: "NO_DATA" },
        photo: { type: DataTypes.STRING(100), defaultValue: "NO_DATA"},
        category: { type: DataTypes.ENUM("LECHE", "MASA HORNEADA", "BOCADITO DE SAL", "GRANOLA", "JUGO/NECTAR", "BARRA CEREAL", "BEBIDA A BASE DE LECHE"), defaultValue: "LECHE"},
        maximumStock: { type: DataTypes.INTEGER, defaultValue: 0 },
        minimumStock: { type: DataTypes.INTEGER, defaultValue: 0 },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });

    product.associate = function (models) {
        product.hasMany(models.batch, { foreignKey: 'productId', as: 'batch' });
    }

    return product;    
};
