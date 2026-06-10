from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import ta
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

import os

# ==================================
# Load ML Files (Resolved Dynamic Absolute Paths for Production)
# ==================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "stock_prediction_model.pkl"))
features = joblib.load(os.path.join(BASE_DIR, "feature_columns.pkl"))
encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))

print("✅ Model loaded successfully")


# ==================================
# Feature Engineering
# ==================================

def calculate_features(stock):

    # Fix multidimensional columns
    if isinstance(stock.columns, pd.MultiIndex):
        stock.columns = stock.columns.get_level_values(0)

    # Convert to 1D Series
    stock["Close"] = stock["Close"].squeeze()
    stock["High"] = stock["High"].squeeze()
    stock["Low"] = stock["Low"].squeeze()
    stock["Volume"] = stock["Volume"].squeeze()

    # Moving averages
    stock["MA5"] = stock["Close"].rolling(5).mean()
    stock["MA20"] = stock["Close"].rolling(20).mean()

    # Exponential moving averages
    stock["EMA20"] = stock["Close"].ewm(span=20).mean()
    stock["EMA50"] = stock["Close"].ewm(span=50).mean()
    stock["EMA200"] = stock["Close"].ewm(span=200).mean()

    # RSI
    stock["RSI"] = ta.momentum.RSIIndicator(
        close=stock["Close"]
    ).rsi()

    # MACD
    macd = ta.trend.MACD(close=stock["Close"])

    stock["MACD"] = macd.macd()
    stock["MACD_SIGNAL"] = macd.macd_signal()

    # ADX
    adx = ta.trend.ADXIndicator(
        high=stock["High"],
        low=stock["Low"],
        close=stock["Close"]
    )

    stock["ADX"] = adx.adx()

    # ATR
    atr = ta.volatility.AverageTrueRange(
        high=stock["High"],
        low=stock["Low"],
        close=stock["Close"]
    )

    stock["ATR"] = atr.average_true_range()

    # Momentum
    stock["Momentum"] = (
        stock["Close"] - stock["Close"].shift(10)
    )

    # Williams %R
    wr = ta.momentum.WilliamsRIndicator(
        high=stock["High"],
        low=stock["Low"],
        close=stock["Close"]
    )

    stock["Williams_R"] = wr.williams_r()

    # Volume Change
    stock["Volume_Change"] = (
        stock["Volume"].pct_change()
    )

    stock.dropna(inplace=True)

    return stock


# ==================================
# Home Route
# ==================================

@app.route("/")
def home():

    return jsonify({
        "message": "AI Stock Predictor API Running 🚀"
    })


# ==================================
# Prediction Route
# ==================================

