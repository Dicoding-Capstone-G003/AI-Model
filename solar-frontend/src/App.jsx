import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  MapContainer, TileLayer, Marker, Popup, useMap
} from 'react-leaflet';
import L from 'leaflet';
import './App.css';

/* ================= CONFIG ================= */
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const PANEL_EFFICIENCY = 0.8;

/* ================= MAP ICON ================= */
const customMarker = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

/* ================= STATIC DATA ================= */
const REGIONS = [
  { name: "Sumatra", lat: -0.5897, lon: 101.3431 },
  { name: "Jawa", lat: -7.6145, lon: 110.7122 },
  { name: "Kalimantan", lat: -0.2787, lon: 111.4753 },
  { name: "Sulawesi", lat: -2.0833, lon: 120.8333 },
  { name: "Nusa Tenggara", lat: -8.6500, lon: 117.3667 },
  { name: "Maluku", lat: -3.2333, lon: 130.1500 },
  { name: "Papua", lat: -4.2667, lon: 138.0833 },
];

/* ================= HELPERS ================= */
const calculateOutput = (ghi, systemSize) => {
  return parseFloat(((ghi / 1000) * systemSize * PANEL_EFFICIENCY).toFixed(2));
};

const processChartData = (forecastHours, rawArray, systemSize) => {
  if (!forecastHours || !rawArray) return [];
  return forecastHours.map((time, i) => ({
    jam: time.substring(11, 16),
    "Output (kWh)": calculateOutput(rawArray[i], systemSize)
  }));
};

const processSummary = (rawArray, systemSize) => {
  if (!rawArray || rawArray.length === 0) return { peak: 0, avg: 0, low: 0, reliability: 0 };
  
  const dayData = rawArray.filter(v => v > 10);
  const peak = Math.max(...rawArray);
  const avg = dayData.reduce((a, b) => a + b, 0) / (dayData.length || 1);
  const low = dayData.length > 0 ? Math.min(...dayData) : 0;

  return {
    peak: calculateOutput(peak, systemSize),
    avg: calculateOutput(avg, systemSize),
    low: calculateOutput(low, systemSize),
    reliability: (avg / (peak || 1)).toFixed(2)
  };
};

/* ================= MAP ANIMATION (FIXED BUG LAG) ================= */
// Kita pecah props menjadi lat dan lon (tipe data primitif) agar useEffect tidak looping
function MapUpdater({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 5, { animate: true, duration: 1.5 });
  }, [lat, lon, map]); // Sekarang aman karena tidak memantau Array
  return null;
}

/* ================= MAIN COMPONENT ================= */
function App() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[2]);
  const [systemSize, setSystemSize] = useState(1);

  // OPTIMASI: Gabungkan state raw data menjadi satu object agar lebih rapi
  const [apiData, setApiData] = useState({ hours: [], predictions: [] });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ================= 1. FETCH DATA (Hanya jalan saat Ganti Pulau) ================= */
  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_URL}/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region_name: selectedRegion.name })
        });

        if (!res.ok) throw new Error('Backend tidak merespons.');

        const result = await res.json();
        
        // Simpan data mentah sekaligus
        setApiData({
          hours: result.forecast_hours,
          predictions: result.model_prediction
        });

      } catch (err) {
        setError(err.message || 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [selectedRegion]);

  /* ================= 2. DERIVED STATE (Jurus Anti-Lag) ================= */
  // useMemo akan menghitung ulang HANYA jika apiData atau systemSize berubah.
  // Ini menghilangkan 2x proses render layar (berkedip) yang tidak berguna.
  
  const chartData = useMemo(() => {
    return processChartData(apiData.hours, apiData.predictions, systemSize);
  }, [apiData, systemSize]);

  const summary = useMemo(() => {
    return processSummary(apiData.predictions, systemSize);
  }, [apiData, systemSize]);

  /* ================= RENDER ================= */
  return (
    <div className="dashboard-container">

      <div className="header">
        <h1>☀️ Solar PV Intelligence</h1>
        <p>Estimasi energi harian berbasis AI</p>
      </div>

      <div className="main-content">
        <div className="left-panel">

          {/* CONFIGURATION */}
          <div className="card">
            <h3>Konfigurasi Sistem</h3>

            <label className="form-label">Pilih Pulau</label>
            <select
              className="custom-select"
              value={selectedRegion.name}
              onChange={(e) =>
                setSelectedRegion(REGIONS.find(r => r.name === e.target.value))
              }
            >
              {REGIONS.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>

            <label className="form-label">Ukuran Sistem PV</label>
            <select
              className="custom-select"
              value={systemSize}
              onChange={(e) => setSystemSize(Number(e.target.value))}
            >
              <option value={1}>1 kWp</option>
              <option value={3}>3 kWp</option>
              <option value={5}>5 kWp</option>
            </select>
          </div>

          {/* SUMMARY BOXES */}
          <div className="card">
            <h3>Estimasi Harian ({selectedRegion.name})</h3>

            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Memproses data AI...</p>
              </div>
            )}

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            {!loading && !error && apiData.predictions.length > 0 && (
              <div className="summary-grid">
                <div className="summary-box green">
                  <p>Peak</p>
                  <h2>{summary.peak} kWh</h2>
                </div>
                <div className="summary-box orange">
                  <p>Average</p>
                  <h2>{summary.avg} kWh</h2>
                </div>
                <div className="summary-box gray">
                  <p>Low</p>
                  <h2>{summary.low} kWh</h2>
                </div>
                <div className="summary-box blue">
                  <p>Reliability</p>
                  <h2>{summary.reliability}</h2>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* MAP */}
        <div className="right-panel">
          <MapContainer
            center={[selectedRegion.lat, selectedRegion.lon]}
            zoom={5}
            className="map-container"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Pass data primitif (angka), jangan lempar Array untuk menghindari bug lag */}
            <MapUpdater lat={selectedRegion.lat} lon={selectedRegion.lon} />

            {REGIONS.map(region => (
              <Marker
                key={region.name}
                position={[region.lat, region.lon]}
                icon={customMarker}
                eventHandlers={{
                  click: () => setSelectedRegion(region)
                }}
              >
                <Popup>{region.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* CHART */}
      {!loading && !error && chartData.length > 0 && (
        <div className="card">
          <h3>Prediksi 24 Jam</h3>

          <div className="chart-container">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="jam" stroke="#64748b" fontSize={12} tickMargin={10} />
                <YAxis stroke="#64748b" fontSize={12} tickMargin={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />

                <Area
                  type="monotone"
                  dataKey="Output (kWh)"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOutput)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;