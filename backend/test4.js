import yahooFinance2 from 'yahoo-finance2';
async function run() {
  try {
    const yf = new yahooFinance2();
    const result = await yf.quote('AAPL');
    console.log("Success:", result.regularMarketPrice);
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
