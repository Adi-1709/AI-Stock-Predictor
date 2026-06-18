import yahooFinance2 from 'yahoo-finance2';
const yahooFinance = new yahooFinance2();

async function run() {
  const symbol = 'AAPL';
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  const end = new Date();
  
  const queryOptions = { period1: start, period2: end, interval: '1d' };
  
  try {
    const result = await yahooFinance.chart(symbol, queryOptions);
    console.log("Chart success. Length:", result.quotes.length);
    console.log(result.quotes[0]);
  } catch (e) {
    console.error("Chart failed:", e.message);
  }
}
run();
