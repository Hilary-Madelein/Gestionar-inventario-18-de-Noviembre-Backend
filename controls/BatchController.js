'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
const bacth = models.bacth;
const product = models.product;
const uuid = require('uuid');
const batch = require('../models/batch');

class BatchController {

    async list(req, res) {
        try {
            var get = await bacth.findAll({
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
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(400)
            res.json({ msg: 'Error al listar lotes' +error, code: 400, info: error });
        }
    }

    async getBatch(req, res) {
        try {
            const external = req.body.external;
            var get = await bacth.findOne({
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

    async save(req, res) {
        try {
            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ msg: "DATOS NO ENCONTRADOS", code: 400 });
            }
    
            var data = {
                code: req.body.code,
                expirationDate: req.body.expirationDate, 
                expiryDate: req.body.expiryDate,
            };
    
            let transaction = await models.sequelize.transaction();
            try {
                await batch.create(data, { transaction });
                await transaction.commit();
                res.json({
                    msg: "SE HA REGISTRADO EL LOTE CON ÉXITO",
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
                msg: "Se produjo un error al registrar el lote: " + error,
                code: 400
            });
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