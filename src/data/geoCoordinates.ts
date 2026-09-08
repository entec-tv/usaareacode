/**
 * Geographic Centroids and Coordinates for North American Telecom Mapping.
 * Covers US States, Canadian Provinces/Territories, Caribbean NANP Island nations,
 * and major metropolitan rate centers.
 */

import type { AreaCode } from "./areaCodes";

export const STATE_CENTROIDS: Record<string, [number, number]> = {
  // US States + Territories
  AL: [32.806671, -86.79113],
  AK: [61.370716, -152.404419],
  AZ: [33.729759, -111.431221],
  AR: [34.969704, -92.373123],
  CA: [36.778259, -119.417931],
  CO: [39.550051, -105.782067],
  CT: [41.603221, -73.087749],
  DE: [38.910832, -75.52767],
  DC: [38.907192, -77.036871],
  FL: [27.766279, -81.686783],
  GA: [32.165622, -82.900075],
  HI: [19.896766, -155.582782],
  ID: [44.068202, -114.742041],
  IL: [40.633125, -89.398528],
  IN: [40.267194, -86.134902],
  IA: [41.878003, -93.097702],
  KS: [39.011902, -98.484246],
  KY: [37.839333, -84.270018],
  LA: [30.984298, -91.962333],
  ME: [45.253783, -69.445469],
  MD: [39.045755, -76.641271],
  MA: [42.407211, -71.382437],
  MI: [44.314844, -85.602364],
  MN: [46.729553, -94.6859],
  MS: [32.354668, -89.398528],
  MO: [37.964253, -91.831833],
  MT: [46.879682, -110.362566],
  NE: [41.492537, -99.901813],
  NV: [38.80261, -116.419389],
  NH: [43.193852, -71.572395],
  NJ: [40.058324, -74.405661],
  NM: [34.51994, -105.87009],
  NY: [43.0, -75.0],
  NC: [35.759573, -79.0193],
  ND: [47.551493, -101.002012],
  OH: [40.417287, -82.907123],
  OK: [35.007752, -97.092877],
  OR: [43.804133, -120.554201],
  PA: [41.203322, -77.194525],
  RI: [41.580095, -71.477429],
  SC: [33.836081, -81.163725],
  SD: [43.969515, -99.901813],
  TN: [35.517491, -86.580447],
  TX: [31.968599, -99.901813],
  UT: [39.32098, -111.093731],
  VT: [44.558803, -72.577841],
  VA: [37.431573, -78.656894],
  WA: [47.751074, -120.740139],
  WV: [38.597626, -80.454903],
  WI: [43.78444, -88.787868],
  WY: [43.075968, -107.290284],

  // Territories
  PR: [18.220833, -66.590149],
  VI: [18.3358, -64.8963],
  GU: [13.4443, 144.7937],
  AS: [-14.271, -170.1322],
  MP: [15.0979, 145.6739],

  // Canadian Provinces & Territories
  ON: [43.7, -79.42], // Toronto / Southern Ontario focus
  QC: [45.5017, -73.5673], // Montreal / Quebec Corridor
  BC: [49.2827, -123.1207], // Vancouver / SW BC
  AB: [51.0447, -114.0719], // Calgary / Edmonton
  MB: [49.8951, -97.1384], // Winnipeg
  SK: [52.1332, -106.67], // Saskatoon
  NS: [44.6488, -63.5752], // Halifax
  NB: [46.0878, -64.7782], // Moncton
  NL: [47.5615, -52.7126], // St. John's
  PE: [46.2382, -63.1311], // Charlottetown
  NT: [62.454, -114.3718], // Yellowknife
  YT: [60.7212, -135.0568], // Whitehorse
  NU: [63.7467, -68.517], // Iqaluit

  // Caribbean Nations (+1 NANP)
  BS: [25.0343, -77.3963], // Bahamas (242)
  JM: [18.0179, -76.8099], // Jamaica (876, 658)
  BB: [13.1939, -59.5432], // Barbados (246)
  GD: [12.1165, -61.679], // Grenada (473)
  DO: [18.4861, -69.9312], // Dominican Republic (809, 829, 849)
  TT: [10.6918, -61.2225], // Trinidad & Tobago (868)
  AG: [17.1274, -61.8468], // Antigua & Barbuda (268)
  BM: [32.3078, -64.7505], // Bermuda (441)
  CYM: [19.3133, -81.2546], // Cayman Islands (345)
  VG: [18.4207, -64.64], // British Virgin Islands (284)
  TC: [21.694, -71.7979], // Turks & Caicos (649)
  LC: [13.9094, -60.9789], // Saint Lucia (758)
  DM: [15.415, -61.371], // Dominica (767)
  VC: [13.2528, -61.1971], // St. Vincent (784)
  KN: [17.3578, -62.783], // St. Kitts & Nevis (869)
  MSR: [16.7425, -62.1874], // Montserrat (664)
  SX: [18.0425, -63.0548], // Sint Maarten (721)
  AI: [18.2206, -63.0686], // Anguilla (264)
};

