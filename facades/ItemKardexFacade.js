const { sequelize } = require('../models');
const ItemKardexController = require('../controls/ItemKardexController');

const ItemKardexFacade = {
    createItemKardexExternalInput: async (data) => {
        const transaction = await sequelize.transaction();
        try {
            const itemKardexController = new ItemKardexController();
            const response = await itemKardexController.createItemKardexExternalInput(data, transaction);
            if (response.success) {
                await transaction.commit();
                return { msg: 'MOVIMIENTO REGISTRADO CON ÉXITO', code: 200 };
            } else {
                await transaction.rollback();
                return { msg: response.message, code: 400 };
            }
        } catch (error) {
            if (transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
                await transaction.rollback();
            }
            return { msg: 'Error en la transacción: ' + error.message, code: 500 };
        }
    },

    createItemKardexExternalOutput: async (data) => {
        const transaction = await sequelize.transaction();
        try {
            const itemKardexController = new ItemKardexController();
            const response = await itemKardexController.createItemKardexExternalOutput(data, transaction);
            if (response.success) {
                await transaction.commit();
                return { msg: 'MOVIMIENTO REGISTRADO CON ÉXITO', code: 200 };
            } else {
                await transaction.rollback();
                return { msg: response.message, code: 400 };
            }
        } catch (error) {
            if (transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
                await transaction.rollback();
            }
            return { msg: 'Error en la transacción: ' + error.message, code: 500 };
        }
    },

    getInputs: async (data) => {
        const itemKardexController = new ItemKardexController();
        const response = await itemKardexController.getInputs(data);
        return response;
    },

    getOutputs: async (data) => {
        const itemKardexController = new ItemKardexController();
        const response = await itemKardexController.getOutputs(data);
        return response;
    },

    getQualityInputs: async (data) => {
        const itemKardexController = new ItemKardexController();
        const response = await itemKardexController.getQualityInputs(data);
        return response;
    },

    getExistence: async () => {
        const itemKardexController = new ItemKardexController();
        const response = await itemKardexController.getExistence();
        return response;
    }
};

module.exports = ItemKardexFacade;
