import requests

from app.core.config import ORS_API_KEY


def get_route(origin, destination):

    url = "https://api.openrouteservice.org/v2/directions/driving-car"

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [origin, destination]
    }

    res = requests.post(url, json=body, headers=headers)
    data = res.json()

    route = data["routes"][0]

    distance = route["summary"]["distance"] / 1000
    duration = route["summary"]["duration"] / 60

    return distance, duration, data