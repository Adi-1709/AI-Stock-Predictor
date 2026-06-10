import { useStock } from '../context/StockContext';

export function useStockData() {
  const { currentStock, selectedStockSymbol, setSelectedStockSymbol, watchlist, addToWatchlist, removeFromWatchlist, getStockBySymbol, isLoading, dbConnected } = useStock();

  return {
    currentStock,
    selectedStockSymbol,
    setSelectedStockSymbol,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    getStockBySymbol,
    isLoading,
    dbConnected
  };
}

