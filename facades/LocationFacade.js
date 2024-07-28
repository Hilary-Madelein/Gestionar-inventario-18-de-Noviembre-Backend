const { sequelize } = require('../models');
const LocationController = require('../controls/LocationController');

const LocationFacade = {
    listLocations: async () => {
        const locationController = new LocationController();
        return await locationController.list();
    },

    getLocation: async (externalId) => {
        const locationController = new LocationController();
        return await locationController.getLocation({ external: externalId });
    },

    createLocation: async (locationData) => {
        const transaction = await sequelize.transaction();
        try {
            const locationController = new LocationController();
            const response = await locationController.save({ req: locationData }, transaction);
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

    updateLocation: async (locationData) => {
        const locationController = new LocationController();
        return await locationController.update(locationData);
    }
};

module.exports = LocationFacade;
