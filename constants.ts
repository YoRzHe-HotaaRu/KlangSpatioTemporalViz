import { MapNode, MapLink, NodeType } from './types';

/**
 * Schematic representation of key Klang Valley locations.
 * Coordinates are relative (0-100) for SVG rendering.
 * Lat/Lng are approximate real-world coordinates.
 */
export const KLANG_VALLEY_NODES: MapNode[] = [
  { 
    id: 'kl_sentral', 
    name: 'KL Sentral', 
    type: NodeType.TRANSIT_HUB, 
    x: 30, y: 60, 
    lat: 3.1341, lng: 101.6865,
    description: 'The main transportation hub of Kuala Lumpur.', 
    basePopularity: 1.0 
  },
  { 
    id: 'klcc', 
    name: 'KLCC', 
    type: NodeType.ATTRACTION, 
    x: 55, y: 45, 
    lat: 3.1575, lng: 101.7118,
    description: 'Home to the Petronas Twin Towers.', 
    basePopularity: 0.95 
  },
  { 
    id: 'bukit_bintang', 
    name: 'Bukit Bintang', 
    type: NodeType.COMMERCIAL, 
    x: 50, y: 55, 
    lat: 3.1466, lng: 101.7115,
    description: 'Major shopping and entertainment district.', 
    basePopularity: 0.9 
  },
  { 
    id: 'pasar_seni', 
    name: 'Pasar Seni', 
    type: NodeType.ATTRACTION, 
    x: 35, y: 55, 
    lat: 3.1422, lng: 101.6965,
    description: 'Central Market and cultural hub.', 
    basePopularity: 0.7 
  },
  { 
    id: 'batu_caves', 
    name: 'Batu Caves', 
    type: NodeType.ATTRACTION, 
    x: 35, y: 15, 
    lat: 3.2374, lng: 101.6839,
    description: 'Limestone hill with a series of caves and cave temples.', 
    basePopularity: 0.8 
  },
  { 
    id: 'trx', 
    name: 'TRX Exchange', 
    type: NodeType.COMMERCIAL, 
    x: 60, y: 60, 
    lat: 3.1419, lng: 101.7197,
    description: 'New financial district.', 
    basePopularity: 0.75 
  },
  { 
    id: 'bangsar', 
    name: 'Bangsar', 
    type: NodeType.RESIDENTIAL, 
    x: 20, y: 65, 
    lat: 3.1292, lng: 101.6784,
    description: 'Affluent residential suburb.', 
    basePopularity: 0.6 
  },
  { 
    id: 'mid_valley', 
    name: 'Mid Valley', 
    type: NodeType.COMMERCIAL, 
    x: 25, y: 75, 
    lat: 3.1176, lng: 101.6773,
    description: 'Large megamall complex.', 
    basePopularity: 0.85 
  },
  { 
    id: 'subang_jaya', 
    name: 'Subang Jaya', 
    type: NodeType.RESIDENTIAL, 
    x: 10, y: 80, 
    lat: 3.0757, lng: 101.5865,
    description: 'Major residential city.', 
    basePopularity: 0.65 
  },
  { 
    id: 'putrajaya', 
    name: 'Putrajaya', 
    type: NodeType.ATTRACTION, 
    x: 50, y: 95, 
    lat: 2.9264, lng: 101.6964,
    description: 'Federal administrative centre.', 
    basePopularity: 0.5 
  },
];

export const NETWORK_LINKS: MapLink[] = [
  // Kelana Jaya Line (Red/Pink)
  { source: 'subang_jaya', target: 'bangsar', lineName: 'Kelana Jaya Line', color: '#ef4444' },
  { source: 'bangsar', target: 'kl_sentral', lineName: 'Kelana Jaya Line', color: '#ef4444' },
  { source: 'kl_sentral', target: 'pasar_seni', lineName: 'Kelana Jaya Line', color: '#ef4444' },
  { source: 'pasar_seni', target: 'klcc', lineName: 'Kelana Jaya Line', color: '#ef4444' },
  
  // Kajang Line (Green)
  { source: 'kl_sentral', target: 'pasar_seni', lineName: 'Kajang Line', color: '#22c55e' }, // Interchange
  { source: 'pasar_seni', target: 'bukit_bintang', lineName: 'Kajang Line', color: '#22c55e' },
  { source: 'bukit_bintang', target: 'trx', lineName: 'Kajang Line', color: '#22c55e' },
  
  // Commuter / ERL (Blue)
  { source: 'batu_caves', target: 'kl_sentral', lineName: 'KTM Komuter', color: '#3b82f6' },
  { source: 'kl_sentral', target: 'mid_valley', lineName: 'KTM Komuter', color: '#3b82f6' },
  { source: 'mid_valley', target: 'subang_jaya', lineName: 'KTM Komuter', color: '#3b82f6' },
  
  // Putrajaya Line (Yellow/Gold)
  { source: 'trx', target: 'putrajaya', lineName: 'Putrajaya Line', color: '#eab308' },
  { source: 'klcc', target: 'trx', lineName: 'Putrajaya Line', color: '#eab308' }, // Loose connection for schematic
];

// Helper to simulate data based on time
export const getSimulatedTraffic = (hour: number, basePop: number): number => {
  // Simple bell curve simulation for 2 peaks (Morning 8am, Evening 6pm)
  const morningPeak = Math.exp(-Math.pow(hour - 8, 2) / 8);
  const eveningPeak = Math.exp(-Math.pow(hour - 18, 2) / 8);
  const baseTraffic = 0.2;
  const trafficModifier = morningPeak + eveningPeak + baseTraffic;
  return Math.min(100, Math.floor(basePop * trafficModifier * 100)); // normalized 0-100
};