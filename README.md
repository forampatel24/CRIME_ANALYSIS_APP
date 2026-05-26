# Machine Learning-Based Women Safety Risk Zone Prediction System with Smart SOS

An AI/ML-powered full-stack women safety platform that analyzes historical crime data to classify locations into **Low, Medium, and High Risk Zones** and provides smart safety assistance features such as **Live Risk Maps, Smart SOS, Safe Route Navigation, Crime Analytics, and Emergency Alerts**.

---

## Project Overview

This project is designed to improve women’s safety using Machine Learning, Crime Analytics, and Interactive Map Visualization.

The system uses the **Chicago Crime Dataset** to analyze historical crime patterns and generate location-based risk predictions. Users can view crime-prone areas on a live map, analyze nearby crime statistics, trigger emergency SOS alerts, and navigate through safer routes.

> Note:  
> The system does **NOT predict future crimes**.  
> It predicts the **risk level of a location at a given time** using historical crime patterns.

---

# Main Features

## Dashboard 1 — Live Risk Map
- Interactive Chicago crime heatmap
- User live location marker
- Location-based risk prediction
- Dynamic time-based risk analysis
- High-risk zone alerts
- Nearby police station indication
- Nearest safe-zone detection
- Safe route navigation

---

## Dashboard 2 — Crime Analytics
- Crime-type distribution graphs
- Time-based crime analysis
- Area-based crime analytics
- Dynamic filtering by:
  - Time
  - Area
  - Crime category
- Interactive charts and visualizations

---

## Smart Safety Features
- Smart SOS System
- WhatsApp emergency message integration
- Emergency contact support
- Auto-alerts in dangerous zones
- Nearest safe-zone guidance
- Safe path navigation
- User profile management
- Login / Logout system

---

# Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Vanilla CSS
- React-Leaflet
- Recharts
- Lucide-React

---

## Backend
- FastAPI
- SQLite
- Uvicorn

---

## Machine Learning & Data Processing
- Python
- Pandas
- NumPy
- Scikit-Learn
- Random Forest Classifier
- Joblib

---

## Routing & Communication
- OSRM (Open Source Routing Machine)
- WhatsApp Deep Linking

---

# Machine Learning Workflow

Chicago Crime Dataset  
↓  
Data Cleaning & Preprocessing  
↓  
Feature Engineering  
↓  
Grid-based Spatial Mapping  
↓  
Crime Density Analysis  
↓  
Risk Classification  
↓  
Random Forest Model Training  
↓  
Risk Prediction  
↓  
Heatmap Visualization  
↓  
Live Dashboard Integration  

---

# Dataset Used

## Chicago Crime Dataset
Dataset Source:  
https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-present

The dataset contains:
- Crime Type
- Date & Time
- Latitude & Longitude
- Location Information
- Arrest Information

---

# Risk Classification

Locations are classified into:
- Low Risk
- Medium Risk
- High Risk

based on:
- Crime Density
- Location Patterns
- Time-based Crime Trends

---

# Machine Learning Model

## Model Used
Random Forest Classifier

## Why Random Forest?
- Handles large tabular datasets efficiently
- High classification accuracy
- Less overfitting
- Works well with spatial & temporal data
- Suitable for risk classification problems

---

# Evaluation Metrics

The model was evaluated using:
- Accuracy
- Precision
- Recall
- F1 Score

Approximate Results:
- Accuracy ≈ 99.3%
- Precision ≈ 99.3%
- Recall ≈ 99.3%
- F1 Score ≈ 99.3%

---

# Folder Structure

```bash
Women-Safety-Risk-Zone-Prediction/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── data_preparation.py
│   ├── women_safety.db
│   └── models/
│       └── risk_model.pkl
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LiveMapPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── App.jsx
│   │   └── index.css
│
├── data/
│   ├── crimes.csv
│   └── grid_risk.csv
│
└── README.md
```

---

# APIs Implemented

## Risk Prediction API
```bash
/api/predict_risk
```

## Grid Heatmap API
```bash
/api/grid_data
```

## Smart SOS API
```bash
/api/trigger_sos
```

## Authentication APIs
```bash
/api/login
/api/register
```

---

# Additional Implemented Features

## Time Machine Functionality
Users can adjust a time slider to dynamically visualize crime risk for different hours of the day.

---

## Genuine Safe Zone Detection
The backend calculates the nearest actual low-risk area mathematically instead of random suggestions.

---

## Safe Route Navigation
The system suggests safer routes using OSRM routing instead of shortest-distance routing.

---

## Auto SOS
When a user enters a high-risk zone:
- WhatsApp SOS opens automatically
- Live coordinates are shared
- Emergency backend process is triggered

---

# Future Improvements
- Real-time crime data integration
- Mobile application deployment
- Live GPS integration
- AI-based behavioral risk detection
- Voice-activated SOS system
- Integration with Indian city crime datasets

---

# Team Contributions

## Member 1 — ML & Data Processing
- Dataset preprocessing
- Feature engineering
- Grid creation
- Risk classification
- Random Forest training

## Member 2 — Backend Development
- FastAPI backend
- APIs
- Database integration
- SOS backend logic

## Member 3 — Live Risk Dashboard
- React frontend
- Heatmap visualization
- Live map integration
- Time-machine feature

## Member 4 — Analytics Dashboard
- Crime analytics graphs
- Recharts integration
- Dynamic filtering system

## Member 5 — Safety & User Features
- Smart SOS
- Safe route navigation
- User profile system
- Emergency contacts integration

---

# Installation & Setup

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# Screenshots
(Add project screenshots here)

---

# Conclusion

This project demonstrates how Machine Learning, Crime Analytics, and Interactive Map Systems can be combined to create an intelligent women safety platform. The system provides location-based risk analysis, crime visualization, and emergency safety assistance through an interactive full-stack web application.

---

# Authors
Women Safety Risk Zone Prediction Team

---

# License
This project is developed for academic and educational purposes.
