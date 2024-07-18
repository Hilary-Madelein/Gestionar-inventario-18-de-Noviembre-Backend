'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models/');
const product = models.product;
const saltRounds = 8;
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

class ProductController {

    async list(req, res) {
        try {
            var get = await product.findAll({
                attributes: ['name', 'photo', 'category', 'externalId', 'status'],
            });
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(500)
            res.json({ msg: 'Error al listar productos' +error, code: 500, info: error });
        }
    }

    async getProduct(req, res) {
        try {
            const external = req.body.external;
            var get = await product.findOne({
                where: { externalId: external },
                attributes: ['name', 'photo', 'category', 'externalId', 'status'],
            });
            if (get === null) {

                get = {};
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: get });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al obtener producto', code: 500, info: error });
        }
    }

    async save(req, res) {
        try {
            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ msg: "DATOS NO ENCONTRADOS", code: 400 });
            }
    
            var data = {
                name: req.body.name,
                photo: req.file.filename, 
                category: req.body.category,
                externalId: req.body.externalId,
                status: req.body.status,
            };
    
            let transaction = await models.sequelize.transaction();
            try {
                await product.create(data, { transaction });
                await transaction.commit();
                res.json({
                    msg: "SE HA REGISTRADO EL PRODUCTO CON ÉXITO",
                    code: 200
                });
            } catch (error) {
                await transaction.rollback();
                fs.unlinkSync(path.join(__dirname, '../public/images/products', req.file.filename)); // Borrar el archivo si falla la transacción
                res.status(500).json({ msg: "Error al crear el producto: " + error.message, code: 500 });
            }
        } catch (error) {
            res.status(500).json({
                msg: "Se produjo un error al registrar el producto: " + error,
                code: 500
            });
        }
    }

    async update(req, res) {
        try {
            const productAux = await product.findOne({
                where: {
                    externalId: req.body.externalId
                }
            });

            if (!productAux) {
                return res.status(400).json({
                    msg: "NO EXISTE EL REGISTRO DEL PRODUCTO",
                    code: 400
                });
            }

            let lastPhoto = productAux.foto;
            let newPhotoPath = '';

            if (req.file) {                
                // Actualizar el nombre de la imagen con el nombre de la nueva imagen cargada
                newPhotoPath = req.file.filename;
            }

            productAux.name = req.body.name;
            productAux.category = req.body.category;
            productAux.status = req.body.status;
            productAux.photo = newPhotoPath;
            productAux.externalId = uuid.v4();

            const result = await productAux.save();

            if (lastPhoto && req.file) {
                const lastPhotoPath = path.join(__dirname, '../public/images/products/', lastPhoto);
                fs.unlinkSync(lastPhotoPath);  // Elimina la foto antigua
            }

            if (!result) {
                return res.status(400).json({
                    msg: "NO SE HAN ACTUALIZADO LOS DATOS, INTENTE NUEVAMENTE",
                    code: 400
                });
            }

            return res.status(200).json({
                msg: "SE HAN ACTUALIZADO LOS DATOS DEL PRODUCTO CON ÉXITO",
                code: 200
            });

        } catch (error) {
            if (req.file) { 
                const newPhotoPath = path.join(__dirname, '../public/images/products/', req.file.filename);
                fs.unlinkSync(newPhotoPath);
            }
            return res.status(400).json({
                msg: "Error en el servicio de actualizar producto" + error,
                code: 400
            });
        }
    }
}
module.exports = ProductController;