#!/usr/bin/env python3
"""Öğrenci profili XGBoost tahmini — stdin JSON, stdout JSON."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "models" / "xgboost_student_model_noisy.pkl"
ENCODER_PATH = ROOT / "models" / "label_encoder_noisy.pkl"

FEATURE_COLUMNS = [
    "module_name",
    "theory_score",
    "practice_score",
    "hint_used_count",
    "wrong_actions_count",
    "time_spent_mins",
]


def clamp(value, lo, hi):
    try:
        v = float(value)
    except (TypeError, ValueError):
        v = 0.0
    return max(lo, min(hi, v))


def build_row(payload: dict) -> dict:
    return {
        "module_name": str(payload.get("module_name") or "Siber Güvenliğe Giriş").strip()[:120],
        "theory_score": clamp(payload.get("theory_score"), 0, 100),
        "practice_score": clamp(payload.get("practice_score"), 0, 100),
        "hint_used_count": int(clamp(payload.get("hint_used_count"), 0, 100000)),
        "wrong_actions_count": int(clamp(payload.get("wrong_actions_count"), 0, 100000)),
        "time_spent_mins": int(clamp(payload.get("time_spent_mins"), 0, 100000)),
    }


def main() -> int:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError as exc:
        print(json.dumps({"ok": False, "error": f"Geçersiz JSON: {exc}"}, ensure_ascii=False))
        return 1

    if not MODEL_PATH.is_file() or not ENCODER_PATH.is_file():
        print(
            json.dumps(
                {"ok": False, "error": "Model dosyaları bulunamadı (backend/ml/models/)."},
                ensure_ascii=False,
            )
        )
        return 1

    try:
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
    except Exception as exc:
        print(json.dumps({"ok": False, "error": f"Model yüklenemedi: {exc}"}, ensure_ascii=False))
        return 1

    row = build_row(payload)
    df = pd.DataFrame([row], columns=FEATURE_COLUMNS)

    try:
        pred_idx = int(model.predict(df)[0])
        proba = model.predict_proba(df)[0]
    except Exception as exc:
        print(json.dumps({"ok": False, "error": f"Tahmin hatası: {exc}"}, ensure_ascii=False))
        return 1

    classes = [str(c) for c in label_encoder.classes_]
    probabilities = {classes[i]: round(float(proba[i]), 4) for i in range(len(classes))}
    profile = str(label_encoder.inverse_transform([pred_idx])[0])

    print(
        json.dumps(
            {
                "ok": True,
                "profile": profile,
                "profileIndex": pred_idx,
                "probabilities": probabilities,
                "features": row,
                "modelVersion": "xgboost_student_model_noisy",
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
