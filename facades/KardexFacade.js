const { sequelize } = require('../models');
const KardexController = require('../controls/KardexController');

const KardexFacade = {
    listKardex: async () => {
        const kardexController = new KardexController();
        const response = await kardexController.list();
        return response;
    },

    getKardex: async (externalId) => {
        const kardexController = new KardexController();
        const response = await kardexController.getKardex({ body: { externalId: externalId } });
        return response;
    },

    createKardex: async (kardexData) => {
        const transaction = await sequelize.transaction();
        try {
            const kardexController = new KardexController();
            const response = await kardexController.save(kardexData, transaction);
            if (response.success) {
                await transaction.commit();
                return { msg: 'KARDEX REGISTRADO CON ÉXITO', code: 200 };
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
    }
};

module.exports = KardexFacade;
