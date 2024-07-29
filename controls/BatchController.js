'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
const batch = models.batch;
const product = models.product;
const uuid = require('uuid');

class BatchController {

    async list() {
        try {
            const get = await batch.findAll({
                where: { status: 1 },
                attributes: ['id', 'code', 'expirationDate', 'expiryDate', 'externalId', 'status', 'availableQuantity'],
            });
            return { msg: 'OK!', code: 200, info: get };
        } catch (error) {
            return { msg: 'Error al listar lotes: ' + error, code: 400, info: error };
        }
    }

    async getBatch(req) {
        try {
            const external = req.body.externalId;
            let get = await batch.findOne({
                where: { externalId: external },
                attributes: ['code', 'expirationDate', 'expiryDate', 'externalId', 'status'],
            });
            if (get === null) {
                get = {};
            }
            return { msg: 'OK!', code: 200, info: get };
        } catch (error) {
            return { msg: 'Error al obtener lote: ' + error, code: 400, info: error };
        }
    }

    async save(data, transaction) {
        try {
            const batchData = {
                code: data.code,
                expirationDate: data.expirationDate,
                expiryDate: data.expiryDate,
                availableQuantity: data.quantity
            };

            const newBatch = await models.batch.create(batchData, { transaction });
            return { success: true, batch: newBatch };
        } catch (error) {
            console.error('Error al crear lote:', error);
            return { success: false, message: error.message };
        }
    }

    async update(req) {
        try {
            const batchAux = await batch.findOne({
                where: {
                    externalId: req.body.externalId
                }
            });

            if (!batchAux) {
                return { msg: "NO EXISTE EL REGISTRO DEL LOTE", code: 400 };
            }

            batchAux.code = req.body.code;
            batchAux.expirationDate = req.body.expirationDate;
            batchAux.expiryDate = req.body.expiryDate;
            batchAux.status = req.body.status;
            batchAux.externalId = uuid.v4();

            const result = await batchAux.save();

            if (!result) {
                return { msg: "NO SE HAN ACTUALIZADO LOS DATOS, INTENTE NUEVAMENTE", code: 400 };
            }

            return { msg: "SE HAN ACTUALIZADO LOS DATOS DEL LOTE CON ÉXITO", code: 200 };

        } catch (error) {
            return { msg: "Error en el servicio de actualizar lote: " + error, code: 400 };
        }
    }
}

module.exports = BatchController;
