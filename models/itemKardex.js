'use strict';
const { DataTypes, NOW } = require("sequelize");

module.exports = (sequelize) => {
    const itemKardex = sequelize.define('itemKardex', {
        date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        detail: { type: DataTypes.STRING(200), defaultValue: "NO_DATA" },
        quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
        existence: { type: DataTypes.INTEGER, defaultValue: 0 },
        movementType: {
            type: DataTypes.ENUM("ENTRADA EXTERNA", "ENTRADA INTERNA", "SALIDA EXTERNA", "SALIDA INTERNA"),
            defaultValue: "SALIDA INTERNA"
        },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true },
        originWarehouseId: { type: DataTypes.STRING(50), allowNull: true },
        destinationWarehouseId: { type: DataTypes.STRING(50), allowNull: true }
    }, { freezeTableName: true });

    itemKardex.associate = function (models) {
        itemKardex.belongsTo(models.kardex, { foreignKey: 'kardexId' });
        itemKardex.belongsTo(models.batch, { foreignKey: 'batchId' });
    }

    return itemKardex;
};
