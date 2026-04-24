import cloudinary from '../config/cloudinary.js';

const checkStorageLimit = async (req, res, next) => {
    try {
        const usage = await cloudinary.api.usage();
        const usedBytes = usage.resources.storage.used;
        const limitBytes = usage.resources.storage.limit;

        const usagePercentage = (usedBytes / limitBytes) * 100;  //how much has been sued
        if (usagePercentage > 95) {
            return res.status(507).json({
                error: "Insufficient Storage",
                message: "Please try again later."
            });
        }
        if (usagePercentage > 90) {
            console.log(`Global storage is at ${usagePercentage.toFixed(2)}%`);
        }
        next();
    } catch (error) {
        console.error("Failed to check storage usage:", error);
        next();
    }
};

//maybe not apply first