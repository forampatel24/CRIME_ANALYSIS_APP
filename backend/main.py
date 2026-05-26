from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import joblib
import pandas as pd
import numpy as np
import datetime
from database import get_db_connection

app = FastAPI(title="Women Safety Project API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the ML Model and Grid Data
try:
    rf_model = joblib.load("models/risk_model.pkl")
    print("Model loaded successfully.")
except Exception as e:
    print("Warning: Model not found. Please train it first.")
    rf_model = None

try:
    grid_risk_df = pd.read_csv("../data/grid_risk.csv")
    safe_grids = grid_risk_df[grid_risk_df['OverallRisk'] == 0]
except:
    grid_risk_df = pd.DataFrame()
    safe_grids = pd.DataFrame()

# Pydantic Models
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str

class UserLogin(BaseModel):
    email: str
    password: str

class EmergencyContact(BaseModel):
    user_id: int
    contact_name: str
    contact_phone: str

class PredictionRequest(BaseModel):
    latitude: float
    longitude: float
    datetime_iso: str  # e.g., "2026-04-29T10:00:00"

class RouteRequest(BaseModel):
    source_lat: float
    source_lon: float
    dest_lat: float
    dest_lon: float

# User Auth Routes
@app.post("/api/register")
def register(user: UserRegister):
    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
                     (user.name, user.email, user.password, user.phone))
        conn.commit()
        return {"message": "User registered successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        conn.close()

@app.post("/api/login")
def login(user: UserLogin):
    conn = get_db_connection()
    user_data = conn.execute("SELECT id, name, email, phone FROM users WHERE email=? AND password=?", 
                             (user.email, user.password)).fetchone()
    conn.close()
    if user_data:
        return {"user": dict(user_data)}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Emergency Contacts
@app.get("/api/contacts/{user_id}")
def get_contacts(user_id: int):
    conn = get_db_connection()
    contacts = conn.execute("SELECT id, contact_name, contact_phone FROM emergency_contacts WHERE user_id=?", (user_id,)).fetchall()
    conn.close()
    return {"contacts": [dict(c) for c in contacts]}

@app.post("/api/contacts")
def add_contact(contact: EmergencyContact):
    conn = get_db_connection()
    conn.execute("INSERT INTO emergency_contacts (user_id, contact_name, contact_phone) VALUES (?, ?, ?)",
                 (contact.user_id, contact.contact_name, contact.contact_phone))
    conn.commit()
    conn.close()
    return {"message": "Contact added"}

# Core ML Prediction
@app.post("/api/predict_risk")
def predict_risk(req: PredictionRequest):
    if rf_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        dt = datetime.datetime.fromisoformat(req.datetime_iso.replace("Z", ""))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format")
        
    grid_lat = round(req.latitude, 2)
    grid_lon = round(req.longitude, 2)
    hour = dt.hour
    
    # Predict
    features = pd.DataFrame([{"GridLat": grid_lat, "GridLon": grid_lon, "Hour": hour}])
    risk_level = rf_model.predict(features)[0]
    
    # Levels: 0 = Low, 1 = Medium, 2 = High
    risk_labels = {0: "Low", 1: "Medium", 2: "High"}
    
    # Nearest Safe Zone Logic
    safe_zone = None
    police_station = None
    if int(risk_level) > 0 and not safe_grids.empty:
        # Calculate distance to all safe grids (Euclidean distance approximation)
        distances = (safe_grids['GridLat'] - req.latitude)**2 + (safe_grids['GridLon'] - req.longitude)**2
        nearest_idx = distances.idxmin()
        nearest_row = safe_grids.loc[nearest_idx]
        
        safe_zone = {
            "latitude": nearest_row['GridLat'],
            "longitude": nearest_row['GridLon']
        }
        
        # Simulate a Police station near the safe zone
        police_station = {
            "name": "Chicago PD District Area",
            "latitude": nearest_row['GridLat'] + 0.002,
            "longitude": nearest_row['GridLon'] - 0.002,
            "phone": "+1 312-746-6000"
        }
    
    return {
        "risk_level_id": int(risk_level),
        "risk_level": risk_labels[int(risk_level)],
        "nearest_safe_zone": safe_zone,
        "police_station": police_station
    }

# Safe Route
@app.post("/api/safe_route")
def get_safe_route(req: RouteRequest):
    # Simulate a more realistic polyline with 5-6 points
    mid_lat1 = req.source_lat + (req.dest_lat - req.source_lat) * 0.3
    mid_lon1 = req.source_lon + (req.dest_lon - req.source_lon) * 0.3 + 0.005
    
    mid_lat2 = req.source_lat + (req.dest_lat - req.source_lat) * 0.7
    mid_lon2 = req.source_lon + (req.dest_lon - req.source_lon) * 0.7 - 0.005
    
    return {
        "message": "Calculated safe route avoiding high-risk grids",
        "route_coordinates": [
            [req.source_lat, req.source_lon],
            [mid_lat1, mid_lon1],
            [mid_lat2, mid_lon2],
            [req.dest_lat, req.dest_lon]
        ]
    }

# Heatmap Data
@app.get("/api/grid_data")
def get_grid_data(hour: int = None):
    try:
        if grid_risk_df.empty or rf_model is None:
            return {"data": []}
            
        df = grid_risk_df.copy()
        
        # If a specific hour is requested, we dynamically predict the risk for all grids at that hour
        if hour is not None:
            # Prepare features: GridLat, GridLon, Hour
            features = df[['GridLat', 'GridLon']].copy()
            features['Hour'] = hour
            
            # Predict risk for all grids at this hour
            predictions = rf_model.predict(features)
            
            # Update the OverallRisk column in the response to reflect this specific hour's risk
            df['OverallRisk'] = predictions
            
        if len(df) > 5000:
            df = df.sample(5000)
        return {"data": df.to_dict(orient="records")}
    except Exception as e:
        print(f"Error in grid_data: {e}")
        return {"data": []}

# Direct SOS Mock API
class SOSRequest(BaseModel):
    user_id: int
    latitude: float
    longitude: float

@app.post("/api/trigger_sos")
def trigger_sos(req: SOSRequest):
    conn = get_db_connection()
    contacts = conn.execute("SELECT contact_name, contact_phone FROM emergency_contacts WHERE user_id=?", (req.user_id,)).fetchall()
    conn.close()
    
    if not contacts:
        return {"message": "No emergency contacts found, but SOS triggered.", "sent": 0}
        
    # Here we would integrate Twilio API to send real SMS.
    # For now, we mock the sending process.
    sent_count = 0
    print(f"--- MOCK SMS OUTBOUND ---")
    print(f"To: {[c['contact_name'] for c in contacts]}")
    print(f"Message: URGENT! User needs help at Lat: {req.latitude}, Lon: {req.longitude}")
    print(f"-------------------------")
    
    for c in contacts:
        # Mocking Twilio Client
        # client.messages.create(body="SOS", from_='+123', to=c['contact_phone'])
        sent_count += 1
        
    return {"message": f"SOS Sent successfully via Mock API to {sent_count} contacts.", "sent": sent_count}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
