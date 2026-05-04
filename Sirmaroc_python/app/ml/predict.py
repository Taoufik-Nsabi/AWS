import joblib
import numpy as np

model = joblib.load("app/ml/model.pkl")

FEATURES_SCHEMA = [
    "distance_km",
    "duration_min",
    "price_car",
    "price_moto",
    "price_bike",
    "price_train",
    "weather_rain",
    "weather_temp",
    "traffic_level"
]

def predict_vehicle(features):

    try:
        X = np.array([[features[f] for f in FEATURES_SCHEMA]])

        pred = model.predict(X)[0]

        return pred  # ✅ direct "bike" / "car" / "train"

    except Exception as e:
        return {"error": str(e)}