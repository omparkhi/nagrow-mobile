export function calBearing(p, c) {
    if (!p) return 0;
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;

    const lat1 = toRad(p.lat);
    const lon1 = toRad(p.lng);
    const lat2 = toRad(c.lat);
    const lon2 = toRad(c.lng);

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    return ((toDeg(Math.atan2(y, x)) + 360) % 360);
}