'use strict';
const { validationResult } = require('express-validator');
const models = require('../models');
const itemKardex = models.itemKardex;
const batch = models.batch;
const BatchController = require('./BatchController');
const batchController = new BatchController();

class ItemKardexController {

    async getExistence() {
        try {
            const get = await itemKardex.findOne({
                attributes: ['existence'],
                order: [['createdAt', 'DESC']],  // Ordenar por fecha de creación de manera descendente
                limit: 1  // Limita a solo el primer resultado, que será el más reciente
            });
    
            if (get === null) {
                return { msg: 'EXISTENCIA NO ENCONTRADA', code: 404, success: false, info: {} };
            }
    
            return { msg: 'EXISTENCIA OBTENIDA CON ÉXITO', code: 200, success: true, info: get };
    
        } catch (error) {
            return { msg: 'Error al obtener existencia: ' + error, code: 400, success: false };
        }
    }

    async getQualityInputs(data) {
        try {
            const idBatch = data.idBatch;
            const get = await itemKardex.findOne({
                where: { batchId: idBatch, movementType: "ENTRADA EXTERNA" },
                attributes: ['quantity'],
            });
            if (get === null) {
                return { msg: 'CANTIDAD NO ENCONTRADA', code: 404, success: false, info: {} };
            }
            return { msg: 'CANTIDAD OBTENIDA CON ÉXITO', code: 200, success: true, info: get };
        } catch (error) {
            return { msg: 'Error al obtener cantidad: ' + error, code: 400, success: false };
        }
    }

    async getInputs(data) {
        try {
            const idKardex = data.idKardex;
            const get = await itemKardex.findAll({
                where: { kardexId: idKardex, movementType: "ENTRADA EXTERNA" },
                attributes: ['date', 'detail', 'quantity', 'existence', 'status', 'movementType'],
                include: [
                    {
                        model: batch,
                        as: 'batch',
                        attributes: ['code', 'expirationDate', 'expiryDate'],
                    },
                ],
            });
            if (get === null) {
                return { msg: 'ENTRADAS NO ENCONTRADAS', code: 404, success: false, info: {} };
            }
            return { msg: 'ENTRADAS OBTENIDAS CON ÉXITO', code: 200, success: true, info: get };
        } catch (error) {
            return { msg: 'Error al obtener entradas: ' + error, code: 400, success: false };
        }
    }

    async getOutputs(data) {
        try {
            const idKardex = data.idKardex;
            const get = await itemKardex.findAll({
                where: { kardexId: idKardex, movementType: "SALIDA EXTERNA" },
                attributes: ['date', 'detail', 'quantity', 'existence', 'status', 'movementType'],
                include: [
                    {
                        model: batch,
                        as: 'batch',
                        attributes: ['code', 'expirationDate', 'expiryDate'],
                    },
                ],
            });
            if (get === null) {
                return { msg: 'SALIDAS NO ENCONTRADAS', code: 404, success: false, info: {} };
            }
            return { msg: 'SALIDAS OBTENIDAS CON ÉXITO', code: 200, success: true, info: get };
        } catch (error) {
            return { msg: 'Error al obtener salidas: ' + error, code: 400, success: false };
        }
    }

    async createItemKardexExternalInput(data, transaction) {
        try {
            const kardexAux = await models.kardex.findOne({ where: { externalId: data.external_kardex } });

            if (data.quantity <= 0) {
                return { success: false, message: "LA CANTIDAD DEBE SER UN VALOR MAYOR A CERO", code: 400 };
            }

            if (kardexAux) {
                const batchResult = await batchController.save({
                    code: data.code,
                    expirationDate: data.expirationDate,
                    expiryDate: data.expiryDate,
                    quantity: data.quantity
                }, transaction);

                if (!batchResult.success) {
                    return { success: false, message: "Error al crear lote: " + batchResult.message, code: 400 };
                }

                const lastItemKardex = await models.itemKardex.findOne({
                    where: { kardexId: kardexAux.id },
                    order: [['createdAt', 'DESC']],
                    transaction
                });

                const newExistence = lastItemKardex ? lastItemKardex.existence + data.quantity : data.quantity;

                const newItemKardexData = {
                    kardexId: kardexAux.id,
                    date: new Date(),
                    detail: data.detail,
                    quantity: data.quantity,
                    existence: newExistence,
                    movementType: data.movementType,
                    status: true,
                    originWarehouseId: "NOTA ENTREGA PROVEEDOR EXTERNO",
                    destinationWarehouseId: data.destinationWarehouseId,
                    batchId: batchResult.batch.id
                };

                await models.itemKardex.create(newItemKardexData, { transaction });
                return { success: true, message: "KARDEX REGISTRADO CON ÉXITO", code: 200 };
            } else {
                return { success: false, message: "DATOS DE KARDEX NO ENCONTRADOS", code: 404 };
            }
        } catch (error) {
            return { success: false, message: "Error en la transacción: " + error.message, code: 500 };
        }
    }

    async createItemKardexExternalOutput(data, transaction) {
        try {
            const kardexAux = await models.kardex.findOne({ where: { externalId: data.external_kardex } });

            if (data.quantity <= 0) {
                return { success: false, message: "LA CANTIDAD DEBE SER MAYOR QUE CERO", code: 400 };
            }

            if (kardexAux) {
                const batchData = await models.batch.findByPk(data.batchId, { transaction });

                if (!batchData) {
                    return { success: false, message: "LOTE NO ENCONTRADO", code: 404 };
                }

                if (batchData.availableQuantity < data.quantity) {
                    return { success: false, message: "STOCK INSUFICIENTE DISPONIBLE PARA EL LOTE", code: 400 };
                }

                const lastItemKardex = await models.itemKardex.findOne({
                    where: { kardexId: kardexAux.id },
                    order: [['createdAt', 'DESC']],
                    transaction
                });

                const newExistence = lastItemKardex ? lastItemKardex.existence - data.quantity : -data.quantity;

                const newItemKardexData = {
                    kardexId: kardexAux.id,
                    date: new Date(),
                    detail: data.detail,
                    quantity: -data.quantity, // Negativo porque es una salida
                    existence: newExistence,
                    movementType: data.movementType,
                    originWarehouseId: data.originWarehouseId,
                    destinationWarehouseId: "SALIDA ESTUDIANTE",
                    batchId: data.batchId
                };

                await models.itemKardex.create(newItemKardexData, { transaction });

                batchData.availableQuantity -= data.quantity;
                if (batchData.availableQuantity <= 0) {
                    batchData.status = 0;
                }

                await batchData.save({ transaction });
                return { success: true, message: "KARDEX REGISTRADO CON ÉXITO", code: 200 };
            } else {
                return { success: false, message: "DATOS DE KARDEX NO ENCONTRADOS", code: 404 };
            }
        } catch (error) {
            return { success: false, message: "Error en la transacción: " + error.message, code: 500 };
        }
    }
}

module.exports = ItemKardexController;