@app.route("/predict")
@app.route("/predict/<ticker>")
def predict_stock(ticker=None):

    try:
        # Get ticker from query params if not in path
        if not ticker:
            ticker = request.args.get('ticker')
            
        if not ticker:
            return jsonify({
                "error": "Ticker symbol is required"
            }), 400

        # Download stock data
        stock = yf.download(
            ticker,
            period="1y",
            auto_adjust=False,
            progress=False
        )

        # Fix MultiIndex columns
        if isinstance(stock.columns, pd.MultiIndex):
            stock.columns = stock.columns.get_level_values(0)

        # Keep only needed columns
        stock = stock[
            ['Open', 'High', 'Low', 'Close', 'Volume']
        ].copy()

        # Convert columns to proper 1D values
        stock['Open'] = stock['Open'].astype(float)
        stock['High'] = stock['High'].astype(float)
        stock['Low'] = stock['Low'].astype(float)
        stock['Close'] = stock['Close'].astype(float)
        stock['Volume'] = stock['Volume'].astype(float)

        print(stock.tail())
        print(stock.columns)

        if stock.empty:
            return jsonify({
                "error": "Invalid ticker"
            }), 404

        # Calculate indicators
        stock = calculate_features(stock)

        latest = stock.iloc[-1]

        # Model input
        input_data = pd.DataFrame([[
            latest["Close"],
            latest["Volume"],
            latest["MA5"],
            latest["MA20"],
            latest["EMA20"],
            latest["EMA50"],
            latest["EMA200"],
            latest["RSI"],
            latest["MACD"],
            latest["MACD_SIGNAL"],
            latest["ADX"],
            latest["ATR"],
            latest["Momentum"],
            latest["Williams_R"],
            latest["Volume_Change"]
        ]], columns=features)

        # Prediction
        prediction = model.predict(input_data)[0]

        probabilities = model.predict_proba(
            input_data
        )[0]

        confidence = max(probabilities) * 100

        signal = encoder.inverse_transform(
            [prediction]
        )[0]

        return jsonify({

            "ticker": ticker.upper(),

            "prediction": signal,

            "confidence": round(
                confidence,
                2
            ),

            "price": round(
                float(latest["Close"]),
                2
            ),

            "rsi": round(
                float(latest["RSI"]),
                2
            ),

            "macd": round(
                float(latest["MACD"]),
                2
            ),

            "technical_signal": (
                "Bullish"
                if latest["RSI"] > 60
                else "Bearish"
                if latest["RSI"] < 40
                else "Neutral"
            ),

            "market_sentiment": (
                "Positive"
                if signal == "BUY"
                else "Negative"
                if signal == "SELL"
                else "Neutral"
            ),

            "features": {
                "Close": float(latest["Close"]),
                "Volume": int(latest["Volume"]),
                "MA5": float(latest["MA5"]),
                "MA20": float(latest["MA20"]),
                "EMA20": float(latest["EMA20"]),
                "EMA50": float(latest["EMA50"]),
                "EMA200": float(latest["EMA200"]),
                "RSI": float(latest["RSI"]),
                "MACD": float(latest["MACD"]),
                "MACD_SIGNAL": float(latest["MACD_SIGNAL"]),
                "ADX": float(latest["ADX"]),
                "ATR": float(latest["ATR"]),
                "Momentum": float(latest["Momentum"]),
                "Williams_R": float(latest["Williams_R"]),
                "Volume_Change": float(latest["Volume_Change"])
            }
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==================================
# History Route
# ==================================

@app.route("/history/<ticker>")
def get_ticker_history(ticker):
    try:
        # Get query parameters
        period = request.args.get('period', '1y')  # 1d, 5d, 1mo, 6mo, 1y, max
        
        # Validate and map period/interval
        period_map = {
            '1d': ('1d', '5m'),
            '5d': ('5d', '15m'),
            '1mo': ('1mo', '1d'),
            '6mo': ('6mo', '1d'),
            '1y': ('1y', '1d'),
            'max': ('max', '1wk')
        }
        
        yf_period, yf_interval = period_map.get(period.lower(), ('1y', '1d'))
        
        stock = yf.download(
            ticker,
            period=yf_period,
            interval=yf_interval,
            auto_adjust=False,
            progress=False
        )
        
        if stock.empty:
            return jsonify({"error": f"No history found for ticker {ticker}"}), 404
            
        # Fix MultiIndex columns if present
        if isinstance(stock.columns, pd.MultiIndex):
            stock.columns = stock.columns.get_level_values(0)
            
        # Generate JSON response list
        history_list = []
        for index, row in stock.iterrows():
            if yf_interval in ['5m', '15m']:
                date_str = index.strftime('%Y-%m-%d %H:%M')
            else:
                date_str = index.strftime('%Y-%m-%d')
                
            history_list.append({
                "date": date_str,
                "open": round(float(row['Open']), 2) if not pd.isna(row['Open']) else None,
                "high": round(float(row['High']), 2) if not pd.isna(row['High']) else None,
                "low": round(float(row['Low']), 2) if not pd.isna(row['Low']) else None,
                "close": round(float(row['Close']), 2) if not pd.isna(row['Close']) else None,
                "volume": int(row['Volume']) if not pd.isna(row['Volume']) else None
            })

        # Fetch extra info safely
        fifty_two_high = None
        fifty_two_low = None
        market_cap = None
        current_price = None
        change_pct = None

        try:
            yt = yf.Ticker(ticker)
            info = yt.info
            if info:
                fifty_two_high = info.get("fiftyTwoWeekHigh")
                fifty_two_low = info.get("fiftyTwoWeekLow")
                market_cap = info.get("marketCap")
                current_price = info.get("currentPrice") or info.get("regularMarketPrice")
                change_pct = info.get("regularMarketChangePercent")
        except Exception as info_err:
            print(f"Warning: Could not fetch info from yfinance for {ticker}: {info_err}")

        # Compute fallback metrics from historical data if needed
        close_prices = [h["close"] for h in history_list if h["close"] is not None]
        high_prices = [h["high"] for h in history_list if h["high"] is not None]
        low_prices = [h["low"] for h in history_list if h["low"] is not None]

        if not fifty_two_high and high_prices:
            fifty_two_high = max(high_prices)
        if not fifty_two_low and low_prices:
            fifty_two_low = min(low_prices)
        if not current_price and close_prices:
            current_price = close_prices[-1]
        if change_pct is None and len(close_prices) >= 2:
            change_pct = ((close_prices[-1] - close_prices[-2]) / close_prices[-2]) * 100

        return jsonify({
            "history": history_list,
            "meta": {
                "fiftyTwoWeekHigh": round(float(fifty_two_high), 2) if fifty_two_high is not None else None,
                "fiftyTwoWeekLow": round(float(fifty_two_low), 2) if fifty_two_low is not None else None,
                "marketCap": int(market_cap) if market_cap is not None else None,
                "currentPrice": round(float(current_price), 2) if current_price is not None else None,
                "changePercent": round(float(change_pct), 3) if change_pct is not None else None
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def analyze_sentiment(title, summary):
    text = f"{title or ''} {summary or ''}".lower()
    
    # Word list with positive / negative context weights
    pos_words = ['bullish', 'growth', 'profit', 'expansion', 'gains', 'upgrade', 'beat', 'strong', 
                 'raise', 'surge', 'higher', 'positive', 'win', 'leads', 'boost', 'opportunity', 'success', 'benefit']
    neg_words = ['loss', 'lawsuit', 'decline', 'crash', 'weak', 'miss', 'downgrade', 'fall', 'drop', 
                 'cut', 'bearish', 'slump', 'plunge', 'crisis', 'negative', 'concern', 'risk', 'fail', 'deficit']
                 
    pos_score = sum(text.count(word) for word in pos_words)
    neg_score = sum(text.count(word) for word in neg_words)
    
    if pos_score > neg_score:
        return "Positive"
    elif neg_score > pos_score:
        return "Negative"
    else:
        return "Neutral"

# ==================================
# News Route
# ==================================

@app.route("/news/<ticker>")
def get_ticker_news(ticker):
    try:
        yt = yf.Ticker(ticker)
        raw_news = yt.news or []
        
        parsed_articles = []
        for article in raw_news:
            item = article.get("content", article) if isinstance(article, dict) else {}
            
            title = item.get("title") or item.get("headline")
            if not title:
                continue
                
            provider = item.get("provider", {})
            source = provider.get("displayName") if isinstance(provider, dict) else item.get("publisher") or "Yahoo Finance"
            
            pub_date = item.get("pubDate") or item.get("pubdate") or item.get("providerPublishTime")
            date_str = ""
            if pub_date:
                try:
                    if isinstance(pub_date, int):
                        date_str = pd.to_datetime(pub_date, unit='s').strftime('%Y-%m-%d')
                    else:
                        date_str = pd.to_datetime(pub_date).strftime('%Y-%m-%d')
                except Exception:
                    date_str = str(pub_date)[:10]
            if not date_str:
                date_str = pd.Timestamp.now().strftime('%Y-%m-%d')
                
            url = item.get("clickThroughUrl", {}).get("url") or item.get("canonicalUrl", {}).get("url") or item.get("link") or item.get("url")
            summary = item.get("summary") or item.get("description") or item.get("title")
            
            if summary:
                import re
                summary = re.sub('<[^<]+?>', '', summary)
            else:
                summary = "Click Read More to open the article."
                
            sentiment = analyze_sentiment(title, summary)
            
            parsed_articles.append({
                "title": title,
                "source": source,
                "date": date_str,
                "url": url,
                "summary": summary,
                "sentiment": sentiment
            })
            
        return jsonify(parsed_articles)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==================================
# Run Server
# ==================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )