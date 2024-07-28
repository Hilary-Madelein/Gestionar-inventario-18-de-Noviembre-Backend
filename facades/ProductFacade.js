const { sequelize } = require('../models');
const ProductController = require('../controls/ProductController');

const ProductFacade = {
    listProducts: async () => {
        const productController = new ProductController();
        return await productController.list();
    },

    getProduct: async (externalId) => {
        const productController = new ProductController();
        return await productController.getProduct({ body: { external: externalId } });
    },

    createProduct: async (req) => {
        const transaction = await sequelize.transaction();
        try {
            const productController = new ProductController();
            const response = await productController.save(req, transaction);
            if (response.success) {
                await transaction.commit();
                return { msg: 'SE HA REGISTRADO EL PRODUCTO CON ÉXITO', code: 200 };
            } else {
                await transaction.rollback();
                throw new Error(response.message);
            }
        } catch (error) {
            if (!transaction.finished) {
                await transaction.rollback();
            }
            throw error;
        }
    },

    updateProduct: async (req) => {
        const transaction = await sequelize.transaction();
        try {
            const productController = new ProductController();
            const response = await productController.update(req, transaction);
            if (response.success) {
                await transaction.commit();
                return { msg: 'SE HAN ACTUALIZADO LOS DATOS DEL PRODUCTO CON ÉXITO', code: 200 };
            } else {
                await transaction.rollback();
                throw new Error(response.message);
            }
        } catch (error) {
            if (!transaction.finished) {
                await transaction.rollback();
            }
            throw error;
        }
    }
};

module.exports = ProductFacade;
