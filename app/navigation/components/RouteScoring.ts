import polyline from "@mapbox/polyline";

export const riskScore: Record<string, number> = {
  Safe: 0,
  Alert: 1,
  Warning: 2,
  Critical: 3,
};

export const transportRoads = [
  "J.P. Laurel Avenue",
  "Quimpo Boulevard",
  "McArthur Highway",
  "Roxas Avenue",
  "R. Castillo Street",
  "Buhangin Road",
  "Maa Road",
  "Diversion Road",
  "Cabaguio Avenue",
  "Toril Highway",
  "Bangkal Road",
  "Lanang Road",
];
  export function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;
  
    const dLat =
      ((lat2 - lat1) * Math.PI) / 180;
  
    const dLon =
      ((lon2 - lon1) * Math.PI) / 180;
  
    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c =
      2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );
  
    return R * c;
  }


 export function calculateRouteRisk(
    coordinates: any[],
    markers: any[]
  ) {
    let highestRisk = "Safe";
  
    markers.forEach((sensor) => {
      let closestDistance = Infinity;
  
      coordinates.forEach((point) => {
        const distance = getDistanceKm(
          point[0],
          point[1],
          sensor.lat,
          sensor.lng
        );
  
        if (distance < closestDistance) {
          closestDistance = distance;
        }
      });
      console.log(
        sensor.id,
        sensor.risk_tier,
        "CLOSEST:",
        closestDistance.toFixed(2),
        "km"
      );
  
      if (closestDistance <= 5) {
        if (sensor.risk_tier === "Critical") {
          highestRisk = "Critical";
        } else if (
          sensor.risk_tier === "Warning" &&
          highestRisk !== "Critical"
        ) {
          highestRisk = "Warning";
        } else if (
          sensor.risk_tier === "Alert" &&
          highestRisk === "Safe"
        ) {
          highestRisk = "Alert";
        }
      }
    });
  
    return highestRisk;
  }
  
  export function calculateSafetyScore(
    risk: string,
    routeMinutes: number,
    fastestMinutes: number,
    criticalSensors: number
  ) {
    let score = 100;
  
    const reasons: string[] = [];
  
    switch (risk) {
      case "Alert":
        score -= 15;
        reasons.push(
          "Minor flood exposure detected."
        );
        break;
  
      case "Warning":
        score -= 30;
        reasons.push(
          "Moderate flood exposure detected."
        );
        break;
  
      case "Critical":
        score -= 50;
        reasons.push(
          "Critical flood areas nearby."
        );
        break;
  
      default:
        reasons.push(
          "Lowest flood exposure."
        );
    }
  
    const etaDifference =
      routeMinutes - fastestMinutes;
  
    if (etaDifference > 0) {
      score -= etaDifference * 2;
  
      reasons.push(
        `${etaDifference} minute longer travel time.`
      );
    } else {
      reasons.push(
        "Fastest ETA among comparable routes."
      );
    }
  
    if (criticalSensors > 0) {
      score -= criticalSensors * 10;
  
      reasons.push(
        `Avoids ${
          criticalSensors
        } critical flood sensor${
          criticalSensors > 1 ? "s" : ""
        }.`
      );
    } else {
      reasons.push(
        "No critical flood sensors nearby."
      );
    }
  
    score = Math.max(
      0,
      Math.min(score, 100)
    );
  
    return {
      score,
      reasons,
    };
  }

  export function countCriticalSensors(
    coordinates: any[],
    markers: any[]
  ) {
    let criticalCount = 0;
  
    markers.forEach((sensor) => {
      // Ignore non-critical sensors
      if (sensor.risk_tier !== "Critical") {
        return;
      }
  
      let closestDistance = Infinity;
  
      coordinates.forEach((point) => {
        const distance = getDistanceKm(
          point[0],
          point[1],
          sensor.lat,
          sensor.lng
        );
  
        if (distance < closestDistance) {
          closestDistance = distance;
        }
      });
  
      // Same 5 km threshold as your risk analysis
      if (closestDistance <= 5) {
        criticalCount++;
      }
    });
  
    return criticalCount;
  }

  

  export function analyzeRoutes(
    routes: any[],
    markers: any[]
  ) {
    if (!routes.length) {
      return {
        analyzedRoutes: [],
        recommendedRoute: null,
        sameRiskRoutes: false,
      };
    }
  
    const fastestMinutes = Math.min(
      ...routes.map(
        route =>
          route.legs?.[0]?.duration?.value / 60
      )
    );
  
    const analyzedRoutes = routes.map(
      (route: any) => {
        const decoded = polyline.decode(
          route.overview_polyline.points
        );
  
        const risk =
          calculateRouteRisk(
            decoded,
            markers
          );
  
        const criticalSensors =
          countCriticalSensors(
            decoded,
            markers
          );
  
        const routeMinutes =
          route.legs?.[0]?.duration?.value /
          60;
  
        const {
          score,
          reasons,
        } = calculateSafetyScore(
          risk,
          routeMinutes,
          fastestMinutes,
          criticalSensors
        );
  
        return {
          summary: route.summary,
  
          risk,
  
          routeData: route,
  
          safetyScore: score,
  
          reasons,
  
          criticalSensors,
          transportOverlap:
  calculateTransportOverlap(route),
        };
      }
    );
  
    const uniqueRisks = [
      ...new Set(
        analyzedRoutes.map(
          route => route.risk
        )
      ),
    ];
  
    const sameRiskRoutes =
      uniqueRisks.length === 1;
  
    analyzedRoutes.sort((a, b) => {
      const riskDifference =
        riskScore[a.risk] -
        riskScore[b.risk];
  
      if (riskDifference !== 0) {
        return riskDifference;
      }
  
      const scoreDifference =
        b.safetyScore -
        a.safetyScore;
  
      if (scoreDifference !== 0) {
        return scoreDifference;
      }
  
      const aMinutes =
        a.routeData.legs?.[0]?.duration
          ?.value ?? Infinity;
  
      const bMinutes =
        b.routeData.legs?.[0]?.duration
          ?.value ?? Infinity;
  
      return aMinutes - bMinutes;
    });
  
    return {
      analyzedRoutes,
  
      recommendedRoute:
        sameRiskRoutes
          ? null
          : analyzedRoutes[0],
  
      sameRiskRoutes,
    };
  }

  export function rerankRoutes(
    routes: any[],
    preference:
      | "flood"
      | "transport"
      | "private",

      isFloodMode: boolean
  ) {
    const sorted = [...routes];
  
    sorted.sort((a, b) => {
      if (!isFloodMode) {

        /*
          ⚡ FASTEST
        */
        if (preference === "flood") {
      
          const aETA =
            a.routeData?.legs?.[0]?.duration?.value
            ?? Infinity;
      
          const bETA =
            b.routeData?.legs?.[0]?.duration?.value
            ?? Infinity;
      
          if (aETA !== bETA) {
            return aETA - bETA;
          }
      
          const aDistance =
            a.routeData?.legs?.[0]?.distance?.value
            ?? Infinity;
      
          const bDistance =
            b.routeData?.legs?.[0]?.distance?.value
            ?? Infinity;
      
          return aDistance - bDistance;
        }

          /*
    🚌 PUBLIC
  */
  if (preference === "transport") {

    const overlapDiff =
      (b.transportOverlap ?? 0)
      - (a.transportOverlap ?? 0);

    if (overlapDiff !== 0) {
      return overlapDiff;
    }

    const aETA =
      a.routeData?.legs?.[0]?.duration?.value
      ?? Infinity;

    const bETA =
      b.routeData?.legs?.[0]?.duration?.value
      ?? Infinity;

    return aETA - bETA;
  }
    /*
    🚗 PRIVATE
  */
    const overlapDiff =
    (a.transportOverlap ?? 0)
    - (b.transportOverlap ?? 0);

  if (overlapDiff !== 0) {
    return overlapDiff;
  }

  const aETA =
    a.routeData?.legs?.[0]?.duration?.value
    ?? Infinity;

  const bETA =
    b.routeData?.legs?.[0]?.duration?.value
    ?? Infinity;

  return aETA - bETA;
}
      /*
        FLOOD SAFEST
      */
      if (preference === "flood") {
        const riskDiff =
          riskScore[a.risk] -
          riskScore[b.risk];
  
        if (riskDiff !== 0) {
          return riskDiff;
        }
  
        const scoreDiff =
          b.safetyScore -
          a.safetyScore;
  
        if (scoreDiff !== 0) {
          return scoreDiff;
        }
  
        const aETA =
          a.routeData?.legs?.[0]?.duration
            ?.value ?? Infinity;
  
        const bETA =
          b.routeData?.legs?.[0]?.duration
            ?.value ?? Infinity;
  
        return aETA - bETA;
      }
  
      /*
        PUBLIC TRANSPORT
      */
        if (preference === "transport") {
          const riskDiff =
            riskScore[a.risk] -
            riskScore[b.risk];
        
          if (riskDiff !== 0) {
            return riskDiff;
          }
        
          const overlapDiff =
            (b.transportOverlap ?? 0) -
            (a.transportOverlap ?? 0);
        
          if (overlapDiff !== 0) {
            return overlapDiff;
          }
        
          const scoreDiff =
            b.safetyScore -
            a.safetyScore;
        
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
        
          const aETA =
            a.routeData?.legs?.[0]?.duration
              ?.value ?? Infinity;
        
          const bETA =
            b.routeData?.legs?.[0]?.duration
              ?.value ?? Infinity;
        
          return aETA - bETA;
        }
  
      /*
        PRIVATE VEHICLE
      */
      const riskDiff =
        riskScore[a.risk] -
        riskScore[b.risk];
  
      if (riskDiff !== 0) {
        return riskDiff;
      }
  
      const scoreDiff =
        b.safetyScore -
        a.safetyScore;
  
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
  
      const overlapDiff =
      (a.transportOverlap ?? 0) -
      (b.transportOverlap ?? 0);
    
    if (overlapDiff !== 0) {
      return overlapDiff;
    }
    
    const aETA =
      a.routeData?.legs?.[0]?.duration
        ?.value ?? Infinity;
    
    const bETA =
      b.routeData?.legs?.[0]?.duration
        ?.value ?? Infinity;
    
    return aETA - bETA;
    });
  
    return {
      routes: sorted,
      recommendedRoute:
        sorted.length > 0
          ? sorted[0]
          : null,
    };
  }

  export function calculateTransportOverlap(
    route: any
  ) {
    const steps =
      route?.legs?.[0]?.steps ?? [];
  
    let overlap = 0;
  
    steps.forEach((step: any) => {
      const instruction =
      (
        step.html_instructions ?? ""
      )
        .replace(/<[^>]+>/g, "")
        .toLowerCase();
  
      transportRoads.forEach((road) => {
        if (
          instruction.includes(
            road.toLowerCase()
          )
        ) {
          overlap++;
        }
      });
    });
  
    return overlap;
  }