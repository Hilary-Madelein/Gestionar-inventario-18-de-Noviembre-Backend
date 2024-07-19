'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
const warehouse = models.warehouse;
const location = models.location;
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

class WarehouseController {

    async list(req, res) {
        try {
            var get = await warehouse.findAll({
                attributes: ['code', 'externalId', 'status'],
                include: [
                    {
                        model: location,
                        as: 'location',
                        attributes: ['block', 'roomNumber', 'parallel', 'level', 'externalId', 'status'],
                    },
                ],
            });
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(400)
            res.json({ msg: 'Error al listar bodegas' +error, code: 400, info: error });
        }
    }

    async getWarehouse(req, res) {
        try {
            const external = req.body.external;
            var get = await warehouse.findOne({
                where: { externalId: external },
                attributes: ['code', 'externalId', 'status'],
                include: [
                    {
                        model: location,
                        as: 'location',
                        attributes: ['block', 'roomNumber', 'parallel', 'level', 'externalId', 'status'],
                    },
                ],
            });
            if (get === null) {

                get = {};
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener bodega', code: 400, info: error });
        }
    }

    async save(req, res) {
        try {
            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ msg: "DATOS NO ENCONTRADOS", code: 400 });
            }
    
            var data = {
                code: req.body.code,
                location: {
                    block: req.body.block,
                    roomNumber: req.body.roomNumber,
                    parallel: req.body.parallel,
                    level: req.body.level,

                },
            };
    
            let transaction = await models.sequelize.transaction();
            try {
                await warehouse.create(data, { include: [{ model: models.location, as: "location"}]}, { transaction });
                await transaction.commit();
                res.json({
                    msg: "SE HA REGISTRADO LA BODEGA CON ÉXITO",
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
                msg: "Se produjo un error al registrar la bodega: " + error,
                code: 400
            });
        }
    }

    async update(req, res) {
        try {
            const warehouseAux = await warehouse.findOne({
                where: {
                    externalId: req.body.external
                }
            });

            console.log("wwww", warehouseAux.id);

            const locationAux = await models.location.findOne({
                where: {
                    warehouseId: warehouseAux.id
                }
            });

            console.log("ddddd", locationAux);


            if (!warehouseAux) {
                return res.status(400).json({
                    msg: "NO EXISTE EL REGISTRO DE LA BODEGA",
                    code: 400
                });
            }

            warehouseAux.code = req.body.code;
            warehouseAux.status = req.body.status;
            locationAux.block = req.body.block;
            locationAux.roomNumber = req.body.roomNumber;
            locationAux.parallel = req.body.parallel;
            locationAux.level = req.body.level;
            locationAux.status = req.body.status;
            locationAux.externalId = uuid.v4();
            warehouseAux.externalId = uuid.v4();

            const result = await warehouseAux.save();
            await locationAux.save();
            if (!result) {
                return res.status(400).json({
                    msg: "NO SE HAN ACTUALIZADO LOS DATOS, INTENTE NUEVAMENTE",
                    code: 400
                });
            }

            return res.status(200).json({
                msg: "SE HAN ACTUALIZADO LOS DATOS DE LA BODEGA CON ÉXITO",
                code: 200
            });

        } catch (error) {
            return res.status(400).json({
                msg: "Error en el servicio de actualizar producto" + error,
                code: 400
            });
        }
    }
}
module.exports = WarehouseController;