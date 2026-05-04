# app/services/pricing_service.py

def calculate_prices(distance, duration):

    return {
        "car": distance * 1.2 + duration * 0.05,
        "moto": distance * 0.7,
        "bike": distance * 0.1,
        "train": max(20, distance * 0.4)
    }