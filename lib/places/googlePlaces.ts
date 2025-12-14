export interface GeocodeResult {
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
}

export async function geocodeRegion(region: string): Promise<GeocodeResult> {
  const response = await fetch('/api/places/geocode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ region }),
  });

  if (!response.ok) {
    throw new Error('Failed to geocode region');
  }

  const data = await response.json();
  return data;
}