export const MAJOR_CITIES_COORDS: Record<string, [number, number]> = {
  // US Major Metros
  "New York City": [40.7128, -74.006],
  Manhattan: [40.7831, -73.9712],
  Brooklyn: [40.6782, -73.9442],
  Bronx: [40.8448, -73.8648],
  Queens: [40.7282, -73.7949],
  Buffalo: [42.8864, -78.8784],
  Rochester: [43.1566, -77.6088],
  Albany: [42.6526, -73.7562],
  Syracuse: [43.0481, -76.1474],

  "Los Angeles": [34.0522, -118.2437],
  "San Francisco": [37.7749, -122.4194],
  "San Diego": [32.7157, -117.1611],
  "San Jose": [37.3382, -121.8863],
  Sacramento: [38.5816, -121.4944],
  Oakland: [37.8044, -122.2712],
  Fresno: [36.7468, -119.7726],
  "Long Beach": [33.7701, -118.1937],
  Bakersfield: [35.3733, -119.0187],
  Anaheim: [33.8366, -117.9143],
  Riverside: [33.9806, -117.3755],

  Houston: [29.7604, -95.3698],
  Dallas: [32.7767, -96.797],
  Austin: [30.2672, -97.7431],
  "San Antonio": [29.4241, -98.4936],
  "Fort Worth": [32.7555, -97.3308],
  "El Paso": [31.7619, -106.485],

  Chicago: [41.8781, -87.6298],
  Springfield: [39.7817, -89.6501],
  Peoria: [40.6936, -89.589],

  Miami: [25.7617, -80.1918],
  Orlando: [28.5383, -81.3792],
  Tampa: [27.9506, -82.4572],
  Jacksonville: [30.3322, -81.6557],
  Tallahassee: [30.4383, -84.2807],
  "Fort Lauderdale": [26.1224, -80.1373],

  Atlanta: [33.749, -84.388],
  Savannah: [32.0809, -81.0912],
  Augusta: [33.4735, -82.0105],

  Philadelphia: [39.9526, -75.1652],
  Pittsburgh: [40.4406, -79.9959],
  Harrisburg: [40.2732, -76.8867],

  Boston: [42.3601, -71.0589],
  Worcester: [42.2626, -71.8023],

  Detroit: [42.3314, -83.0458],
  "Grand Rapids": [42.9634, -85.6681],

  Seattle: [47.6062, -122.3321],
  Spokane: [47.6588, -117.426],

  Phoenix: [33.4484, -112.074],
  Tucson: [32.2226, -110.9747],

  Denver: [39.7392, -104.9903],
  "Colorado Springs": [38.8339, -104.8214],

  "Las Vegas": [36.1699, -115.1398],
  Reno: [39.5296, -119.8138],

  "Salt Lake City": [40.7608, -111.891],
  Nashville: [36.1627, -86.7816],
  Memphis: [35.1495, -90.049],
  Knoxville: [35.9606, -83.9207],

  "New Orleans": [29.9511, -90.0715],
  "Baton Rouge": [30.4515, -91.1871],

  Minneapolis: [44.9778, -93.265],
  "St. Paul": [44.9537, -93.09],

  "St. Louis": [38.627, -90.1994],
  "Kansas City": [39.0997, -94.5786],

  Indianapolis: [39.7684, -86.1581],
  Columbus: [39.9612, -82.9988],
  Cleveland: [41.4993, -81.6944],
  Cincinnati: [39.1031, -84.512],

  Charlotte: [35.2271, -80.8431],
  Raleigh: [35.7796, -78.6382],

  // Canadian Metros
  Toronto: [43.6532, -79.3832],
  Montreal: [45.5017, -73.5673],
  Vancouver: [49.2827, -123.1207],
  Calgary: [51.0447, -114.0719],
  Edmonton: [53.5461, -113.4938],
  Ottawa: [45.4215, -75.6972],
  "Quebec City": [46.8139, -71.208],
  Winnipeg: [49.8951, -97.1384],
  Hamilton: [43.2557, -79.8711],
  London: [42.9849, -81.2453],
  Halifax: [44.6488, -63.5752],
  Victoria: [48.4284, -123.3656],
  Windsor: [42.3149, -83.0364],
  Saskatoon: [52.1332, -106.67],
  Regina: [50.4547, -104.6067],
  "St. John's": [47.5615, -52.7126],

  // Caribbean
  Nassau: [25.0479, -77.3554],
  Kingston: [18.0179, -76.8099],
  "Montego Bay": [18.4762, -77.8939],
  Bridgetown: [13.106, -59.6132],
  "Santo Domingo": [18.4861, -69.9312],
  "Port of Spain": [10.6549, -61.5019],
  Hamilton_BM: [32.2949, -64.783],
  "George Town": [19.2869, -81.3674],
};

/**
 * Returns accurate geographic coordinates for a given AreaCode.
 * Uses city lookup first, then state centroid, with slight deterministic offset
 * for overlaid codes so pins are distinguishable.
 */
export function getAreaCodeCoordinates(item: AreaCode): [number, number] {
  // 1. Check primary cities
  for (const city of item.cities) {
    const trimmed = city.trim();
    if (MAJOR_CITIES_COORDS[trimmed]) {
      const base = MAJOR_CITIES_COORDS[trimmed]!;
      return applyDeterministicOffset(base, item.code);
    }
  }

  // 2. Check state centroid
  if (STATE_CENTROIDS[item.region]) {
    const base = STATE_CENTROIDS[item.region]!;
    return applyDeterministicOffset(base, item.code);
  }

  // 3. Fallback to US Center
  return applyDeterministicOffset([39.8283, -98.5795], item.code);
}

function applyDeterministicOffset(
  [lat, lng]: [number, number],
  code: string,
): [number, number] {
  const num = parseInt(code, 10) || 0;
  // Deterministic micro-spread (±0.08 deg ~ 5-8km) so overlaid codes separate cleanly
  const angle = ((num * 137.5) % 360) * (Math.PI / 180);
  const radius = 0.04 + ((num % 7) * 0.015);
  const offsetLat = Math.sin(angle) * radius;
  const offsetLng = Math.cos(angle) * radius;
  return [Number((lat + offsetLat).toFixed(5)), Number((lng + offsetLng).toFixed(5))];
}
