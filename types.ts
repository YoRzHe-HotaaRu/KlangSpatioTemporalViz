// types.ts

/**
 * Represents the category of a node on the map.
 */
export enum NodeType {
  TRANSIT_HUB = 'Transit Hub',
  ATTRACTION = 'Attraction',
  COMMERCIAL = 'Commercial',
  RESIDENTIAL = 'Residential'
}

/**
 * Represents a location in the Klang Valley network.
 * We use a simplified coordinate system (0-100) for the schematic map,
 * and real lat/lng for the geospatial map.
 */
export interface MapNode {
  id: string;
  name: string;
  type: NodeType;
  x: number; // Percentage X (0-100) for Schematic
  y: number; // Percentage Y (0-100) for Schematic
  lat: number; // Latitude
  lng: number; // Longitude
  description: string;
  basePopularity: number; // 0-1
}

/**
 * Represents a connection (Transit Line) between two nodes.
 */
export interface MapLink {
  source: string; // Node ID
  target: string; // Node ID
  lineName: string; // e.g., "Kelana Jaya Line"
  color: string;
}

/**
 * Data snapshot for a specific hour of the day.
 */
export interface HourlyData {
  hour: number;
  totalRidership: number;
  averageSentiment: number; // -1 to 1
  congestionLevel: number; // 0 to 1
}

/**
 * Structure for the AI Analysis report.
 */
export interface AIAnalysisReport {
  timestamp: string;
  summary: string;
  identifiedTrends: string[];
  recommendations: string[];
}