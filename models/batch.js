'use strict';

module.exports = (sequelize, DataTypes) => {
    const batch = sequelize.define('batch', {
        code: { type: DataTypes.STRING(50), unique: true },
        expirationDate: { 
            type: DataTypes.DATE,
            validate: {
                isFutureDate(value) {
                    if (new Date(value) <= new Date()) {
                        throw new Error('La fecha de caducidad debe ser futura.');
                    }
                    if (this.expiryDate && new Date(value) <= new Date(this.expiryDate)) {
                        throw new Error('La fecha de caducidad debe ser posterior a la fecha de elaboración.');
                    }
                }
            }
        },
        expiryDate: { 
            type: DataTypes.DATE,
            validate: {
                notInFuture(value) {
                    if (new Date(value) > new Date()) {
                        throw new Error('La fecha de elaboración no debe ser futura.');
                    }
                }
            }
        },
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });

    batch.associate = function (models) {
        batch.hasMany(models.itemKardex, { foreignKey: 'batchId', as: 'itemKardex' });
    }

    return batch;
};
