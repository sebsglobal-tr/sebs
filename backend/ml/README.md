# Öğrenci değerlendirme ML

Dashboard **Değerlendirme raporum** bölümü, `xgboost_student_model_noisy.pkl` ve `label_encoder_noisy.pkl` ile öğrenme profili üretir.

## Kurulum (geliştirme)

```bash
cd /path/to/sebs
python3.11 -m venv .venv-ml
.venv-ml/bin/pip install -r backend/ml/requirements.txt
```

macOS’ta XGBoost için OpenMP gerekebilir: `brew install libomp`

Sunucuya Python yolu (isteğe bağlı):

```bash
export STUDENT_ML_PYTHON=/path/to/sebs/.venv-ml/bin/python3
```

## Tahmin scripti

```bash
echo '{"module_name":"Temel Siber Güvenlik","theory_score":80,"practice_score":75,"hint_used_count":1,"wrong_actions_count":2,"time_spent_mins":120}' \
  | .venv-ml/bin/python backend/ml/predict_student_profile.py
```

## Profil sınıfları

- Dengeli
- Gelişime Açık (Temel Eksik)
- Pratik Zeka (Teorisi Zayıf)
- Teorisyen (Pratiği Zayıf)
- Uzman (Eksiksiz)

Model yüklenemezse API kural tabanlı raporu döndürür; `data.ml.available === false` olur.
