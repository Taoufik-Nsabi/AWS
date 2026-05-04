import requests

WEATHER_KEY = "68153023f9622b448144c3cd1aba6a71"

def get_weather(lat, lon):

    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "lat": lat,
        "lon": lon,
        "appid": WEATHER_KEY,
        "units": "metric"
    }

    try:
        res = requests.get(url, params=params, timeout=8)
        data = res.json()

        if res.status_code != 200:
            return {
                "temp": 20,
                "condition": "Clear",
                "raw": data
            }

        return {
            "temp": data.get("main", {}).get("temp", 20),
            "condition": data.get("weather", [{}])[0].get("main", "Clear"),
            "humidity": data.get("main", {}).get("humidity", 50),
            "wind": data.get("wind", {}).get("speed", 0)
        }

    except Exception as e:
        return {
            "temp": 20,
            "condition": "Clear",
            "error": str(e)
        }