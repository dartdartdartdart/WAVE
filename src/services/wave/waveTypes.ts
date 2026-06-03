export interface WaveMarker {
    id: string;
    title: string;
  
    position: {
      lat: number;
      lng: number;
    };
  
    risk_tier: string;
    alert_level: number;
  
    water_rise_m?: number;
    distance_to_water_m?: number;
  
    message: string;
  }