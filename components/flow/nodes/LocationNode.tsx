'use client';

import { useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { geocodeRegion } from '@/lib/places/googlePlaces';
import type { LocationNodeData } from '@/types/flow';

export function LocationNode(props: NodeProps) {
  const { data, id } = props;
  const nodeData = data as unknown as LocationNodeData;
  const [region, setRegion] = useState(nodeData.region || '');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeocode = useCallback(async () => {
    if (!region.trim()) {
      setError('Please enter a region');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const result = await geocodeRegion(region);
      nodeData.region = result.region;
      nodeData.coordinates = result.coordinates;
    } catch (err: any) {
      console.error('Geocoding failed:', err);
      setError(err.message || 'Failed to find region');
      nodeData.coordinates = undefined;
    } finally {
      setIsGeocoding(false);
    }
  }, [region, nodeData]);

  // Generate Google Maps embed URL
  const getMapEmbedUrl = () => {
    if (!nodeData.region) return null;
    
    // Use Google Maps Embed API with API key for better control
    // If we have coordinates, use them for precise pin placement
    if (nodeData.coordinates) {
      const { lat, lng } = nodeData.coordinates;
      // Standard embed format - works without API key in URL
      return `https://www.google.com/maps?q=${lat},${lng}&output=embed&z=10`;
    } else {
      // Use region name for search
      const encodedRegion = encodeURIComponent(nodeData.region);
      return `https://www.google.com/maps?q=${encodedRegion}&output=embed&z=10`;
    }
  };

  const mapUrl = getMapEmbedUrl();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-orange-500 w-96 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg">Location</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGeocode()}
              placeholder="Enter city, country, or region..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleGeocode}
              disabled={isGeocoding}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeocoding ? '...' : '📍'}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-1">{error}</div>
          )}
        </div>

        {mapUrl && nodeData.coordinates && (
          <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapUrl}
              title="Location Map"
            />
          </div>
        )}

        {!mapUrl && nodeData.region && (
          <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-700 rounded">
            Region: {nodeData.region}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}

