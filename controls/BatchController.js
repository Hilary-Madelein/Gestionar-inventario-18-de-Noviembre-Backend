'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
const batch = models.batch;
const product = models.product;
const uuid = require('uuid');

class BatchController {

    async list(req, res) {
        try {
            const get = await batch.findAll({
                where: { status: 1 },
                attributes: ['id', 'code', 'expirationDate', 'expiryDate', 'externalId', 'status', 'availableQuantity'],
            });
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(400).json({ msg: 'Error listing batches: ' + error, code: 400, info: error });
        }
    }

    async getBatch(req, res) {
        try {
            const external = req.body.external;
            const get = await batch.findOne({
                where: { externalId: external },
                attributes: ['code', 'expirationDate', 'expiryDate', 'externalId', 'status', 'availableQuantity'],
                include: [
                    {
                        model: product,
                        as: 'product',
                        attributes: ['name', 'category', 'status'],
                    },
                ],
            });
            if (get === null) {
                get = {};
            }
            res.status(200).json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(500).json({ msg: 'Error getting batch', code: 500, info: error });
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
            console.error('Error creating batch:', error);
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

            if (!batchAux) {
                return res.status(400).json({
                    msg: "Batch not found",
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
                    msg: "Failed to update batch, try again",
                    code: 400
                });
            }

            return res.status(200).json({
                msg: "Batch updated successfully",
                code: 200
            });

        } catch (error) {
            return res.status(400).json({
                msg: "Error updating batch: " + error,
                code: 400
            });
        }
    }
}
module.exports = BatchController;
