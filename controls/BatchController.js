'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
const batch = models.batch;
const product = models.product;
const uuid = require('uuid');

class BatchController {

    async list(req, res) {
        try {
            var get = await batch.findAll({
                where: { status: 1 },
                attributes: ['id', 'code', 'expirationDate', 'expiryDate', 'externalId', 'status'],
            });
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(400)
            res.json({ msg: 'Error al listar lotes' +error, code: 400, info: error });
        }
    }

    async getBatch(req, res) {
        try {
            const external = req.body.external;
            var get = await batch.findOne({
                where: { externalId: external },
                attributes: ['code', 'expirationDate', 'expiryDate', 'externalId', 'status'],
                include: [
                    {
                        model: product,
                        as: 'product',
                        attributes: [
                            'name', 
                            'category',
                            'status'
                        ],
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
            res.json({ msg: 'Error al obtener lote', code: 400, info: error });
        }
    }

    async save(data, transaction) {
        try {
            const batchData = {
                code: data.code,
                expirationDate: data.expirationDate,
                expiryDate: data.expiryDate
            };
    
            const batch = await models.batch.create(batchData, { transaction });
            return { success: true, batch };
        } catch (error) {
            console.error('Error al crear lote:', error);
            return { success: false, message: error.message };
        }
    }
    

    async update(req, res) {
        try {
            const batchAux = await batch.findOne({
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

            batchAux.code = req.body.code;
            batchAux.expirationDate = req.body.expirationDate;
            batchAux.expiryDate = req.body.expiryDate;
            batchAux.status = req.body.status;
            batchAux.externalId = uuid.v4();

            const result = await batchAux.save();

            if (!result) {
                return res.status(400).json({
                    msg: "NO SE HAN ACTUALIZADO LOS DATOS, INTENTE NUEVAMENTE",
                    code: 400
                });
            }

            return res.status(200).json({
                msg: "SE HAN ACTUALIZADO LOS DATOS DEL LOTE CON ÉXITO",
                code: 200
            });

        } catch (error) {
            return res.status(400).json({
                msg: "Error en el servicio de actualizar lote" + error,
                code: 400
            });
        }
    }
}
module.exports = BatchController;