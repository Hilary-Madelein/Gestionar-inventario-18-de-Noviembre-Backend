'use strict';
const { validationResult } = require('express-validator');
const models = require('../models');
const location = models.location;
const uuid = require('uuid');

class LocationController {

    async list() {
        try {
            const get = await location.findAll({
                attributes: ['block', 'roomNumber', 'parallel', 'level', 'externalId', 'status'],
            });
            return { msg: 'OK!', code: 200, info: get, success: true };
        } catch (error) {
            return { msg: 'Error al listar ubicaciones: ' + error, code: 400, success: false };
        }
    }

    async getLocation(data) {
        try {
            const external = data.externalId;
            let get = await location.findOne({
                where: { externalId: external },
                attributes: ['block', 'roomNumber', 'parallel', 'level', 'externalId', 'status'],
            });
            if (get === null) {
                get = {};
            }
            return { msg: 'OK!', code: 200, info: get, success: true };
        } catch (error) {
            return { msg: 'Error al obtener ubicación: ' + error, code: 400, success: false };
        }
    }

    async save(data, transaction) {
        try {
            const errors = validationResult(data.req);
            if (!errors.isEmpty()) {
                return { success: false, message: "DATOS NO ENCONTRADOS", code: 400 };
            }
    
            const locationData = {
                block: data.req.body.block,
                roomNumber: data.req.body.roomNumber,
                parallel: data.req.body.parallel,
                level: data.req.body.level,
                externalId: data.req.body.externalId,
                status: data.req.body.status,
            };
    
            await location.create(locationData, { transaction });
            return { success: true, message: "SE HA REGISTRADO LA UBICACIÓN CON ÉXITO", code: 200 };
        } catch (error) {
            return { success: false, message: error.message, code: 500 };
        }
    }

    async update(data) {
        try {
            const locationAux = await location.findOne({
                where: { externalId: data.externalId }
            });

            if (!locationAux) {
                return { success: false, message: "NO EXISTE EL REGISTRO DE LA UBICACIÓN", code: 400 };
            }

            locationAux.block = data.block;
            locationAux.roomNumber = data.roomNumber;
            locationAux.parallel = data.parallel;
            locationAux.level = data.level;
            locationAux.status = data.status;
            locationAux.externalId = uuid.v4();

            await locationAux.save();

            return { success: true, message: "SE HAN ACTUALIZADO LOS DATOS DE LA UBICACIÓN CON ÉXITO", code: 200 };
        } catch (error) {
            return { success: false, message: "Error en el servicio de actualizar ubicación: " + error, code: 500 };
        }
    }
}

module.exports = LocationController;
