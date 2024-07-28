const { sequelize } = require('../models');
const WarehouseController = require('../controls/WarehouseController');

const WarehouseFacade = {
    listWarehouses: async () => {
        const warehouseController = new WarehouseController();
        return await warehouseController.list();
    },

    getWarehouse: async (externalId) => {
        const warehouseController = new WarehouseController();
        console.log("3333", externalId);
        return await warehouseController.getWarehouse({ externalId: externalId });
    },

    createWarehouse: async (warehouseData) => {
        const transaction = await sequelize.transaction();
        try {
            const warehouseController = new WarehouseController();
            const response = await warehouseController.save({ req: warehouseData }, transaction);
            if (response.success) {
                await transaction.commit();
                return response;
            } else {
                await transaction.rollback();
                return response;
            }
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    updateWarehouse: async (warehouseData) => {
        const warehouseController = new WarehouseController();
        return await warehouseController.update(warehouseData);
    }
};

module.exports = WarehouseFacade;
