import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

DATA_PATH = "../data/crimes.csv"
MODEL_DIR = "../backend/models"
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.pkl")
CLEANED_DATA_PATH = "../data/cleaned_crimes.csv"
GRID_DATA_PATH = "../data/grid_risk.csv"

def prepare_data():
    print("Loading dataset...")
    # Load a sample to avoid memory issues (e.g., last 500,000 rows or randomly sample)
    # Since the file is 348MB, we can try to read the whole thing, but let's just take a 30% sample for speed
    df = pd.read_csv(DATA_PATH)
    
    print(f"Original dataset shape: {df.shape}")
    
    print("Cleaning dataset...")
    df = df.dropna(subset=['Latitude', 'Longitude'])
    
    # Keep only relevant columns
    cols_to_keep = ['Date', 'Primary Type', 'Latitude', 'Longitude']
    df = df[cols_to_keep].copy()
    
    print("Extracting time features...")
    df['Date'] = pd.to_datetime(df['Date'], format='%m/%d/%Y %I:%M:%S %p')
    df['Hour'] = df['Date'].dt.hour
    df['DayOfWeek'] = df['Date'].dt.dayofweek
    df['Month'] = df['Date'].dt.month
    
    # We could sample here to keep training fast
    if len(df) > 300000:
        df = df.sample(300000, random_state=42)
    
    print("Creating spatial grids...")
    # Round to 2 decimal places. 
    # 0.01 degrees is ~1.1km. 0.02 degrees is ~2.2km. Let's use 2 decimal places to get decent sized grids
    df['GridLat'] = df['Latitude'].round(2)
    df['GridLon'] = df['Longitude'].round(2)
    
    print("Calculating crime counts and labeling risk...")
    # Group by Grid, Hour, DayOfWeek
    # To have enough data, let's just group by Grid and Hour
    grid_stats = df.groupby(['GridLat', 'GridLon', 'Hour']).size().reset_index(name='CrimeCount')
    
    # Label risk based on quantiles of crime count
    q50 = grid_stats['CrimeCount'].quantile(0.50)
    q85 = grid_stats['CrimeCount'].quantile(0.85)
    
    def get_risk_label(count):
        if count <= q50:
            return 0 # Low Risk
        elif count <= q85:
            return 1 # Medium Risk
        else:
            return 2 # High Risk
            
    grid_stats['RiskLevel'] = grid_stats['CrimeCount'].apply(get_risk_label)
    
    # Also save overall grid risk for map visualization (independent of time)
    overall_grid = df.groupby(['GridLat', 'GridLon']).size().reset_index(name='TotalCrimes')
    oq50 = overall_grid['TotalCrimes'].quantile(0.50)
    oq85 = overall_grid['TotalCrimes'].quantile(0.85)
    
    def get_overall_risk(count):
        if count <= oq50:
            return 0
        elif count <= oq85:
            return 1
        else:
            return 2
            
    overall_grid['OverallRisk'] = overall_grid['TotalCrimes'].apply(get_overall_risk)
    overall_grid.to_csv(GRID_DATA_PATH, index=False)
    
    return grid_stats

def train_model(data):
    print("Training Machine Learning Model...")
    
    X = data[['GridLat', 'GridLon', 'Hour']]
    y = data['RiskLevel']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    
    print("Model Evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(classification_report(y_test, y_pred))
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(rf, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    prepared_data = prepare_data()
    train_model(prepared_data)
    print("Data preparation and model training completed successfully!")
