'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

interface Location {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}
// Data from https://gis.aacounty.org/arcgis/rest/services/OpenData/Structure_OpenData/MapServer/7/query?outFields=*&where=1%3D1&f=geojson
const locations: Location[] = [
  { id: '1', name: 'Annapolis', coordinates: [-76.4922, 38.9784] },
  { id: '2', name: 'Chesapeake Bay', coordinates: [-76.4806, 38.8951] },
  {
    id: '3',
    name: 'Rhode River Marina',
    coordinates: [-76.525031613371667, 38.892212272942153],
  },
  {
    id: '4',
    name: 'Holiday Point Marina',
    coordinates: [-76.511438642680744, 38.904689108505288],
  },
  {
    id: '5',
    name: 'Holiday Hill Marina',
    coordinates: [-76.521537189762611, 38.893538758487857],
  },
  // Add more locations as needed
];

const locationsToGeoJSON = (locations: Location[]) => {
  return {
    type: 'FeatureCollection',
    features: locations.map((location) => ({
      type: 'Feature',
      properties: {
        id: location.id,
        title: location.name,
      },
      geometry: {
        type: 'Point',
        coordinates: location.coordinates,
      },
    })),
  };
};

const MapboxMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    const initMap = new mapboxgl.Map({
      container: mapContainer.current!,
      style: `mapbox://styles/mapbox/light-v11`,
      center: [-76.4922, 38.9784], // Default center
      zoom: 9,
    });

    initMap.on('load', () => {
      initMap.addSource('locationPoints', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      initMap.addLayer({
        id: 'locationPointsLayer',
        type: 'circle',
        source: 'locationPoints',
        paint: {
          'circle-radius': 6,
          'circle-color': '#007cbf',
        },
      });
    });

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // Show popup on hover
    initMap.on('mouseenter', 'locationPointsLayer', (e) => {
      initMap.getCanvas().style.cursor = 'pointer';

      const coordinates = e.features![0].geometry.coordinates.slice();
      const description = e.features![0].properties!.title;

      popup.setLngLat(coordinates).setHTML(description).addTo(initMap);
    });

    initMap.on('mouseleave', 'locationPointsLayer', () => {
      initMap.getCanvas().style.cursor = '';
      popup.remove();
    });

    setMap(initMap);

    return () => initMap.remove();
  }, []);

  useEffect(() => {
    if (map) {
      const geojsonData = {
        type: 'FeatureCollection',
        features: selectedLocations.map((location) => ({
          type: 'Feature',
          properties: { id: location.id, title: location.name },
          geometry: { type: 'Point', coordinates: location.coordinates },
        })),
      };

      const source = map.getSource('locationPoints') as mapboxgl.GeoJSONSource;
      if (source) source.setData(geojsonData);
    }
  }, [selectedLocations, map]);

  const handleCheckboxChange = (changedLocation: Location) => {
    setSelectedLocations((prev) => {
      const isExisting = prev.some(
        (location) => location.id === changedLocation.id
      );
      if (isExisting) {
        return prev.filter((location) => location.id !== changedLocation.id);
      } else {
        return [...prev, changedLocation];
      }
    });
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedLocations(!selectAll ? locations : []);
  };

  return (
    <>
      <style>
        {`
          .custom-popup .mapboxgl-popup-content {
            background-color: black !important;
            color: white !important;
          }
        `}
      </style>
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flexBasis: '20%', padding: '1rem', overflowY: 'auto' }}>
          <div>
            <input
              type="checkbox"
              id="selectAll"
              checked={selectAll}
              onChange={toggleSelectAll}
            />
            <label htmlFor="selectAll">Select All</label>
          </div>
          {locations.map((location) => (
            <div key={location.id}>
              <input
                type="checkbox"
                id={location.id}
                checked={selectedLocations.some(
                  (sel) => sel.id === location.id
                )}
                onChange={() => handleCheckboxChange(location)}
              />
              <label htmlFor={location.id}>{location.name}</label>
            </div>
          ))}
        </div>
        <div ref={mapContainer} style={{ flexGrow: 1 }} />
      </div>
    </>
  );
};

export default MapboxMap;
