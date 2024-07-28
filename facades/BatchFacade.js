const { sequelize } = require('../models');
const BatchController = require('../controls/BatchController');

const BatchFacade = {
    listBatches: async () => {
        const batchController = new BatchController();
        const response = await batchController.list();
        return response;
    },

    getBatch: async (externalId) => {
        const batchController = new BatchController();
        const response = await batchController.getBatch({ body: { external: externalId } });
        return response;
    },

    createBatch: async (batchData) => {
        const transaction = await sequelize.transaction();
        try {
            const batchController = new BatchController();
            const response = await batchController.save(batchData, transaction);
            if (response.success) {
                await transaction.commit();
                return response.batch;
            } else {
                await transaction.rollback();
                throw new Error(response.message);
            }
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    updateBatch: async (batchData) => {
        const batchController = new BatchController();
        const response = await batchController.update({ body: batchData });
        return response;
    }
};

module.exports = BatchFacade;
