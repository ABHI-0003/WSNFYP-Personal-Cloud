import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
# from fastapi import FastAPI
from pydantic import BaseModel
import time

import json
import dbhandler

# Initialize FastAPI
# app = FastAPI()

database_handler = dbhandler.DatabaseHandler("../db-handler/dataset.db")

# Load models
model_24 = load_model("./flood_prediction_24h.keras")
model_48 = load_model("./flood_prediction_48h.keras")

# Load scaler
scaler = joblib.load("./scaler.pkl")

def predict_flood(data):
    # global rolling_data

    # Convert input data into DataFrame
    prev_data = database_handler.get_last_entries("live_dataset", 29)
    prev_data = pd.DataFrame([entry[1:] for entry in prev_data])

    new_sensor_df = pd.DataFrame([[data["temperature"], data["humidity"], data["rain"], data["pressure"], data["soil_moisture"]]])
    database_handler.update_dataset("live_dataset", (data["temperature"], data["humidity"], data["rain"], data["pressure"], data["soil_moisture"]))

    # Append new data and maintain last 30 days
    rolling_data = pd.concat([prev_data, new_sensor_df], ignore_index=True).tail(30)
    print(rolling_data)

    # Scale input data
    scaled_input = scaler.transform(rolling_data)

    # Reshape for LSTM input (1 sample, 30 timesteps, 5 features)
    lstm_input = scaled_input.reshape(1, 30, 5)

    # Make predictions
    prediction_24 = model_24.predict(lstm_input)
    prediction_48 = model_48.predict(lstm_input)

    # Save updated rolling data for future use
    rolling_data.to_csv("last_29_days.csv", index=False)

    # Define risk levels
    risk_levels = {
        0: "Low Risk - No immediate flood danger.",
        1: "Medium Risk - Be cautious, monitor conditions.",
        2: "High Risk - Potential flooding expected, take precautions!"
    }
    print(prediction_24.tolist(),prediction_48.tolist())

    print({
        "24h_risk": int(np.argmax(prediction_24)),
        "24h_probabilities": prediction_24.tolist(),
        "48h_risk": int(np.argmax(prediction_48)),
        "48h_probabilities": prediction_48.tolist()
    }
    )
    level_24 = int(np.argmax(prediction_24))
    level_48 = int(np.argmax(prediction_48))
    database_handler.update_predictions("predictions", (level_24, level_48))

predict_flood(json.loads(u'{"temperature": 25.8,"humidity": 86,"rain": 100000000,"pressure": 1013.2,"soil_moisture": 0.22}'))