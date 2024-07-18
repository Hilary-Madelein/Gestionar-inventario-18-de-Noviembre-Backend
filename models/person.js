'use strict';
const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const person = sequelize.define('person', {
        externalId: { type: DataTypes.UUID, defaultValue: UUIDV4 },
        status: { type: DataTypes.BOOLEAN, defaultValue: true },
        photo: { type: DataTypes.STRING(100), defaultValue: "NO_DATA" },
        firstName: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        lastName: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        identificationType: { type: DataTypes.ENUM("CEDULA", "PASAPORTE", "RUC"), defaultValue: "CEDULA" },
        identification: {
            type: DataTypes.STRING(10),
            unique: true,
            validate: {
                esUnicaIdentificacion: function (value, next) {
                    const person = this;
                    if (!/^\d+$/.test(value)) {
                        return next("La identificación debe contener solo números");
                    }
                    Person.findOne({ 
                        where: { 
                            identification: value 
                        }
                    }).then(function (existingPerson) {
                        if (existingPerson && person.id !== existingPerson.id) {
                            return next("La identificación ya está siendo utilizada por otra persona");
                        }
                        return next();
                    }).catch(function (err) {
                        return next(err);
                    });
                }
            }
        },
        birthDate: { type: DataTypes.DATE }
    }, {
        freezeTableName: true
    });

    person.associate = function (models) {
        person.hasMany(models.personRole, { foreignKey: 'personId', as: 'personRole' });
        person.hasOne(models.account, { foreignKey: 'personId', as: 'account' });
    };

    return person;
};
