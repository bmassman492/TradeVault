"""
S&P 500 Historical Stock Data Downloader
=========================================
Downloads daily OHLC data for all current S&P 500 constituents,
computes RSI(14), 50-day MA, and 200-day MA, and exports:
  1. stock_prices.csv   — the main fact table
  2. stock_tickers.csv  — ticker/company name lookup table
  3. create_tables.sql  — MariaDB DDL for both tables

Usage:
    pip install yfinance pandas requests beautifulsoup4 lxml
    python sp500_download.py
"""

import time
import datetime
import sys
import warnings

import pandas as pd
import numpy as np
import requests
from bs4 import BeautifulSoup
import yfinance as yf

warnings.filterwarnings("ignore", category=FutureWarning)

# ── Configuration ────────────────────────────────────────────────────────────
START_DATE = "1999-01-01"
END_DATE = datetime.date.today().strftime("%Y-%m-%d")
RSI_PERIOD = 14
MA_SHORT = 50
MA_LONG = 200
OUTPUT_PRICES = r"C:\Users\bmass\Downloads\stock_prices.csv"
OUTPUT_TICKERS = r"C:\Users\bmass\Downloads\stock_tickers.csv"
OUTPUT_SQL = r"C:\Users\bmass\Downloads\create_tables.sql"
# Tickers where the company rebranded but yfinance already maps
# all historical data under the *new* ticker symbol.
# Any ticker that yfinance can't serve full history for under a
# single symbol will simply be dropped.
# ─────────────────────────────────────────────────────────────────────────────


def log(msg: str) -> None:
    """Timestamped console log."""
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def fetch_sp500_list() -> pd.DataFrame:
    """Scrape the current S&P 500 constituents from Wikipedia."""
    log("Fetching current S&P 500 list from Wikipedia...")
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    resp = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "lxml")
    table = soup.find("table", {"id": "constituents"})
    df = pd.read_html(str(table))[0]
    df = df[["Symbol", "Security"]].rename(
        columns={"Symbol": "ticker", "Security": "company_name"}
    )
    # Clean ticker symbols (BRK.B → BRK-B for yfinance compatibility)
    df["ticker"] = df["ticker"].str.replace(".", "-", regex=False).str.strip()
    log(f"  Found {len(df)} tickers.")
    return df


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Wilder's RSI (exponential smoothing)."""
    delta = series.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def download_single_ticker(
    ticker: str, start: str, end: str
) -> pd.DataFrame | None:
    """
    Download daily OHLC for one ticker.
    Returns a DataFrame or None if the download fails or has insufficient data.
    """
    try:
        data = yf.download(
            ticker,
            start=start,
            end=end,
            progress=False,
            auto_adjust=True,
            threads=False,
        )
        if data is None or data.empty:
            return None

        # yfinance can return MultiIndex columns for single tickers; flatten
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)

        # Need at least MA_LONG rows to produce any valid 200-day MA
        if len(data) < MA_LONG + 1:
            return None

        return data
    except Exception as e:
        log(f"    ERROR downloading {ticker}: {e}")
        return None


def process_ticker(df: pd.DataFrame, ticker: str) -> pd.DataFrame:
    """Add computed columns and reshape into final schema."""
    df = df.copy()
    df["ticker"] = ticker
    df["date"] = df.index

    # Rename to match schema
    df = df.rename(
        columns={
            "Open": "open_price",
            "Close": "close_price",
            "Low": "low_price",
            "High": "high_price",
        }
    )

    # Computed indicators
    df["rsi"] = compute_rsi(df["close_price"], RSI_PERIOD)
    df["ma_50"] = df["close_price"].rolling(window=MA_SHORT, min_periods=MA_SHORT).mean()
    df["ma_200"] = df["close_price"].rolling(window=MA_LONG, min_periods=MA_LONG).mean()

    # Round numeric columns to 4 decimal places for cleanliness
    numeric_cols = ["open_price", "close_price", "low_price", "high_price",
                    "rsi", "ma_50", "ma_200"]
    df[numeric_cols] = df[numeric_cols].round(4)

    # Select and order final columns
    df = df[["ticker", "date", "open_price", "close_price", "low_price",
             "high_price", "rsi", "ma_50", "ma_200"]]

    return df


