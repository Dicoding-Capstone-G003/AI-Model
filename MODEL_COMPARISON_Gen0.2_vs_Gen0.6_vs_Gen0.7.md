# Model Comparison Summary

Perbandingan singkat hasil `Gen0.2`, `Gen0.6`, dan `Gen0.7`.


## Ringkasan
- `Gen0.2` adalah baseline tanpa time-shift.
- `Gen0.6` memakai time-shift hasil diagnosis empiris.
- `Gen0.7` memakai konversi UTC ke local time resmi per region.
- Secara keseluruhan, `Gen0.7` menjadi kandidat utama karena performanya minimal setara dengan baseline terbaik dan lebih benar secara domain.

## Jawa
- `Gen0.2`: RMSE `61.7219`, MAE `29.9032`, R2 `0.9464`, MAPE `23.3646%`
- `Gen0.6`: RMSE `61.7276`, MAE `29.9197`, R2 `0.9464`, MAPE `23.3695%`
- `Gen0.7`: RMSE `61.7055`, MAE `29.9109`, R2 `0.9464`, MAPE `23.3522%`

## Kesimpulan
- `Gen0.7` menang tipis atas `Gen0.2` pada `Jawa`.
- `Gen0.6` tidak memberi perbaikan yang berarti dan tidak dipilih sebagai kandidat utama.
- Untuk MVP, model yang direkomendasikan saat ini adalah `Gen0.7`.

## Semua Region
| Region | Gen0.2 RMSE | Gen0.6 RMSE | Gen0.7 RMSE | Best |
|---|---:|---:|---:|---|
| Sumatra | 66.1913 | 66.1626 | 66.1626 | Gen0.6 |
| Jawa | 61.7219 | 61.7276 | 61.7055 | Gen0.7 |
| Kalimantan | 57.6980 | 57.7056 | 57.7056 | Gen0.2 |
| Sulawesi | 59.4873 | 59.7007 | 59.6715 | Gen0.2 |
| Nusa Tenggara | 56.5925 | 56.8167 | 56.7971 | Gen0.2 |
| Maluku | 77.3662 | 77.2476 | 77.2476 | Gen0.6 |
| Papua | 48.9168 | 48.8073 | 48.8073 | Gen0.6 |
