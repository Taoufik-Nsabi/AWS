from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ors_service import get_route
from app.services.weather_service import get_weather
from app.services.tourism_service import get_pois
from app.services.pricing_service import calculate_prices
from app.ml.predict import predict_vehicle
from app.ml.feature_engineering import build_features

router = APIRouter()


# 📦 Model ديال request
class TransportRequest(BaseModel):
    lat1: float
    lon1: float
    lat2: float
    lon2: float


@router.post("/best-transport")
def best_transport(data: TransportRequest):

    try:
        # تحويل للإحداثيات الصحيحة
        origin = [data.lon1, data.lat1]
        destination = [data.lon2, data.lat2]

        # ROUTE
        distance, duration, route = get_route(origin, destination)

        # WEATHER
        weather = get_weather(data.lat1, data.lon1)

        # PRICING
        prices = calculate_prices(distance, duration)

        # POIS
        pois = get_pois(data.lat1, data.lon1)

        # FEATURES
        features = build_features(
            distance,
            duration,
            prices,
            weather
        )

        # ML
        ml_choice = predict_vehicle(features)

        return {
            "distance_km": distance,
            "duration_min": duration,
            "weather": weather,
            "prices": prices,
            "ml_prediction": ml_choice,
            "pois": pois
        }

    except Exception as e:
        return {
            "error": str(e)
        }