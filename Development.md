# Development Log

## Project
Forecasting solar irradiance 24 jam ke depan per region representatif Indonesia menggunakan dataset hourly NASA 2020-2025.

Target:
- `ALLSKY_SFC_SW_DWN`

Region:
- Sumatra
- Jawa
- Kalimantan
- Sulawesi
- Nusa Tenggara
- Maluku
- Papua

## Tracking
- MLflow Tracking Server: [https://ml.cihuyproject.my.id/](https://ml.cihuyproject.my.id/)
- MLflow Experiment 1: [Open Experiment 1](https://ml.cihuyproject.my.id/#/experiments/1)

## Development Timeline

### Gen0.1
- Baseline pipeline XGBoost multi-region pertama.
- Training 1 model direct multi-step 24 horizon per region.
- Sudah menyimpan artifact lokal per region.
- Artifact: [artifacts_xgboost_representative_points(Gen0.1)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.1))
- Notebook: [CodeGen0.1.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.1.ipynb)

### Gen0.2
- Menambahkan GPU-ready XGBoost dengan fallback CPU.
- Menambahkan metrik `R2` dan `MAPE`.
- Menjadi baseline utama multi-region sebelum analisis error lebih lanjut.
- Artifact: [artifacts_xgboost_representative_points(Gen0.2)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.2))
- Notebook: [CodeGen0.2.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.2.ipynb)

### Gen0.3
- Eksperimen robustness untuk menekan tail error.
- Menambahkan post-processing dan evaluasi tambahan.
- Hasil tidak memberi peningkatan berarti, sehingga tidak dijadikan kandidat utama.
- Notebook: [CodeGen0.3.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.3.ipynb)

### Gen0.4
- Error analysis khusus hasil `Gen0.2`.
- Menghasilkan breakdown error per jam, per horizon, day vs night, dan top error sample.
- Menemukan indikasi mismatch interpretasi waktu pada kolom `HR`.
- Artifact: [artifacts_error_analysis(Gen0.4)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_error_analysis(Gen0.4))
- Notebook: [CodeGen0.4.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.4.ipynb)

### Gen0.5
- Notebook diagnosis timezone.
- Menguji offset waktu berdasarkan pola `CLRSKY_SFC_SW_DWN` dan `ALLSKY_SFC_SW_DWN`.
- Membantu memverifikasi bahwa interpretasi waktu perlu disesuaikan.
- Notebook: [CodeGen0.5.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.5.ipynb)

### Gen0.6
- Time-shift berbasis diagnosis empiris.
- Menggunakan offset hasil scoring per region.
- Hasilnya tidak memberi improvement yang cukup konsisten.
- Artifact: [artifacts_xgboost_representative_points(Gen0.6)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.6))
- Notebook: [CodeGen0.6.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.6.ipynb)

### Gen0.7
- Time-shift berbasis interpretasi resmi `UTC -> local time` Indonesia.
- Offset yang dipakai:
- `+7`: Sumatra, Jawa
- `+8`: Kalimantan, Sulawesi, Nusa Tenggara
- `+9`: Maluku, Papua
- Menjadi baseline domain-correct utama.
- Artifact: [artifacts_xgboost_representative_points(Gen0.7)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.7))
- Notebook: [CodeGen0.7.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.7.ipynb)

### Gen0.8
- Menambahkan fitur tambahan untuk merespons perubahan cepat:
- diff features
- rolling std
- interaction features
- Tuning XGBoost lebih robust untuk menekan error besar.
- Secara umum memperbaiki `RMSE` dan `R2`, sehingga kuat sebagai kandidat MVP jika fokus pada error absolut.
- Artifact: [artifacts_xgboost_representative_points(Gen0.8)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.8))
- Notebook: [CodeGen0.8.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.8.ipynb)

### Gen0.9
- Fokus menurunkan `MAPE` tanpa merusak `RMSE` terlalu banyak.
- Menambahkan:
- sample weighting ringan
- ratio terhadap clear-sky
- regime features
- integrasi MLflow self-hosted
- Hasil:
- `MAPE` turun di semua region
- `RMSE` tetap kompetitif, walau tidak selalu terbaik dibanding `Gen0.8`
- Artifact: [artifacts_xgboost_representative_points(Gen0.9)](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/artifacts_xgboost_representative_points(Gen0.9))
- Notebook: [CodeGen0.9.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/CodeGen0.9.ipynb)

## Model Comparison Summary

### Baseline comparison
- `Gen0.2`: baseline multi-region stabil.
- `Gen0.7`: baseline yang paling benar secara domain karena sudah mengikuti `UTC -> local time`.
- `Gen0.8`: paling kuat untuk `RMSE` dan `R2`.
- `Gen0.9`: paling baik untuk `MAPE`, dengan trade-off kecil pada `RMSE` di beberapa region.

### Practical decision for MVP
- Jika fokus pada error absolut dan kestabilan umum: pilih `Gen0.8`.
- Jika fokus pada error relatif dan presentasi bahwa model lebih seimbang pada skala kecil-menengah: pilih `Gen0.9`.
- Jika fokus pada narasi domain correctness: gunakan `Gen0.7` sebagai baseline referensi.

## Important Findings
- XGBoost consistently outperformed LSTM dan GRU pada dataset ini.
- Mismatch interpretasi waktu sempat menjadi sumber error penting.
- Setelah penyesuaian waktu, improvement ada tetapi bersifat inkremental.
- Untuk deadline MVP, model saat ini sudah layak dipresentasikan sebagai baseline forecasting 24 jam ke depan, dengan limitasi overshoot pada beberapa jam tertentu.

## Main Files
- Comparison notebook: [model_comparison_xgboost_lstm_gru.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/model_comparison_xgboost_lstm_gru.ipynb)
- Comparison notes: [MODEL_COMPARISON_Gen0.2_vs_Gen0.6_vs_Gen0.7.md](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/MODEL_COMPARISON_Gen0.2_vs_Gen0.6_vs_Gen0.7.md)
- Initial LSTM notebook: [lstm_forecasting_representative_points.ipynb](/C:/Users/Daiyo/Documents/Dicoding/AI-Model/lstm_forecasting_representative_points.ipynb)

## Final Note
Iterasi model setelah `Gen0.7` menunjukkan bahwa improvement masih mungkin, tetapi cenderung inkremental. Untuk kebutuhan MVP dan presentasi, model sudah cukup layak selama limitasi model dijelaskan dengan jujur, terutama terkait overshoot pada beberapa jam tertentu dan fakta bahwa model ini masih baseline yang dapat dikembangkan lebih lanjut.
