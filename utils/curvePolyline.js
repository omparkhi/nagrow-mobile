export function generateCurvedPolyline(start, end, curvature = 0.2, points = 40) {
  const lat1 = start.lat;
  const lng1 = start.lng;
  const lat2 = end.lat;
  const lng2 = end.lng;

  // Midpoint
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;

  // Offset for curve (perpendicular)
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;

  const controlLat = midLat + curvature * dx;
  const controlLng = midLng - curvature * dy;

  const curve = [];

  for (let i = 0; i <= points; i++) {
    const t = i / points;

    // Quadratic Bezier formula
    const lat =
      (1 - t) * (1 - t) * lat1 +
      2 * (1 - t) * t * controlLat +
      t * t * lat2;

    const lng =
      (1 - t) * (1 - t) * lng1 +
      2 * (1 - t) * t * controlLng +
      t * t * lng2;

    curve.push({ latitude: lat, longitude: lng });
  }

  return curve;
}


export function makeDottedCurve(points, gap = 3) {
  const segments = [];
  for (let i = 0; i < points.length - 1; i += gap) {
    segments.push([points[i], points[i + 1]]);
  }
  return segments;
}
