'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models/');
var person = models.person;
var role = models.role;
var personRole = models.personRole;
var account = models.account;
const bcrypt = require('bcrypt');
const saltRounds = 8;

class PersonController {

    async list(req, res) {
        try {
            var get = await person.findAll({
                attributes: ['lastName', 'firstName', 'externalId', 'status', 'photo', 'identificationType', 'identification', 'birthDate'],
                include: [
                    {
                        model: models.personRole,
                        as: 'personRole',
                        attributes: [
                            'externalId'
                        ],
                        include: {
                            model: models.role,
                            as: 'role',
                            attributes: [
                                'name',
                                'externalId'
                            ],
                        }
                    },
                ],
            });
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(500)
            res.json({ msg: 'Error al listar personas', code: 500, info: error });
        }
    }

    async assignRole(req, res) {
        try {
            const externalPerson = req.params.externalId_person;
            const externalRole = req.params.externalId_role;
            var idPerson = await person.findOne({
                where: { externalId: externalPerson },
                attributes: ['firstName', 'lastName', 'id']
            });
            var idRole = await person.findOne({
                where: { external_id: externalRole },
                attributes: ['name', 'id']
            });
            if (idPerson === null || idRole === null) {
                res.status(400);
                res.json({ msg: "DATOS NO ENCONTRADOS", code: 400 });
            } else {
                var data = {
                    "id_person": idPerson.id,
                    "id_role": idRole.id
                }
                let transaction = await models.sequelize.transaction();
                await personRole.create(data, transaction);
                await transaction.commit();
                res.json({
                    msg: "SE HA REGISTRADO EL ROL DE LA PERSONA",
                    code: 200
                });
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else {
                res.json({ msg: error.message, code: 200 });
            }
        }
    }

    async getPerson(req, res) {
        try {
            const external = req.params.external;
            var get = await person.findOne({
                where: { externalId: external },
                include: {
                    model: account,
                    as: 'account',
                    attributes: ['email']
                },
                attributes: ['lastName', 'firstName', 'externalId', 'status', 'photo', 'identificationType', 'identification', 'birthDate'],
            });
            if (get === null) {

                get = {};
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener persona', code: 500, info: error });
        }
    }

    async create(req, res) {
        try {
            let errors = validationResult(req);
            if (errors.isEmpty()) {
                let roleId = req.body.externalId_role;
                if (roleId != undefined) {
                    let roleAux = await role.findOne({ where: { external_id: roleId } });
                    if (roleAux) {
                        var claveHash = function (clave) {
                            return bcrypt.hashSync(clave, bcrypt.genSaltSync(saltRounds), null);
                        };
                        
                        var data = {
                            lastName: req.body.lastName,
                            firstName: req.body.firstName,
                            identification: req.body.identification,
                            identificationType: req.body.identificationType,
                            birthDate: req.body.birthDate,
                            status: false,
                            foto: req.file.filename,
                            account: {
                                email: req.body.email,
                                password: claveHash(req.body.password),
                            },
                            personRole: {
                                roleId: roleAux.id
                            },
                        };
                        res.status(200);
                        let transaction = await models.sequelize.transaction();

                        try {
                            await person.create(data, { include: [{ model: models.account, as: "account"}, { model: models.personRole, as: "personRole" }], transaction });
                            await transaction.commit();
                            res.json({ msg: "REGISTRO GENERADO CON ÉXITO", code: 200 });
                        } catch (error) {
                            if (transaction) await transaction.rollback();
                            if (error.error && error.error[0].message) {
                                res.json({ msg: error.error[0].message, code: 201 });
                            } else {
                                res.json({ msg: error.message, code: 201 });
                            }
                        }

                    } else {
                        res.status(400);
                        res.json({ msg: "DATOS NO ENCONTRADOS", code: 400 });
                    }

                } else {
                    res.status(400);
                    res.json({ msg: "DATOS FALTANTES", code: 400, errors: errors });
                }

            } else {
                res.status(400);
                res.json({ msg: "DATOS FALTANTES", code: 400, errors: errors });
            }

        } catch (error) {
            res.status(500);
            res.json({
                msg: "Se produjo un error al registrar al usuario" + error,
                code: 500
            });

        }
    }

    async update(req, res) {
        try {
            const personAux = await person.findOne({
                where: {
                    externalId: req.body.externalId
                }
            });

            if (!personAux) {
                return res.status(400).json({
                    msg: "NO EXISTE EL REGISTRO DEL USUARIO",
                    code: 400
                });
            }

            const accountAux = await models.account.findOne({
                where: {
                    id_persona: personAux.id
                }
            })
            let lastPhoto = personAux.foto;

            if (req.file) {
                if (lastPhoto) {
                    const lastPhotoPath = path.join(__dirname, '../public/images/users/', lastPhoto);
                    fs.unlink(lastPhotoPath, (err) => {
                        if (err) {
                            console.log('Error al eliminar la imagen anterior:', err);
                        } else {
                            console.log("eliminada: " + lastPhoto)
                        }
                    });
                }
                // Actualizar el nombre de la imagen con el nombre de la nueva imagen cargada
                lastPhoto = req.file.filename;
            }

            personAux.identification = req.body.identification;
            personAux.identificationType = req.body.identificationType;
            personAux.firstName = req.body.firstName;
            personAux.lastName = req.body.lastName;
            personAux.status = req.body.status;
            accountAux.status = req.body.status;
            personAux.photo = lastPhoto;
            personAux.external_id = uuid.v4();

            const result = await personAux.save();
            await accountAux.save();
            if (!result) {
                return res.status(400).json({
                    msg: "NO SE HAN ACTUALIZADO LOS DATOS, INTENTE NUEVAMENTE",
                    code: 400
                });
            }

            return res.status(200).json({
                msg: "SE HAN ACTUALIZADO SUS DATOS CON ÉXITO",
                code: 200
            });

        } catch (error) {
            console.log(error)
            return res.status(400).json({
                msg: "Error en el servicio de guardar persona",
                code: 400
            });
        }
    }
}
module.exports = PersonController;