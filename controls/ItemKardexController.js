'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
const kardex = models.kardex;
const itemKardex = models.itemKardex;
const batch = models.batch;
const BatchController = require('./BatchController');
var batchController = new BatchController();

class itemKardexController {

    async getExistence(req, res) {
        try {
            var get = await itemKardex.findOne({
                attributes: ['existence'],
                order: [['createdAt', 'DESC']],  // Ordenar por fecha de creación de manera descendente
                limit: 1  // Limita a solo el primer resultado, que será el más reciente
            });
    
            if (get === null) {
                get = {};
            }
    
            console.log("ddd", get);
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });
    
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener lote' + error, code: 400, info: error });
        }
    }
    

    async getQualityInputs(req, res) {
        try {
            const idBatch = req.body.idBatch;
            var get = await itemKardex.findOne({
                where: { batchId: idBatch, movementType: "ENTRADA EXTERNA" },
                attributes: ['quantity'],
            });
            if (get === null) {

                get = {};
            }
            console.log("ddd", get);
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });

        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener lote' + error, code: 400, info: error });
        }
    }

    async getInputs(req, res) {
        try {
            const idKardex = req.body.idKardex;
            var get = await itemKardex.findAll({
                where: { kardexId: idKardex, movementType: "ENTRADA EXTERNA" },
                attributes: ['date', 'detail', 'quantity', 'existence', 'status', 'movementType'],
                include: [
                    {
                        model: batch,
                        as: 'batch',
                        attributes: [
                            'code',
                            'expirationDate',
                            'expiryDate'
                        ],
                    },
                ],
            });
            if (get === null) {

                get = {};
            }
            console.log("ddd", get);
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });

        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener lote' + error, code: 400, info: error });
        }
    }

    async getOutputs(req, res) {
        try {
            const idKardex = req.body.idKardex;
            var get = await itemKardex.findAll({
                where: { kardexId: idKardex, movementType: "SALIDA EXTERNA" },
                attributes: ['date', 'detail', 'quantity', 'existence', 'status', 'movementType'],
                include: [
                    {
                        model: batch,
                        as: 'batch',
                        attributes: [
                            'code',
                            'expirationDate',
                            'expiryDate'
                        ],
                    },
                ],
            });
            if (get === null) {

                get = {};
            }
            console.log("ddd", get);
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });

        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener lote' + error, code: 400, info: error });
        }
    }

    async createItemKardexExternalInput(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            const kardexId = req.body.external_kardex;
            if (kardexId) {
                const kardexAux = await models.kardex.findOne({ where: { externalId: kardexId } });

                if (req.body.quantity <= 0) {
                    return res.status(400).json({
                        msg: "LA CANTIDAD DEBE SER UN VALOR MAYOR A CERO",
                        code: 400
                    });
                }

                if (kardexAux) {
                    const transaction = await models.sequelize.transaction();
                    try {
                        const batchResult = await batchController.save({
                            code: req.body.code,
                            expirationDate: req.body.expirationDate,
                            expiryDate: req.body.expiryDate
                        }, transaction);

                        if (!batchResult.success) {
                            await transaction.rollback();
                            return res.status(400).json({ msg: "Error al crear lote", error: batchResult.message });
                        }

                        const lastItemKardex = await models.itemKardex.findOne({
                            where: { kardexId: kardexAux.id },
                            order: [['createdAt', 'DESC']],
                            transaction
                        });

                        const newExistence = lastItemKardex ? lastItemKardex.existence + req.body.quantity : req.body.quantity;

                        const newItemKardexData = {
                            kardexId: kardexAux.id,
                            date: new Date(),
                            detail: req.body.detail,
                            quantity: req.body.quantity,
                            existence: newExistence,
                            movementType: req.body.movementType,
                            status: true,
                            originWarehouseId: "NOTA ENTREGA PROVEEDOR EXTERNO", // Fijo para entradas externas
                            destinationWarehouseId: req.body.destinationWarehouseId,
                            batchId: batchResult.batch.id
                        };

                        await models.itemKardex.create(newItemKardexData, { transaction });

                        await transaction.commit();
                        return res.json({
                            msg: "TRANSACCIÓN REALIZADA CON ÉXITO",
                            code: 200
                        });

                    } catch (error) {
                        await transaction.rollback();
                        return res.status(500).json({
                            msg: "Error en la transacción",
                            code: 500,
                            error: error.message
                        });
                    }
                } else {
                    return res.status(404).json({ msg: "DATOS DE KARDEX NO ENCONTRADOS", code: 404 });
                }
            } else {
                return res.status(400).json({ msg: "FALTAN DATOS DEL KARDEX EXTERNO", code: 400 });
            }
        } else {
            return res.status(400).json({
                msg: "DATOS FALTANTES O INCORRECTOS",
                code: 400,
                errors: errors.array()
            });
        }
    }

    async createItemKardexExternalOutput(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            const kardexId = req.body.external_kardex;
            if (kardexId) {
                const kardexAux = await models.kardex.findOne({ where: { externalId: kardexId } });

                if (req.body.quantity <= 0) {
                    return res.status(400).json({
                        msg: "LA CANTIDAD DEBE SER UN VALOR MAYOR A CERO",
                        code: 400
                    });
                }

                if (kardexAux) {
                    const transaction = await models.sequelize.transaction();
                    try {
                        const lastItemKardex = await models.itemKardex.findOne({
                            where: { kardexId: kardexAux.id },
                            order: [['createdAt', 'DESC']],
                            transaction
                        });

                        if (lastItemKardex && (lastItemKardex.existence - req.body.quantity) < 0) {
                            await transaction.rollback();
                            return res.status(400).json({
                                msg: "NO HAY SUFICIENTE EXISTENCIA DISPONIBLE PARA LA SALIDA",
                                code: 400
                            });
                        }

                        const newExistence = lastItemKardex ? lastItemKardex.existence - req.body.quantity : -req.body.quantity;

                        const newItemKardexData = {
                            kardexId: kardexAux.id,
                            date: new Date(),
                            detail: req.body.detail,
                            quantity: -req.body.quantity, // Negativo porque es una salida
                            existence: newExistence,
                            movementType: req.body.movementType,
                            originWarehouseId: req.body.originWarehouseId,
                            destinationWarehouseId: "SALIDA ESTUDIANTE", // Fijo para salidas externas
                            batchId: req.body.batchId
                        };

                        // Actualizar el estado del lote
                        const batch = await models.batch.findByPk(req.body.batchId, { transaction });
                        if (batch) {
                            batch.status = 0;
                            await batch.save({ transaction });
                        }

                        await models.itemKardex.create(newItemKardexData, { transaction });

                        await transaction.commit();
                        return res.json({
                            msg: "TRANSACCIÓN REALIZADA CON ÉXITO",
                            code: 200
                        });

                    } catch (error) {
                        await transaction.rollback();
                        return res.status(500).json({
                            msg: "Error en la transacción" + error,
                            code: 500,
                            error: error.message
                        });
                    }
                } else {
                    return res.status(404).json({ msg: "DATOS DE KARDEX NO ENCONTRADOS", code: 404 });
                }
            } else {
                return res.status(400).json({ msg: "FALTAN DATOS DEL KARDEX EXTERNO", code: 400 });
            }
        } else {
            return res.status(400).json({
                msg: "DATOS FALTANTES O INCORRECTOS",
                code: 400,
                errors: errors.array()
            });
        }
    }

}

module.exports = itemKardexController;
