const {
    getPrediction
} = require(
    "../services/predictionService"
);

const predictStock = async (
    req,
    res
) => {

    try {

        const { ticker } =
            req.params;

        const prediction =
            await getPrediction(
                ticker
            );

        res.status(200).json(
            prediction
        );

    } catch (error) {

        res.status(500).json({
            message:
                "Prediction failed"
        });

    }
};

module.exports = {
    predictStock
};