'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
const location = models.location;
const uuid = require('uuid');

class LocationController {

    async list(req, res) {
        try {
            var get = await location.findAll({
                attributes: ['block', 'roomNumber', 'parallel', 'level', 'externalId', 'status'],
            });
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(400)
            res.json({ msg: 'Error al listar ubicaciones' +error, code: 400, info: error });
        }
    }

    async getLocation(req, res) {
        try {
            const external = req.body.external;
            var get = await location.findOne({
                where: { externalId: external },
                attributes: ['block', 'roomNumber', 'parallel', 'level', 'externalId', 'status'],
            });
            if (get === null) {

                get = {};
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener ubicación', code: 400, info: error });
        }
    }

    async save(req, res) {
        try {
            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ msg: "DATOS NO ENCONTRADOS", code: 400 });
            }
    
            var data = {
                block: req.body.block,
                roomNumber: req.body.roomNumber, 
                parallel: req.body.parallel,
                level: req.body.level,
                externalId: req.body.externalId,
                status: req.body.status,
            };
    
            let transaction = await models.sequelize.transaction();
            try {
                await location.create(data, { transaction });
                await transaction.commit();
                res.json({
                    msg: "SE HA REGISTRADO LA UBICACIÓN CON ÉXITO",
                    code: 200
                });
            } catch (error) {
                if (transaction) await transaction.rollback();
                if (error.error && error.error[0].message) {
                    res.json({ msg: error.error[0].message, code: 201 });
                } else {
                    res.json({ msg: error.message, code: 201 });
                }
            }
        } catch (error) {
            res.status(400).json({
                msg: "Se produjo un error al registrar la ubicación: " + error,
                code: 400
            });
        }
    }

    async update(req, res) {
        try {
            const locationAux = await location.findOne({
                where: {
                    externalId: req.body.externalId
                }
            });

            if (!locationAux) {
                return res.status(400).json({
                    msg: "NO EXISTE EL REGISTRO DE LA UBICACIÓN",
                    code: 400
                });
            }

            locationAux.block = req.body.block;
            locationAux.roomNumber = req.body.roomNumber;
            locationAux.parallel = req.body.parallel;
            locationAux.level = req.body.level;
            locationAux.status = req.body.status;
            locationAux.externalId = uuid.v4();

            const result = await locationAux.save();

            if (!result) {
                return res.status(400).json({
                    msg: "NO SE HAN ACTUALIZADO LOS DATOS, INTENTE NUEVAMENTE",
                    code: 400
                });
            }

            return res.status(200).json({
                msg: "SE HAN ACTUALIZADO LOS DATOS DE LA UBICACIÓN CON ÉXITO",
                code: 200
            });

        } catch (error) {
            return res.status(400).json({
                msg: "Error en el servicio de actualizar ubicación" + error,
                code: 400
            });
        }
    }
}
module.exports = LocationController;