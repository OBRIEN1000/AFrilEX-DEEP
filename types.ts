export interface Translation {
  language: string;
  translatedWord: string;
  pronunciation: string;
  family: string;
  region: string;
  similarityGroup: number; // For clustering similar sounding words
  notes?: string;
}

export interface ResearchResult {
  sourceWord: string;
  translations: Translation[];
  linguisticAnalysis: string;
}

export enum AppState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface SimulationNode {
  id: string;
  group: number;
  family: string;
  language: string;
  word: string;
  r?: number; // radius
  
  // d3 simulation properties
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface SimulationLink {
  source: string | SimulationNode;
  target: string | SimulationNode;
  value: number;
  
  // d3 simulation properties
  index?: number;
}