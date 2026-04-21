import cloudinary from '../config/cloudinary.js';

const checkStorageLimit = async (req, res, next) => {
    try {
        const usage = await cloudinary.api.usage();

        const usedBytes = usage.resources.storage.used;
        const limitBytes = usage.resources.storage.limit;

        const usagePercent = (usedBytes / limitBytes) * 100;  //calculate usage in percentage

        if (usagePercent > 95) {
            return res.status(507).json({       //insufficient storage status code
                error: "Insufficient Storage",
                message: "Please try again later."
            });
        }

        if (usagePercent > 90) {
            console.warn(`Global storage is at ${usagePercent.toFixed(2)}%`);
        }

        next();
    } catch (error) {
        console.error("Failed to check storage usage:", error);
        next();
    }
};

//maybe not apply first