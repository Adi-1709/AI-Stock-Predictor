import axios from "axios";

const API_URL = "http://localhost:8000";

export const predictStock = async (ticker) => {
    try {
        const response = await axios.get(
            `${API_URL}/predict/${ticker}`
        );

        return response.data;

    } catch (error) {
        console.error(
            "Prediction error:",
            error
        );

        throw error;
    }
};