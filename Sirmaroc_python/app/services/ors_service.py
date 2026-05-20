import math

import requests

from app.core.config import ORS_API_KEY


def _haversine_km(origin, destination):
    lon1, lat1 = origin
    lon2, lat2 = destination

    radius_km = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * radius_km * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _fallback_route(origin, destination):
    distance = round(_haversine_km(origin, destination), 2)
    duration = round(max(15, (distance / 65) * 60), 1)
    route = {
        "source": "fallback",
        "summary": {
            "distance_km": distance,
            "duration_min": duration,
        },
    }
    return distance, duration, route


def get_route(origin, destination):
    if not ORS_API_KEY:
        return _fallback_route(origin, destination)

    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json",
    }
    body = {
        "coordinates": [origin, destination]
    }

    try:
        res = requests.post(url, json=body, headers=headers, timeout=15)
        data = res.json()
        route = data.get("routes", [{}])[0]
        summary = route.get("summary", {})
        distance = summary.get("distance")
        duration = summary.get("duration")

        if distance is None or duration is None:
            return _fallback_route(origin, destination)

        return distance / 1000, duration / 60, data
    except Exception:
        return _fallback_route(origin, destination)
