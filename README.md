# AI-Model

Capstone project Dicoding AI Bootcamp Batch 10 2025-2026 untuk forecasting solar irradiance 24 jam ke depan menggunakan dataset representatif per pulau di Indonesia.

## Objective
- Memprediksi `ALLSKY_SFC_SW_DWN` untuk 24 jam ke depan
- Menggunakan 1 model terpisah per region representatif
- Mendukung 7 region:
- Sumatra
- Jawa
- Kalimantan
- Sulawesi
- Nusa Tenggara
- Maluku
- Papua

## Dataset
Dataset utama:
- [nasa_dataset_daily_20200101_20260101_representative_point_area.csv](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/nasa_dataset_daily_20200101_20260101_representative_point_area.csv)

Karakteristik:
- Data hourly periode 2020-2025
- Setiap `REP_NAME` merepresentasikan 1 titik tetap per region
- Target utama: `ALLSKY_SFC_SW_DWN`

## Model Journey
Eksperimen model berkembang dari baseline awal sampai iterasi yang lebih stabil dan lebih informatif secara evaluasi.

Ringkasan penting:
- LSTM dan GRU diuji sebagai pembanding, tetapi XGBoost memberikan performa terbaik pada dataset ini
- `Gen0.2` menjadi baseline multi-region pertama yang stabil
- `Gen0.7` memperbaiki interpretasi waktu dengan `UTC -> local time`
- `Gen0.8` paling kuat untuk `RMSE` dan `R2`
- `Gen0.9` paling baik untuk `MAPE` dan sudah terintegrasi dengan MLflow

Log pengembangan lengkap:
- [Development.md](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/Development.md)

## Main Notebooks
- Baseline awal: [CodeGen0.1.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.1.ipynb)
- Baseline stabil multi-region: [CodeGen0.2.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.2.ipynb)
- Error analysis: [CodeGen0.4.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.4.ipynb)
- Timezone diagnosis: [CodeGen0.5.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.5.ipynb)
- Domain-correct UTC to local baseline: [CodeGen0.7.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.7.ipynb)
- RMSE-oriented improvement: [CodeGen0.8.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.8.ipynb)
- MAPE-oriented improvement + MLflow: [CodeGen0.9.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.9.ipynb)

Additional notebooks:
- Model comparison XGBoost vs LSTM vs GRU: [model_comparison_xgboost_lstm_gru.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/model_comparison_xgboost_lstm_gru.ipynb)
- Initial LSTM pipeline: [lstm_forecasting_representative_points.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/lstm_forecasting_representative_points.ipynb)

## Artifacts
Artifacts hasil training disimpan lokal per generasi:
- [artifacts_xgboost_representative_points(Gen0.2)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.2))
- [artifacts_xgboost_representative_points(Gen0.7)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.7))
- [artifacts_xgboost_representative_points(Gen0.8)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.8))
- [artifacts_xgboost_representative_points(Gen0.9)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.9))
- [artifacts_error_analysis(Gen0.4)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_error_analysis(Gen0.4))

## Experiment Tracking
MLflow self-hosted:
- Tracking server: [https://ml.cihuyproject.my.id/](https://ml.cihuyproject.my.id/)
- Experiment 1: [Open MLflow Experiment 1](https://ml.cihuyproject.my.id/#/experiments/1)

## Current Practical Recommendation
Untuk kebutuhan MVP:
- gunakan `Gen0.8` jika prioritas utama adalah `RMSE` dan kestabilan error absolut
- gunakan `Gen0.9` jika prioritas utama adalah `MAPE` dan error relatif yang lebih baik
- gunakan `Gen0.7` sebagai baseline yang paling kuat secara narasi domain karena sudah sesuai interpretasi waktu resmi

## Notes
- Model saat ini sudah layak untuk MVP dan presentasi sebagai baseline forecasting 24 jam ke depan
- Masih ada limitasi berupa overshoot pada beberapa jam tertentu, terutama pada periode siang untuk region tertentu
- Improvement setelah `Gen0.7` bersifat inkremental, sehingga keputusan model akhir perlu disesuaikan dengan metrik utama yang ingin diprioritaskan
