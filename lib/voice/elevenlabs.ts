// ElevenLabs client - using fetch API directly since the SDK structure may vary
let apiKey: string | null = null;

export function getElevenLabsApiKey(): string | null {
  if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || null;
  }
  return apiKey;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Note: ElevenLabs doesn't have a direct transcription API
  // This would typically use Web Speech API or another service
  // For now, we'll use the browser's Web Speech API as fallback
  throw new Error('Transcription not implemented - use Web Speech API or alternative service');
}

export async function textToSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<Blob> {
  const key = getElevenLabsApiKey();
  
  if (!key) {
    throw new Error('ElevenLabs API key not available');
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': key,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('TTS error:', error);
    throw error;
  }
}

