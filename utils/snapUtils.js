// utils/snapUtils.js

const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
};

export const getSnapToRoadLocation = (riderLoc, routeCoords) => {
  if (!routeCoords || routeCoords.length < 2) return riderLoc;

  let minDistance = Infinity;
  let closestPoint = riderLoc;
  
  // We iterate through every line segment in the route
  for (let i = 0; i < routeCoords.length - 1; i++) {
    const A = { lat: routeCoords[i].latitude, lng: routeCoords[i].longitude };
    const B = { lat: routeCoords[i+1].latitude, lng: routeCoords[i+1].longitude };
    const P = riderLoc;

    // Project point P onto line segment AB
    const AP = { lat: P.lat - A.lat, lng: P.lng - A.lng };
    const AB = { lat: B.lat - A.lat, lng: B.lng - A.lng };
    
    const ab2 = AB.lat * AB.lat + AB.lng * AB.lng;
    const ap_ab = AP.lat * AB.lat + AP.lng * AB.lng;
    
    let t = ap_ab / ab2;

    // Clamp t to the segment (0 to 1)
    if (t < 0) t = 0;
    else if (t > 1) t = 1;

    const projectedPoint = {
      lat: A.lat + AB.lat * t,
      lng: A.lng + AB.lng * t,
    };

    const dist = getDistance(P, projectedPoint);

    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = projectedPoint;
    }
  }

  // THRESHOLD CHECK:
  // If the rider is extremely far from the route (> 40 meters approx in lat/lng units),
  // assume they went off-road (e.g., parking lot) and DO NOT snap.
  // 0.0004 degrees is roughly 40-50 meters.
  if (minDistance > 0.0004) {
      return riderLoc;
  }

  return closestPoint;
};




