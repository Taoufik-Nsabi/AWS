import requests
from app.core.config import ORS_API_KEY


def get_pois(lat, lon):

    url = "https://api.openrouteservice.org/pois"

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "request": "pois",
        "geometry": {
            "geojson": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
           "buffer": 1000
        }
    }

    res = requests.post(url, json=body, headers=headers)

    return res.json()