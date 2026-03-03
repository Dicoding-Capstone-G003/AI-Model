import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "clean_dataset" / "master.csv"

df = pd.read_csv(DATA_PATH, parse_dates=["timestamp"])

# Tambah kolom tanggal saja
df["date"] = df["timestamp"].dt.date

# Hitung total GHI per hari per kota
daily = (
    df.groupby(["city", "date"])["ghi"]
    .sum()
    .reset_index()
)

print(daily.head())

summary = (
    daily.groupby("city")["ghi"]
    .agg(
        avg="mean",
        peak=lambda x: x.quantile(0.9),   # P90
        low=lambda x: x.quantile(0.1)     # P10
    )
    .reset_index()
)

print(summary)

summary["reliability_index"] = summary["low"] / summary["peak"]
summary = summary.sort_values("reliability_index", ascending=False)

print(summary[["city", "reliability_index"]])