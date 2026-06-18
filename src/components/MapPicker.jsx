import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const MapPicker = ({ 
  latitude, 
  longitude, 
  onLocationSelect, 
  readOnly = false,
  height = '300px'
}) => {
  const { lang } = useLanguage();
  const [mapId] = useState(() => 'map-' + Math.floor(100000 + Math.random() * 900000));
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const defaultLat = latitude ? parseFloat(latitude) : 32.8872;
  const defaultLng = longitude ? parseFloat(longitude) : 13.1913;

  useEffect(() => {
    if (!window.L) {
      console.error('Leaflet script not loaded on window.');
      return;
    }

    // Set custom default icon to bypass Vite bundle path issues
    const DefaultIcon = window.L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    window.L.Marker.prototype.options.icon = DefaultIcon;

    // Initialize Map
    const map = window.L.map(mapId, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      scrollWheelZoom: !readOnly,
      dragging: !readOnly,
      touchZoom: !readOnly
    });

    mapRef.current = map;

    // Add OpenStreetMap tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Place Marker
    const marker = window.L.marker([defaultLat, defaultLng], {
      draggable: !readOnly
    }).addTo(map);

    markerRef.current = marker;

    // Map Event listeners (Only active if writable)
    if (!readOnly) {
      // Map click handler to place marker
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        await triggerLocationChange(lat, lng);
      });

      // Marker drag-end handler
      marker.on('dragend', async (e) => {
        const { lat, lng } = e.target.getLatLng();
        await triggerLocationChange(lat, lng);
      });

      // Handle GPS locate trigger
      map.on('locationfound', async (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], 15);
        await triggerLocationChange(lat, lng);
      });
    }

    return () => {
      map.remove();
    };
  }, [mapId]);

  // Handle external updates to coordinates (e.g. autofill)
  useEffect(() => {
    if (mapRef.current && markerRef.current && latitude && longitude) {
      const latVal = parseFloat(latitude);
      const lngVal = parseFloat(longitude);
      markerRef.current.setLatLng([latVal, lngVal]);
      mapRef.current.setView([latVal, lngVal], mapRef.current.getZoom());
    }
  }, [latitude, longitude]);

  // Geocoding helper using OpenStreetMap's Nominatim API
  const reverseGeocode = async (lat, lng) => {
    setLoadingGeocode(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'ar, en' } }
      );
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    } catch (err) {
      console.warn('Geocoding search failed', err);
    } finally {
      setLoadingGeocode(false);
    }
    return '';
  };

  const triggerLocationChange = async (lat, lng) => {
    if (!onLocationSelect) return;
    const address = await reverseGeocode(lat, lng);
    onLocationSelect({
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      address
    });
  };

  const handleLocateMe = (e) => {
    e.preventDefault();
    if (mapRef.current) {
      mapRef.current.locate({ setView: true, maxZoom: 16 });
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${defaultLat},${defaultLng}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {/* Map DOM Wrapper */}
      <div 
        id={mapId} 
        style={{ 
          height, 
          width: '100%', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          zIndex: 5,
          position: 'relative'
        }}
      />

      {/* Map Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
        
        {/* Writable Options: Locate me */}
        {!readOnly ? (
          <button
            onClick={handleLocateMe}
            className="btn btn-outline"
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.75rem', 
              gap: '0.4rem', 
              backgroundColor: 'var(--surface-color)' 
            }}
          >
            <Navigation size={14} className="animate-pulse" />
            {lang === 'ar' ? 'تحديد موقعي الحالي GPS' : 'Use Current GPS Location'}
          </button>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>
            {lang === 'ar' ? `الإحداثيات: ${defaultLat}, ${defaultLng}` : `Coordinates: ${defaultLat}, ${defaultLng}`}
          </span>
        )}

        {/* Loader geocode / Open in google maps link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {loadingGeocode && (
            <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
              {lang === 'ar' ? 'جاري جلب العنوان...' : 'Resolving address...'}
            </span>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.75rem', 
              gap: '0.4rem', 
              border: 'none',
              color: 'var(--secondary)'
            }}
          >
            <ExternalLink size={14} />
            {lang === 'ar' ? 'فتح في خرائط Google' : 'Open in Google Maps'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
