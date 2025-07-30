'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

export default function GoogleMap({ onLocationSelect, initialLocation }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [address, setAddress] = useState('');

  // Initialize map
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCuD2smYP36xkRMJP0mxsSN_qirwKp7uUg',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const defaultLocation = initialLocation || { lat: 41.7151, lng: 44.8271 }; // Default to Tbilisi
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 13,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const markerInstance = new google.maps.Marker({
          map: mapInstance,
          position: defaultLocation,
          draggable: true
        });

        // Add click listener to map
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            markerInstance.setPosition(e.latLng);
            updateLocation(e.latLng);
          }
        });

        // Add drag end listener to marker
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (position) {
            updateLocation(position);
          }
        });

        setMap(mapInstance);
        setMarker(markerInstance);
      }
    });
  }, [initialLocation]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!map || !searchValue.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchValue, componentRestrictions: { country: 'ge' } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(15);
        
        if (marker) {
          marker.setMap(null);
        }
        
        const newMarker = new google.maps.Marker({
          map,
          position: location,
          draggable: true
        });
        
        newMarker.addListener('dragend', () => {
          const position = newMarker.getPosition();
          if (position) {
            updateLocation(position);
          }
        });
        
        setMarker(newMarker);
        updateLocation(location);
      }
    });
  };

  // Update location and address
  const updateLocation = async (latLng: google.maps.LatLng) => {
    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: latLng });
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setSearchValue(address);
        setAddress(address);
        onLocationSelect({
          lat: latLng.lat(),
          lng: latLng.lng(),
          address: address
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
          placeholder=" "
        />
        <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
          searchValue ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
        }`}>
          Search Location
        </label>
        <button 
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sky-600 hover:text-sky-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
      <div className="w-full h-[220px] rounded-lg overflow-hidden">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
} 