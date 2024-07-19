'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
const kardex = models.kardex;
const warehouse = models.warehouse;
const product = models.product;
const uuid = require('uuid');
const batch = require('../models/batch');

class KardexController {

    async list(req, res) {
        try {
            var get = await kardex.findAll({
                attributes: ['code', 'maximumStock', 'minimumStock', 'externalId', 'status'],
            });
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(400)
            res.json({ msg: 'Error al listar lotes' +error, code: 400, info: error });
        }
    }

    async getKardex(req, res) {
        try {
            const external = req.body.external;
            var get = await kardex.findOne({
                where: { externalId: external },
                attributes: ['code', 'maximumStock', 'minimumStock', 'externalId', 'status'],
            });
            if (get === null) {

                get = {};
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener kardex', code: 400, info: error });
        }
    }

    async save(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var warehouseId = req.body.external_warehouse;
            var productId = req.body.external_product;
            if (warehouseId != undefined && productId != undefined) {
                let warehouseAux = await warehouse.findOne({ where: { externalId: warehouseId } });
                let productAux = await product.findOne({ where: { externalId: productId } });
                
                if (req.body.minimumStock > req.body.maximumStock) {
                    return res.status(400).json({ msg: "La existencia mínima no puede ser mayor que la máxima", code: 400 });
                }
                
                if (warehouseAux && productAux) {
                    var data = {
                        code: req.body.code,
                        maximumStock: req.body.maximumStock,
                        minimumStock: req.body.minimumStock,
                        warehouseId: warehouseAux.id,
                        productId: productAux.id,
                    }

                    let transaction = await models.sequelize.transaction();
                    try {
                        await kardex.create(data);
                        await transaction.commit();
                        res.json({
                            msg: "KARDEX REGISTRADO CON ÉXITO",
                            code: 200
                        });

                    } catch (error) {
                        if (transaction) await transaction.rollback();
                        if (error.errors && error.errors[0].message) {
                            res.json({ msg: error.errors[0].message, code: 200 });
                        } else {
                            res.json({ msg: error.message, code: 200 });
                        }
                    }
                } else {
                    res.status(400);
                    res.json({ msg: "DATOS NO ENCONTRADOS", code: 400 });
                }

            } else {
                res.status(400);
                res.json({ msg: "FALTAN DATOS", code: 400 });
            }
        } else {
            res.status(400);
            res.json({ msg: "DATOS FALTANTES", code: 400, errors: errors });
        }
    }

    /*async update(req, res) {
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
    }*/
}
module.exports = KardexController;