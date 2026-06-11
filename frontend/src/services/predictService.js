import api from './api';

export const predictStock = async (ticker) => {
  try {
    const response = await api.get(
      `/predict/${ticker}`
    );

    return response.data;

  } catch (error) {
    console.error(
      'Prediction error:',
      error
    );

    throw error;
  }
};

export const getStockHistory = async (
  ticker,
  period = '1y'
) => {
  try {
    const response = await api.get(
      `/predict/history/${ticker}?period=${period}`
    );

    return response.data;

  } catch (error) {
    console.error(
      'History error:',
      error
    );

    throw error;
  }
};

export const getStockNews = async (
  ticker
) => {
  try {
    const response = await api.get(
      `/predict/news/${ticker}`
    );

    return response.data;

  } catch (error) {
    console.error(
      'News error:',
      error
    );

    throw error;
  }
};
