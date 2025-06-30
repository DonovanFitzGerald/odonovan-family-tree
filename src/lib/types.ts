export type UnindexedPerson = Omit<Person, "index">;

export interface Person {
	index: number[];
	first_name: string;
	nickname: string | null;
	last_name: string | null;
	spouse?: string | null;
	birth?: {
		date: string | null;
		location: string | null;
	};
	death?: {
		date: string | null;
		location: string | null;
	};
	background_color?: string | null;
	text_color?: string | null;
	children?: Person[];
}

export interface PositionedPerson extends Person {
	x: number;
	y: number;
	id: string;
	children?: PositionedPerson[];
}

export interface TreeState {
	activePersonIndex: number[] | null;
	highlightedAncestors: number[][] | [];
	highlightedDescendants: number[][] | [];
	highlightedPersons: number[][] | [];
	showTooltip: boolean;
	tooltipPosition: { x: number; y: number };
}
