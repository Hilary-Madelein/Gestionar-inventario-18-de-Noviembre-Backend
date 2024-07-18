'use strict';

module.exports = (sequelize, DataTypes) => {
    const role = sequelize.define('role', {
        name: {type: DataTypes.STRING(20), unique:true },
        status: {type: DataTypes.BOOLEAN, defaultValue: true},
        externalId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    }, {freezeTableName: true});

    role.associate = function (models) {
        role.hasMany(models.personRole, {foreignKey: 'personId', as: 'personRole'});
    }

    return role;    
};