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

def build_features(distance, duration, prices, weather, traffic=1):

    return {
        "distance_km": float(distance),
        "duration_min": float(duration),

        "price_car": float(prices.get("car", 0)),
        "price_moto": float(prices.get("moto", 0)),
        "price_bike": float(prices.get("bike", 0)),
        "price_train": float(prices.get("train", 0)),

        "weather_rain": 1 if weather.get("condition") == "Rain" else 0,
        "weather_temp": float(weather.get("temp", 20)),

        "traffic_level": float(traffic)
    }