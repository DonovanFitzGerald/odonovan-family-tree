export interface Person {
	index?: number[];
	first_name: string;
	nickname: string;
	last_name: string;
	spouse?: string | null;
	birth?: {
		date: string;
		location: string;
	};
	death?: {
		date: string;
		location: string;
	};
	background_color?: string;
	text_color?: string;
	children?: Person[];
}

export interface TreeState {
	activePersonIndex: number[] | null;
	highlightedAncestors: number[][] | [];
	highlightedDescendants: number[][] | [];
	highlightedPersons: number[][] | [];
	showTooltip: boolean;
	tooltipPosition: { x: number; y: number };
}
