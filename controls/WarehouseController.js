'use strict';
const { validationResult } = require('express-validator');
const models = require('../models');
const warehouse = models.warehouse;
const location = models.location;
const uuid = require('uuid');

class WarehouseController {

    async list() {
        try {
            const get = await warehouse.findAll({
                attributes: ['code', 'externalId', 'status'],
                include: [
                    {
                        model: location,
                        as: 'location',
                        attributes: ['block', 'roomNumber', 'parallel', 'level', 'externalId', 'status'],
                    },
                ],
            });
            return { msg: 'OK!', code: 200, info: get, success: true };
        } catch (error) {
            return { msg: 'Error al listar bodegas: ' + error, code: 400, success: false };
        }
    }

    async getWarehouse(data) {
        try {
            const external = data.external;
            const get = await warehouse.findOne({
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
                return { msg: 'BODEGA NO ENCONTRADA', code: 404, success: false };
            }
            return { msg: 'OK!', code: 200, info: get, success: true };
        } catch (error) {
            return { msg: 'Error al obtener bodega: ' + error, code: 400, success: false };
        }
    }

    async save(data, transaction) {
        try {
            const errors = validationResult(data.req);
            if (!errors.isEmpty()) {
                return { success: false, message: "DATOS NO ENCONTRADOS", code: 400 };
            }

            const warehouseData = {
                code: data.req.body.code,
                location: {
                    block: data.req.body.block,
                    roomNumber: data.req.body.roomNumber,
                    parallel: data.req.body.parallel,
                    level: data.req.body.level,
                },
            };

            await warehouse.create(warehouseData, { include: [{ model: models.location, as: "location" }] }, { transaction });
            return { success: true, message: "SE HA REGISTRADO LA BODEGA CON ÉXITO", code: 200 };
        } catch (error) {
            return { success: false, message: error.message, code: 500 };
        }
    }

    async update(data) {
        try {
            const warehouseAux = await warehouse.findOne({ where: { externalId: data.externalId } });

            if (!warehouseAux) {
                return { success: false, message: "NO EXISTE EL REGISTRO DE LA BODEGA", code: 400 };
            }

            const locationAux = await models.location.findOne({ where: { warehouseId: warehouseAux.id } });

            warehouseAux.code = data.code;
            warehouseAux.status = data.status;
            warehouseAux.externalId = uuid.v4();

            locationAux.block = data.block;
            locationAux.roomNumber = data.roomNumber;
            locationAux.parallel = data.parallel;
            locationAux.level = data.level;
            locationAux.status = data.status;
            locationAux.externalId = uuid.v4();

            await warehouseAux.save();
            await locationAux.save();

            return { success: true, message: "SE HAN ACTUALIZADO LOS DATOS DE LA BODEGA CON ÉXITO", code: 200 };
        } catch (error) {
            return { success: false, message: "Error en el servicio de actualizar bodega: " + error, code: 500 };
        }
    }
}

module.exports = WarehouseController;
