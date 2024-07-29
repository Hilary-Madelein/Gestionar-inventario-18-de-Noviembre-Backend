'use strict';
const { validationResult } = require('express-validator');
const models = require('../models/');
const product = models.product;
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

class ProductController {

    async list() {
        try {
            const products = await product.findAll({
                attributes: ['id', 'name', 'photo', 'category', 'externalId', 'status'],
            });
            return { msg: 'OK!', code: 200, info: products, success: true };
        } catch (error) {
            return { msg: 'Error al listar productos: ' + error, code: 400, success: false };
        }
    }

    async getProduct(req) {
        try {
            const external = req.body.external;
            const productData = await product.findOne({
                where: { externalId: external },
                attributes: ['name', 'photo', 'category', 'externalId', 'status'],
            });
            if (!productData) {
                return { msg: 'PRODUCTO NO ENCONTRADO', code: 404, success: false };
            }
            return { msg: 'OK!', code: 200, info: productData, success: true };
        } catch (error) {
            return { msg: 'Error al obtener producto: ' + error, code: 400, success: false };
        }
    }

    async save(req, transaction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return { success: false, message: "DATOS NO ENCONTRADOS" };
            }

            const productData = {
                name: req.body.name,
                photo: req.file.filename,
                category: req.body.category,
                externalId: uuid.v4(),
                status: req.body.status,
            };

            await product.create(productData, { transaction });
            return { success: true };
        } catch (error) {
            if (req.file) {
                fs.unlinkSync(path.join(__dirname, '../public/images/products', req.file.filename));
            }
            return { success: false, message: error.message };
        }
    }

    async update(req, transaction) {
        try {
            const productAux = await product.findOne({
                where: { externalId: req.body.externalId }
            });

            if (!productAux) {
                return { msg: "NO EXISTE EL REGISTRO DEL PRODUCTO", code: 400, success: false };
            }

            let lastPhoto = productAux.photo;
            let newPhotoPath = '';

            if (req.file) {
                newPhotoPath = req.file.filename;
            }

            productAux.name = req.body.name;
            productAux.category = req.body.category;
            productAux.status = req.body.status;
            productAux.photo = newPhotoPath || lastPhoto;
            productAux.externalId = uuid.v4();

            await productAux.save({ transaction });

            if (lastPhoto && req.file) {
                const lastPhotoPath = path.join(__dirname, '../public/images/products/', lastPhoto);
                fs.unlinkSync(lastPhotoPath);
            }

            return { success: true };
        } catch (error) {
            if (req.file) {
                const newPhotoPath = path.join(__dirname, '../public/images/products/', req.file.filename);
                fs.unlinkSync(newPhotoPath);
            }
            return { msg: "Error en el servicio de actualizar producto: " + error, code: 400, success: false };
        }
    }
}

module.exports = ProductController;
