const API_BASE = "http://49.149.165.142:8080";

export async function fetchWaveMapMarkers() {
  const response = await fetch(
    `${API_BASE}/api/map/markers`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch markers");
  }

  return response.json();
}

export async function fetchWaveFloodData() {
  const response = await fetch(
    `${API_BASE}/api/flood`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch flood data");
  }

  return response.json();
}