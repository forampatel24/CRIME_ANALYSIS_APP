import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, AlertOctagon } from 'lucide-react';

import { useState, useEffect } from 'react';

const mockCrimeData = [
  { name: 'Mon', crimes: 120 },
  { name: 'Tue', crimes: 140 },
  { name: 'Wed', crimes: 110 },
  { name: 'Thu', crimes: 160 },
  { name: 'Fri', crimes: 210 },
  { name: 'Sat', crimes: 250 },
  { name: 'Sun', crimes: 190 },
];

const dayTypeData = [
  { type: 'Theft', count: 400 },
  { type: 'Deceptive Practice', count: 280 },
  { type: 'Battery', count: 200 },
  { type: 'Assault', count: 120 },
];

const nightTypeData = [
  { type: 'Battery', count: 350 },
  { type: 'Robbery', count: 290 },
  { type: 'Motor Vehicle Theft', count: 250 },
  { type: 'Assault', count: 180 },
];

export default function AnalyticsPage() {
  const [currentTimeBlock, setCurrentTimeBlock] = useState('Day');
  const [currentTypeData, setCurrentTypeData] = useState(dayTypeData);
  const [areaScope, setAreaScope] = useState('Whole City');
  const [timeScope, setTimeScope] = useState('This Week');
  const [reportCount, setReportCount] = useState(2140);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
      setCurrentTimeBlock('Night');
      setCurrentTypeData(nightTypeData);
    } else {
      setCurrentTimeBlock('Day');
      setCurrentTypeData(dayTypeData);
    }
  }, []);

  // Simulate data changes based on filters
  useEffect(() => {
    let baseCount = areaScope === 'Whole City' ? 2140 : 185;
    if (timeScope === 'Last Month') baseCount *= 4.2;
    if (timeScope === 'Custom Date') baseCount = Math.floor(baseCount / 7);
    
    setReportCount(Math.floor(baseCount));
    
    // Scale charts slightly to show interactivity
    const scale = areaScope === 'Whole City' ? 1 : 0.15;
    setCurrentTypeData(prev => prev.map(d => ({ ...d, count: Math.floor(d.count * scale) })));
  }, [areaScope, timeScope]);

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Crime Data Analytics</h2>
          <p style={{ color: 'var(--text-muted)' }}>Historical trends and demographic patterns in Chicago.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Area Scope</label>
            <select className="form-input" value={areaScope} onChange={(e) => setAreaScope(e.target.value)} style={{ width: '150px', padding: '0.5rem' }}>
              <option>Whole City</option>
              <option>5km Radius</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Time Scope</label>
            <select className="form-input" value={timeScope} onChange={(e) => setTimeScope(e.target.value)} style={{ width: '150px', padding: '0.5rem' }}>
              <option>This Week</option>
              <option>Last Month</option>
              <option>Custom Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <Activity size={32} color="var(--accent-primary)" style={{ margin: '0 auto 10px' }} />
          <div className="stat-value">{reportCount.toLocaleString()}</div>
          <div className="stat-label">Total Reports ({timeScope})</div>
        </div>
        <div className="glass-panel stat-card">
          <TrendingUp size={32} color="var(--warning)" style={{ margin: '0 auto 10px' }} />
          <div className="stat-value">{areaScope === 'Whole City' ? '+12%' : '-4%'}</div>
          <div className="stat-label">Trend vs Previous</div>
        </div>
        <div className="glass-panel stat-card">
          <AlertOctagon size={32} color="var(--danger)" style={{ margin: '0 auto 10px' }} />
          <div className="stat-value">High</div>
          <div className="stat-label">Current City Threat Level</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel" style={{ height: '400px' }}>
          <h3>Crime Distribution Over Time (Weekly)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={mockCrimeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.9)', border: '1px solid var(--glass-border)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="crimes" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ height: '400px' }}>
          <h3>Crime Count by Type (Current Time: {currentTimeBlock})</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={currentTypeData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="type" type="category" stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.9)', border: '1px solid var(--glass-border)' }}
              />
              <Bar dataKey="count" fill="var(--accent-secondary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
