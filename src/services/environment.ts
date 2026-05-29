export interface EnvironmentalData {
  temp: number;
  humidity: number;
  aqi: number;
  co: number;
  no2: number;
  o3: number;
  pm2_5: number;
  description: string;
  location: string;
}

export async function fetchEnvironmentalData(lat = 19.0760, lon = 72.8777): Promise<EnvironmentalData> {
  const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!response.ok) throw new Error('Weather fetch failed');
  return response.json();
}

export async function getEcoRecommendations(data: EnvironmentalData) {
  const response = await fetch('/api/ai/eco-recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  if (!response.ok) throw new Error('Eco Recommendations failed');
  return response.json();
}
