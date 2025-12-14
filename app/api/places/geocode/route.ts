import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { region } = await req.json();

    if (!region || typeof region !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Region is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Use Geocoding API to convert region text to coordinates
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', region);
    url.searchParams.set('key', apiKey);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geocoding API error:', errorText);
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Region not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    return new Response(
      JSON.stringify({
        region,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        formattedAddress: result.formatted_address,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Geocoding error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to geocode region' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

