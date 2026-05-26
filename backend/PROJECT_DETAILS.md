# Women Safety Risk Zone Prediction System
## Comprehensive Project Documentation

### 1. Project Overview
This project is an advanced, full-stack predictive system designed to enhance women's safety. It uses historical crime data (specifically from Chicago) to train a Machine Learning model that classifies geographic regions into distinct safety risk levels (Low, Medium, High). The system features a real-time interactive dashboard that provides users with live risk assessments, turn-by-turn navigation to safe zones, automated SOS triggers, and detailed crime analytics.

---

### 2. Technology Stack & Rationale

#### Frontend (Client-Side)
- **React.js & Vite**: Chosen for building a fast, component-based user interface. Vite provides lightning-fast hot module replacement during development.
- **Tailwind CSS & Vanilla CSS**: Used for styling. Vanilla CSS is utilized for glassmorphism panels and the light theme aesthetic, ensuring a highly responsive and modern design.
- **Leaflet.js & React-Leaflet**: Open-source mapping libraries used because they do not require paid API keys (unlike Google Maps) while offering powerful interactive map layers and custom markers.
- **Recharts**: A highly customizable charting library used in the Analytics dashboard for visualizing crime trends over time and area.
- **Lucide-React**: Used for consistent, clean, and modern iconography across the application.

#### Backend (Server-Side)
- **FastAPI (Python)**: A modern, high-performance web framework for Python. Chosen because it handles asynchronous requests efficiently and natively supports automatic API documentation (Swagger).
- **SQLite**: A lightweight, file-based relational database. Selected because it requires no separate server setup, making it perfect for storing User Profiles and Emergency Contacts in this environment.
- **Uvicorn**: An ASGI web server used to run the FastAPI application.

#### Machine Learning & Data Processing
- **Pandas & NumPy**: Used heavily in `data_preparation.py` for cleaning large datasets, extracting time-based features, and calculating geographic grid statistics.
- **Scikit-Learn (RandomForestClassifier)**: Used for training the predictive model. Random Forest was chosen because it handles non-linear data well and resists overfitting compared to simpler models like Decision Trees.
- **Joblib**: Used to serialize (save) the trained Random Forest model into a `.pkl` file so the FastAPI backend can load it for real-time predictions without retraining.

#### Third-Party Integrations
- **OSRM (Open Source Routing Machine)**: Used for the "Simulate Safe Route" feature. It calculates real road network geometries instead of straight lines.
- **WhatsApp (`wa.me`)**: Integrated for the SOS feature via deep links to instantly open pre-drafted emergency messages with live coordinates.

---

### 3. Folder & File Structure Details

#### `/backend`
- **`data_preparation.py`**: The core data pipeline script. It loads `crimes.csv`, cleans it, extracts time features (Hour, Day), creates spatial grids (rounding Lat/Lon), calculates crime percentiles (50th and 85th), trains the RandomForest model, and exports `grid_risk.csv` and `risk_model.pkl`.
- **`main.py`**: The FastAPI server. Contains REST endpoints:
  - `/api/predict_risk`: Loads the `.pkl` model and predicts risk based on the provided time and location. It also calculates the genuine Nearest Safe Zone (a low-risk grid) and mocks a nearby Police Station.
  - `/api/grid_data`: Reads the `grid_risk.csv` and dynamically calculates the heatmap risk for a specific hour of the day.
  - `/api/trigger_sos`: Mocks sending a direct SMS to emergency contacts via a simulated backend process.
  - User Authentication endpoints (`/api/login`, `/api/register`).
- **`database.py`**: Initializes the SQLite database (`women_safety.db`) and defines schemas for `users` and `emergency_contacts`.
- **`/models/risk_model.pkl`**: The saved Machine Learning model.
- **`women_safety.db`**: The SQLite database file.

#### `/frontend`
- **`src/App.jsx`**: The main React component that handles React Router navigation and global layout (Navbar).
- **`src/index.css`**: The global stylesheet. Contains CSS variables for the Light Theme, glassmorphism panel styles, and animations (like the SOS pulse ring).
- **`src/pages/LiveMapPage.jsx`**: The core feature page. Renders the CartoDB map, time-machine slider, custom markers (Shield and Police Badge), real-time risk display, and triggers OSRM routing and WhatsApp SOS messages.
- **`src/pages/AnalyticsPage.jsx`**: Renders dynamic `Recharts` graphs. Features Area (5km vs Whole City) and Time filters that mathematically scale the mocked data for demonstration purposes.
- **`src/pages/ProfilePage.jsx`**: Manages user details and emergency contacts with a functional Edit/Save mode.

#### `/data`
- **`crimes.csv`**: The raw historical dataset.
- **`grid_risk.csv`**: The processed geographic grids used by the backend to quickly render the heatmap without parsing millions of rows.

---

### 4. Detailed Feature Upgrades

Over the course of development, the system received several major upgrades to ensure accuracy and a premium user experience:

1. **Risk Threshold Calibration**: Initially, the ML model labeled 33% of the city as "High Risk." This was upgraded to use the **85th percentile**, ensuring only genuinely dangerous areas are flagged red, making the heatmap much more accurate and realistic.
2. **Genuine Safe Zone Mapping**: Instead of randomly suggesting a nearby location, the backend was upgraded to mathematically calculate the Euclidean distance to the nearest actual "Low Risk" geographic grid.
3. **Turn-by-Turn Safe Navigation**: Upgraded the Safe Route feature to use the OSRM routing API. It now draws realistic, curved paths along the actual street network and provides written turn-by-turn navigation steps below the map.
4. **Time Machine Functionality**: Added an interactive Time Slider (0-23 hours). Adjusting this dynamically prompts the ML model to recalculate the risk map based on historical patterns for that exact time of day (e.g., higher risk at 2 AM).
5. **Auto-SOS & Deep Linking**: Upgraded the emergency system to trigger automatically upon entering a high-risk zone. It now opens a WhatsApp deep link containing live Google Maps coordinates, while simultaneously hitting a backend endpoint that logs a simulated direct SMS delivery.
6. **Dynamic Analytics Filters**: Upgraded the analytics dashboard with Area and Time scopes. The charts dynamically recalculate data sizes depending on the selected dropdown values.
7. **UI Overhaul**: Transitioned the entire frontend from a dark theme to a clean, professional Light Theme. Map markers were upgraded from default pins to custom HTML icons (Green Shields for Safe Zones, Blue Badges for Police). Profile fields were upgraded with an interactive Edit/Save toggle mode.
