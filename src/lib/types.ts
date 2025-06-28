export interface Person {
  id?: string;
  name: string;
  spouse?: string | null;
  children?: Person[];
}

export interface PositionedPerson extends Person {
  x: number;
  y: number;
  generation: number;
  id: string;
  children?: PositionedPerson[];
}

export interface TreeDimensions {
  width: number;
  height: number;
  generationHeight: number;
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}

export interface TreeState {
  selectedPersonId: string | null;
  highlightedAncestors: Set<string>;
  highlightedDescendants: Set<string>;
  showTooltip: boolean;
  tooltipPosition: { x: number; y: number };
}
