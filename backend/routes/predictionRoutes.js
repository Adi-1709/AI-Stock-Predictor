import express from 'express';
import axios from 'axios';

const router = express.Router();

// Public prediction route
router.get('/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;

        const response = await axios.get(
            `http://127.0.0.1:8000/predict?ticker=${ticker}`
        );

        res.status(200).json(response.data);

    } catch (error) {

        console.error(
            'Prediction Error:',
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                'Prediction failed'
        });
    }
});

export default router;