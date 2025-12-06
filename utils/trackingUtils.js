// utils/trackingUtils.js
// Lightweight tracking helpers: weighted smoothing, snapping to route, dead-reckon, interpolation.

const R_EARTH = 6371e3; // meters

// simple haversine (meters)
export function haversineDistance(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const A =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
  return R_EARTH * C;
}

// exponential weighted filter (EMA)
export function weightedFilter(prev, curr, alpha = 0.35) {
  if (!prev) return curr;
  return {
    lat: prev.lat * (1 - alpha) + curr.lat * alpha,
    lng: prev.lng * (1 - alpha) + curr.lng * alpha,
  };
}

// tiny Kalman-ish smoother (independent lat/lng)
export function makeSimpleKalman(R = 0.01, Q = 3) {
  // very small, independent filters
  let xLat = null, pLat = 1;
  let xLng = null, pLng = 1;
  return {
    filter(point) {
      if (xLat === null) {
        xLat = point.lat; xLng = point.lng;
        return { lat: xLat, lng: xLng };
      }
      // predict step (identity)
      pLat = pLat + Q;
      pLng = pLng + Q;

      // update with measurement
      const kLat = pLat / (pLat + R);
      const kLng = pLng / (pLng + R);

      xLat = xLat + kLat * (point.lat - xLat);
      xLng = xLng + kLng * (point.lng - xLng);

      pLat = (1 - kLat) * pLat;
      pLng = (1 - kLng) * pLng;

      return { lat: xLat, lng: xLng };
    },
    reset() { xLat = xLng = null; pLat = pLng = 1; }
  };
}

// snap to nearest point on polyline (route polyline = array of {latitude, longitude})
// returns {lat,lng,dist} where dist = meters to nearest route point
export function snapToRoute(gps, routeCoords, radiusMeters = 30) {
  if (!routeCoords || !routeCoords.length) return { lat: gps.lat, lng: gps.lng, snapped:false };

  let best = null;
  let bestDist = Infinity;
  // brute-force nearest point — fine for route arrays < few thousands
  for (let i = 0; i < routeCoords.length; i++) {
    const p = { lat: routeCoords[i].latitude, lng: routeCoords[i].longitude };
    const d = haversineDistance(gps, p);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  if (bestDist <= radiusMeters) return { lat: best.lat, lng: best.lng, snapped:true, dist: bestDist };
  return { lat: gps.lat, lng: gps.lng, snapped:false, dist: bestDist };
}

// compute bearing in degrees from a->b
export function computeBearing(a, b) {
  if (!a || !b) return 0;
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const dLon = toRad(b.lng - a.lng);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// dead-reckon predict next position given last, speed (m/s), bearing (deg), deltaSeconds
export function predictPosition(last, speedMps, bearingDeg, deltaSeconds) {
  if (!last) return null;
  const brng = (bearingDeg * Math.PI) / 180;
  const dist = Math.max(0, speedMps * deltaSeconds); // meters
  const lat1 = last.lat * Math.PI / 180;
  const lng1 = last.lng * Math.PI / 180;
  const R = R_EARTH;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist / R) + Math.cos(lat1) * Math.sin(dist / R) * Math.cos(brng));
  const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(dist / R) * Math.cos(lat1), Math.cos(dist / R) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: lat2 * 180 / Math.PI, lng: lng2 * 180 / Math.PI };
}

// create an array of interpolated points between 'from' and 'to' with approx step meters
// stepMeters default ~2.5 (smooth)
export function interpolatePath(from, to, stepMeters = 2.5) {
  const dist = haversineDistance(from, to);
  if (dist <= 0) return [to];
  const steps = Math.max(1, Math.ceil(dist / stepMeters));
  const out = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    out.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    });
  }
  return out;
}

// smartProcess: takes lastState and incoming raw gps, returns an object:
// { uiFrames: [{lat,lng}], emitPoint: {lat,lng} }
// - uiFrames: list of intermediate points to animate locally (small steps)
// - emitPoint: the canonical point you should persist/emit to server (snapped or raw)
export function smartProcess({
  lastState,        // { filtered, kalman, lastRaw, lastTime, lastSpeed, lastBearing }
  rawGps,           // { lat, lng, timestamp (ms) }
  routeCoords = [], // optional polyline for snapping
  config = {}
}) {
  // config defaults
  const {
    alpha = 0.35,       // weighted filter coefficient
    snapRadius = 30,    // meters within which snap to route
    stepMeters = 3,     // meters per interpolation step
    minStepIntervalMs = 50, // frame interval for ui animation
    maxInterpolationDistance = 80 // if distance huge, we limit interpolation
  } = config;

  const nowTs = rawGps.timestamp || Date.now();
  const lastTs = lastState?.lastTime || nowTs;
  const dt = Math.max(0.001, (nowTs - lastTs) / 1000); // seconds

  // 1) weighted filter
  const filtered = weightedFilter(lastState?.filtered || rawGps, rawGps, alpha);

  // 2) optional kalman
  const kalman = lastState?.kalman ? lastState.kalman.filter(filtered) : filtered;

  // 3) snap to route if close
  const snapped = snapToRoute(kalman, routeCoords, snapRadius);
  const emitPoint = { lat: snapped.lat, lng: snapped.lng };

  // 4) compute speed & bearing
  let speedMps = lastState?.lastSpeed || 0;
  if (lastState?.lastRaw) {
    const rawDist = haversineDistance(lastState.lastRaw, rawGps); // meters
    speedMps = rawDist / Math.max(0.001, dt);
  }
  const bearing = computeBearing(lastState?.filtered || rawGps, emitPoint);

  // 5) prediction (dead-reckon) — small lookahead if dt is large
  const lookAheadSec = Math.min(1.5, dt); // small lookahead
  const predicted = predictPosition(emitPoint, speedMps, bearing, lookAheadSec) || emitPoint;

  // 6) interpolation: produce UI frames from last filtered position -> predicted (or emitPoint)
  const from = lastState?.uiPos || lastState?.filtered || rawGps;
  const to = predicted;
  let frames = interpolatePath({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng }, stepMeters);

  // cap frames if too many (protect performance)
  if (frames.length > 200) {
    const cap = Math.ceil(200);
    const every = Math.ceil(frames.length / cap);
    frames = frames.filter((_, idx) => idx % every === 0);
  }

  // prepare new state
  const newState = {
    filtered,
    kalman: lastState?.kalman || null, // keep kalman instance outside
    lastRaw: rawGps,
    lastTime: nowTs,
    lastSpeed: speedMps,
    lastBearing: bearing,
    uiPos: frames.length ? frames[frames.length - 1] : emitPoint,
  };

  return { uiFrames: frames, emitPoint, newState, snapped: snapped.snapped };
}
