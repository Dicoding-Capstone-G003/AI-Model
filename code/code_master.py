import pandas as pd

file_path = "/home/dawwi/Dicoding/Capstone/AI-Model/clean_dataset/master.csv"

# load dataset
df = pd.read_csv(file_path)

# convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

# ambil tanggal
df["date"] = df["timestamp"].dt.date

# hitung total GHI per hari per kota
daily = (
    df.groupby(["city", "date"])["ghi"]
    .sum()
    .reset_index(name="ghi_day_wh_m2")
)

# statistik per kota
summary = (
    daily.groupby("city")["ghi_day_wh_m2"]
    .agg(
        ghi_day_wh_m2_peak=lambda x: x.quantile(0.95),
        ghi_day_wh_m2_avg="mean",
        ghi_day_wh_m2_low=lambda x: x.quantile(0.05),
    )
    .reset_index()
)

# reliability index
summary["reliability_index"] = (
    summary["ghi_day_wh_m2_low"] /
    summary["ghi_day_wh_m2_peak"]
)

# save
summary.to_csv("city_summary.csv", index=False)

print("city_summary.csv generated!")