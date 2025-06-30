export type Gender = "male" | "female" | "neutral";

export type Index = number[];

export interface Person {
	index: Index;
	first_name: string;
	nickname: string | null;
	last_name: string | null;
	spouse?: string | null;
	gender: Gender;
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

export type UnindexedPerson = Omit<Person, "index">;

export interface PositionedPerson extends Person {
	x: number;
	y: number;
	id: string;
	children?: PositionedPerson[];
}

export interface TreeState {
	primarySelectedPersonIndex: Index | null;
	secondarySelectedPersonIndex: Index | null;
	activeSelection: "primary" | "secondary";
	highlightedAncestors: Index[] | [];
	highlightedDescendants: Index[] | [];
	highlightedPersons: Index[] | [];
	showTooltip: boolean;
	tooltipPosition: { x: number; y: number };
}
