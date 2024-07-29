'use strict';
const { validationResult } = require('express-validator');
const models = require('../models');
const kardex = models.kardex;
const warehouse = models.warehouse;
const product = models.product;
const uuid = require('uuid');

class KardexController {

    async list() {
        try {
            const get = await kardex.findAll({
                attributes: ['code', 'maximumStock', 'minimumStock', 'externalId', 'status'],
            });
            return { msg: 'OK!', code: 200, info: get, success: true };
        } catch (error) {
            return { msg: 'Error al listar lotes: ' + error, code: 400, success: false };
        }
    }

    async getKardexProduct(req) {
        try {
            const productId = req.body.productId;
            const warehouseId = req.body.warehouseId;
            
            let get = await kardex.findOne({
                where: { productId: productId, warehouseId: warehouseId },
                attributes: ['id','code', 'maximumStock', 'minimumStock', 'externalId', 'status'],
                include: [
                    {
                        model: product,
                        as: 'product',
                        attributes: ['name', 'category', 'status', 'photo'],
                    },
                ],
            });
            if (get === null) {
                return { msg: 'PRODUCTO SIN KARDEX, REGISTRE UN KARDEX', code: 404, success: false };
            }
            return { msg: 'OK!', code: 200, info: get, success: true };
        } catch (error) {
            return { msg: 'Error al obtener producto del kardex: ' + error, code: 400, success: false };
        }
    }

    async getKardex(req) {
        try {
            const external = req.body.externalId;
            let get = await kardex.findOne({
                where: { externalId: external },
                attributes: ['code', 'maximumStock', 'minimumStock', 'externalId', 'status'],
            });
            if (get === null) {
                return { msg: 'KARDEX NO ENCONTRADO', code: 404, success: false };
            }
            return { msg: 'OK!', code: 200, info: get, success: true };
        } catch (error) {
            return { msg: 'Error al obtener kardex: ' + error, code: 400, success: false };
        }
    }

    async save(data, transaction) {
        try {
            const warehouseAux = await warehouse.findOne({ where: { externalId: data.external_warehouse } });
            const productAux = await product.findOne({ where: { externalId: data.external_product } });

            if (data.minimumStock > data.maximumStock) {
                return { success: false, message: "La existencia mínima no puede ser mayor que la máxima" };
            }

            if (warehouseAux && productAux) {
                const kardexData = {
                    code: data.code,
                    maximumStock: data.maximumStock,
                    minimumStock: data.minimumStock,
                    warehouseId: warehouseAux.id,
                    productId: productAux.id,
                };

                await kardex.create(kardexData, { transaction });
                return { success: true };
            } else {
                return { success: false, message: "DATOS NO ENCONTRADOS" };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = KardexController;