def generate_sql(path: str) -> None:
    """Write MariaDB CREATE TABLE statements."""
    sql = """\
-- S&P 500 Stock Data — MariaDB Schema
-- ====================================

CREATE TABLE IF NOT EXISTS stock_tickers (
    ticker       VARCHAR(10)  NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stock_prices (
    ticker      VARCHAR(10)    NOT NULL,
    date        DATE           NOT NULL,
    open_price  DECIMAL(12,4)  NULL,
    close_price DECIMAL(12,4)  NULL,
    low_price   DECIMAL(12,4)  NULL,
    high_price  DECIMAL(12,4)  NULL,
    rsi         DECIMAL(8,4)   NULL,
    ma_50       DECIMAL(12,4)  NULL,
    ma_200      DECIMAL(12,4)  NULL,
    PRIMARY KEY (ticker, date),
    FOREIGN KEY (ticker) REFERENCES stock_tickers(ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Load data (adjust file paths to match your server):
-- LOAD DATA LOCAL INFILE '/path/to/stock_tickers.csv'
--   INTO TABLE stock_tickers
--   FIELDS TERMINATED BY ',' ENCLOSED BY '"'
--   LINES TERMINATED BY '\\n'
--   IGNORE 1 LINES
--   (ticker, company_name);
--
-- LOAD DATA LOCAL INFILE '/path/to/stock_prices.csv'
--   INTO TABLE stock_prices
--   FIELDS TERMINATED BY ',' ENCLOSED BY '"'
--   LINES TERMINATED BY '\\n'
--   IGNORE 1 LINES
--   (ticker, date, open_price, close_price, low_price, high_price,
--    rsi, ma_50, ma_200);
"""
    with open(path, "w") as f:
        f.write(sql)
    log(f"  SQL schema written to {path}")


def main() -> None:
    start_time = time.time()

    # ── Step 1: Get ticker list ──────────────────────────────────────────────
    tickers_df = fetch_sp500_list()
    ticker_list = tickers_df["ticker"].tolist()
    total = len(ticker_list)

    # ── Step 2: Download and process each ticker ─────────────────────────────
    all_frames: list[pd.DataFrame] = []
    successful_tickers: list[str] = []
    failed_tickers: list[str] = []

    log(f"Starting download of {total} tickers  ({START_DATE} → {END_DATE})")
    log("=" * 60)

    for i, ticker in enumerate(ticker_list, start=1):
        pct = (i / total) * 100
        log(f"[{i}/{total}]  ({pct:5.1f}%)  Downloading {ticker}...")

        raw = download_single_ticker(ticker, START_DATE, END_DATE)

        if raw is None:
            log(f"    ⚠  SKIPPED {ticker} — no data or insufficient history")
            failed_tickers.append(ticker)
            continue

        processed = process_ticker(raw, ticker)
        all_frames.append(processed)
        successful_tickers.append(ticker)

        years = len(raw) / 252  # approximate trading days per year
        log(f"    ✓  {len(raw):,} rows  (~{years:.1f} years)")

    log("=" * 60)
    log(f"Downloads complete:  {len(successful_tickers)} succeeded,  "
        f"{len(failed_tickers)} dropped")

    if failed_tickers:
        log(f"  Dropped tickers: {', '.join(failed_tickers)}")

    # ── Step 3: Combine and export ───────────────────────────────────────────
    log("Combining all data...")
    prices_df = pd.concat(all_frames, ignore_index=True)
    log(f"  Total rows: {len(prices_df):,}")

    log(f"Writing {OUTPUT_PRICES}...")
    prices_df.to_csv(OUTPUT_PRICES, index=False)
    size_mb = prices_df.memory_usage(deep=True).sum() / (1024 * 1024)
    log(f"  Done. (~{size_mb:.0f} MB in memory)")

    # Filter lookup table to only successful tickers
    lookup_df = tickers_df[tickers_df["ticker"].isin(successful_tickers)].copy()
    log(f"Writing {OUTPUT_TICKERS}...")
    lookup_df.to_csv(OUTPUT_TICKERS, index=False)

    # ── Step 4: Generate SQL ─────────────────────────────────────────────────
    generate_sql(OUTPUT_SQL)

    # ── Summary ──────────────────────────────────────────────────────────────
    elapsed = time.time() - start_time
    minutes = elapsed / 60
    log("")
    log("═" * 60)
    log("  SUMMARY")
    log("═" * 60)
    log(f"  Tickers downloaded:  {len(successful_tickers)}")
    log(f"  Tickers dropped:     {len(failed_tickers)}")
    log(f"  Total price rows:    {len(prices_df):,}")
    log(f"  Date range:          {START_DATE} → {END_DATE}")
    log(f"  Output files:")
    log(f"    • {OUTPUT_PRICES}")
    log(f"    • {OUTPUT_TICKERS}")
    log(f"    • {OUTPUT_SQL}")
    log(f"  Elapsed time:        {minutes:.1f} minutes")
    log("═" * 60)


if __name__ == "__main__":
    main()