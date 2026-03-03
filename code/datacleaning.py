from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent  # ini harusnya mengarah ke folder AI-Model
RAW_DIR = BASE_DIR / "og_dataset"
OUT_PATH = BASE_DIR / "clean_dataset" / "master.parquet"
OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

print("BASE_DIR :", BASE_DIR)
print("RAW_DIR  :", RAW_DIR)
print("OUT_PATH :", OUT_PATH)

csv_files = sorted(list(RAW_DIR.glob("*.csv")) + list(RAW_DIR.glob("*.CSV")))
print("CSV count:", len(csv_files))
if not csv_files:
    raise FileNotFoundError(f"Tidak ada file CSV di: {RAW_DIR}")

# Map nama kolom NASA POWER -> nama kolom yang lebih enak dipakai
COL_MAP = {
    "ALLSKY_SFC_SW_DWN": "ghi",          # irradiance all-sky (Wh/m^2) per jam
    "CLRSKY_SFC_SW_DWN": "clear_ghi",    # irradiance clear-sky (Wh/m^2) per jam
    "T2M": "temp_c",                     # temperature (C)
    "YEAR": "year",
    "MO": "month",
    "DY": "day",
    "HR": "hour",
}

def read_power_csv(path: Path, city_name: str) -> pd.DataFrame:
    """
    NASA POWER CSV biasanya punya header metadata sebelum baris 'YEAR,MO,DY,HR,...'
    Jadi kita cari baris header itu dulu, lalu baca dari sana.
    """
    # Cari baris yang dimulai dengan "YEAR"
    with path.open("r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    header_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith("YEAR"):
            header_idx = i
            break
    if header_idx is None:
        raise ValueError(f"Tidak menemukan header 'YEAR' di file: {path.name}")

    # Baca CSV mulai dari header_idx
    df = pd.read_csv(path, skiprows=header_idx)

    # Pastikan kolom yang kita butuh ada
    needed = ["YEAR", "MO", "DY", "HR", "ALLSKY_SFC_SW_DWN", "T2M"]
    missing = [c for c in needed if c not in df.columns]
    if missing:
        raise ValueError(f"Kolom {missing} tidak ada di {path.name}. Kolom ada: {list(df.columns)}")

    # Rename kolom biar clean
    df = df.rename(columns={k: v for k, v in COL_MAP.items() if k in df.columns})

    # Buat timestamp (hourly)
    df["timestamp"] = pd.to_datetime(
        dict(year=df["year"], month=df["month"], day=df["day"], hour=df["hour"]),
        errors="coerce"
    )

    # Tambah city
    df["city"] = city_name

    # Ambil kolom inti saja
    keep_cols = ["timestamp", "city", "ghi", "clear_ghi", "temp_c"]
    for col in keep_cols:
        if col not in df.columns:
            df[col] = pd.NA
    df = df[keep_cols]

    # Bersih-bersih ringan
    df = df.dropna(subset=["timestamp"])              # buang timestamp rusak
    df = df.sort_values("timestamp")

    # Optional sanity checks:
    # - Irradiance gak boleh negatif
    df.loc[df["ghi"] < 0, "ghi"] = pd.NA
    if "clear_ghi" in df.columns:
        df.loc[df["clear_ghi"] < 0, "clear_ghi"] = pd.NA

    return df


all_dfs = []
for fp in sorted(RAW_DIR.glob("*.csv")):
    city = fp.stem  # nama file jadi nama kota, misal "Jakarta.csv" -> "Jakarta"
    df_city = read_power_csv(fp, city_name=city)
    all_dfs.append(df_city)
    print(f"Loaded {city:15s} | rows={len(df_city):,} | from={fp.name}")

master = pd.concat(all_dfs, ignore_index=True)

# Cek cepat kualitas data per kota
qc = (master
      .groupby("city")
      .agg(
          start=("timestamp", "min"),
          end=("timestamp", "max"),
          n=("timestamp", "count"),
          missing_ghi=("ghi", lambda s: s.isna().mean()),
          missing_temp=("temp_c", lambda s: s.isna().mean()),
      )
      .sort_values("n", ascending=False)
)
print("\nQC per city:")
print(qc)

# Simpan (parquet lebih cepat & kecil daripada csv)
OUT_PATH = BASE_DIR / "clean_dataset" / "master.csv"
master.to_csv(OUT_PATH, index=False)
print(f"\nSaved master dataset -> {OUT_PATH} | rows={len(master):,}")
print(f"\nSaved master dataset -> {OUT_PATH} | rows={len(master):,}")