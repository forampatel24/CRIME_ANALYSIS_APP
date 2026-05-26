import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { AlertTriangle, MapPin, Navigation, ShieldAlert, Phone } from 'lucide-react';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const safeZoneIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
         </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const policeIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
         </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Default Chicago location
const defaultLocation = [41.8781, -87.6298];

function LocationSelector({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LiveMapPage() {
  const [position, setPosition] = useState(defaultLocation);
  const [riskData, setRiskData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [safeRoute, setSafeRoute] = useState(null);
  const [directions, setDirections] = useState([]);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());

  // Load heatmap data on mount and when hour changes
  useEffect(() => {
    axios.get(`http://localhost:8000/api/grid_data?hour=${selectedHour}`)
      .then(res => setHeatmapData(res.data.data || []))
      .catch(err => console.error("Failed to load heatmap data", err));
  }, [selectedHour]);

  // Predict risk when position or hour changes
  useEffect(() => {
    setLoading(true);
    
    // Construct a date with the selected hour
    const dt = new Date();
    dt.setHours(selectedHour, 0, 0, 0);

    axios.post('http://localhost:8000/api/predict_risk', {
      latitude: position[0],
      longitude: position[1],
      datetime_iso: dt.toISOString()
    })
    .then(res => {
      // Check if we just entered a High-Risk zone
      const isNewHighRisk = res.data.risk_level === 'High' && riskData?.risk_level !== 'High';
      setRiskData(res.data);
      
      if (isNewHighRisk) {
        window.triggerAlert("WARNING: You have entered a High-Risk Zone! Auto-triggering SOS...");
        // Auto trigger SOS
        handleSos(true);
      }
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [position, selectedHour]);

  const handleSos = (isAuto = false) => {
    if (riskData?.risk_level === 'Low' && !isAuto) {
      alert("You are in a safe zone. SOS not urgently required, but proceeding.");
    }
    setSosActive(true);
    window.triggerAlert("SOS ACTIVATED! Preparing WhatsApp message and notifying backend...");
    
    // Notify Backend (Mock Twilio SMS to Emergency Contacts)
    // We hardcode user_id: 1 for demo purposes
    axios.post('http://localhost:8000/api/trigger_sos', {
      user_id: 1,
      latitude: position[0],
      longitude: position[1]
    }).then(res => {
      console.log(res.data.message);
    }).catch(err => console.error("Failed to trigger backend SOS", err));

    // WhatsApp Integration
    const message = encodeURIComponent(`URGENT (SOS)! I feel unsafe. My current location is: https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    
    // Open WhatsApp in a new tab
    if (!isAuto) {
      window.open(whatsappUrl, '_blank');
    }
    
    setTimeout(() => setSosActive(false), 8000);
  };

  const getRiskColor = (level) => {
    if (level === 'High') return 'var(--danger)';
    if (level === 'Medium') return 'var(--warning)';
    return 'var(--success)';
  };

  const calculateRoute = () => {
    // If a safe zone exists, route to it. Otherwise, mock a nearby destination
    const destLat = riskData?.nearest_safe_zone?.latitude || position[0] + 0.05;
    const destLon = riskData?.nearest_safe_zone?.longitude || position[1] + 0.05;

    // Use free OSRM routing API to get a real road route
    axios.get(`https://router.project-osrm.org/route/v1/driving/${position[1]},${position[0]};${destLon},${destLat}?overview=full&geometries=geojson`)
    .then(res => {
      const coords = res.data.routes[0].geometry.coordinates;
      // OSRM returns [lon, lat], Leaflet polyline expects [lat, lon]
      const latLonCoords = coords.map(c => [c[1], c[0]]);
      setSafeRoute(latLonCoords);
      
      const distKm = (res.data.routes[0].distance / 1000).toFixed(1);
      const durationMin = Math.ceil(res.data.routes[0].duration / 60);

      const mockDirections = [
        `Head towards the nearest Safe Zone (${distKm} km away).`,
        `Estimated travel time: ${durationMin} minutes.`,
        "Stay on main, well-lit roads.",
        "Avoid dark alleys and follow the route shown on the map.",
        "You will arrive at the Safe Zone shortly."
      ];
      setDirections(mockDirections);
    })
    .catch(err => {
      console.error("OSRM Route error", err);
      // Fallback to straight line if OSRM fails
      setSafeRoute([position, [destLat, destLon]]);
      setDirections(["Head directly towards the safe zone.", "Stay on main roads."]);
    });
  };

  return (
    <div className="dashboard-grid">
      <div className="glass-panel" style={{ height: '70vh', padding: 0, overflow: 'hidden' }}>
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker position={position}>
            <Popup>You are here</Popup>
          </Marker>
          <LocationSelector setPosition={setPosition} />
          
          {/* Render Heatmap circles based on overall risk */}
          {heatmapData.map((grid, idx) => (
            <Circle 
              key={idx}
              center={[grid.GridLat, grid.GridLon]}
              radius={400}
              pathOptions={{
                color: grid.OverallRisk === 2 ? '#ef4444' : grid.OverallRisk === 1 ? '#f59e0b' : '#10b981',
                fillOpacity: 0.2,
                weight: 0
              }}
            />
          ))}

          {/* Render Nearest Safe Zone if available */}
          {riskData?.nearest_safe_zone && riskData.risk_level !== 'Low' && (
            <Marker position={[riskData.nearest_safe_zone.latitude, riskData.nearest_safe_zone.longitude]} icon={safeZoneIcon} zIndexOffset={1000}>
              <Popup><b>Nearest Safe Zone</b><br/>Low crime area.</Popup>
            </Marker>
          )}

          {/* Render Police Station if available */}
          {riskData?.police_station && riskData.risk_level !== 'Low' && (
            <Marker position={[riskData.police_station.latitude, riskData.police_station.longitude]} icon={policeIcon} zIndexOffset={1000}>
              <Popup>
                <b>{riskData.police_station.name}</b><br/>
                <a href={`tel:${riskData.police_station.phone}`}>{riskData.police_station.phone}</a>
              </Popup>
            </Marker>
          )}

          {/* Render Safe Route Polyline */}
          {safeRoute && (
            <Polyline 
              positions={safeRoute} 
              color="#0ea5e9" 
              weight={5} 
              dashArray="10, 10" 
            />
          )}
        </MapContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3><MapPin size={20} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Current Status</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Lat: {position[0].toFixed(4)}, Lon: {position[1].toFixed(4)}
          </p>
          
          <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Real-time Risk Level</h4>
            {loading ? (
              <h2 style={{ margin: '10px 0', color: 'var(--text-main)' }}>Analyzing...</h2>
            ) : (
              <h1 style={{ 
                margin: '10px 0', fontSize: '3rem', 
                color: riskData ? getRiskColor(riskData.risk_level) : 'var(--text-main)',
                background: 'none', WebkitTextFillColor: 'initial'
              }}>
                {riskData?.risk_level || 'Unknown'}
              </h1>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Time Machine (Select Hour)</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="range" 
                min="0" max="23" 
                value={selectedHour} 
                onChange={(e) => setSelectedHour(parseInt(e.target.value))} 
                style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
              />
              <span style={{ fontWeight: 'bold', width: '45px' }}>{selectedHour}:00</span>
            </div>
            <small style={{ color: 'var(--text-muted)' }}>Heatmap and risk predict for this hour.</small>
          </div>
        </div>

        <div className="glass-panel">
          <h3><ShieldAlert size={20} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Smart SOS</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Instantly alert emergency contacts and local authorities with your live location.
          </p>
          <button 
            className={`btn btn-danger ${sosActive ? 'sos-active' : ''}`} 
            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
            onClick={() => handleSos()}
          >
            <Phone size={24} /> TRIGGER SOS
          </button>
        </div>

        <div className="glass-panel">
          <h3><Navigation size={20} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Route Safety</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Find the safest route to your destination, avoiding high-risk zones.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={calculateRoute}>
            Simulate Safe Route
          </button>
          
          {safeRoute && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--success)', marginBottom: '10px' }}>Safe Route Navigation:</h4>
              <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {directions.map((dir, idx) => (
                  <li key={idx}>{dir}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
