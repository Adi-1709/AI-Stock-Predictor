import yahooFinance2 from 'yahoo-finance2';
const yahooFinance = new yahooFinance2();

async function run() {
  const symbol = 'AAPL';
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  const queryOptions = { period1: start, interval: '1d' };
  
  try {
    const result = await yahooFinance.historical(symbol, queryOptions);
    console.log("History success. Length:", result.length);
  } catch (e) {
    console.error("History failed:", e.message);
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    console.log("Quote success. Price:", quote.regularMarketPrice);
  } catch(e) {
    console.error("Quote failed:", e.message);
  }
}
run();
