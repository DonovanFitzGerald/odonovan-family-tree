import { Person } from "./types";

/**
 * Compare two index paths safely.
 */
export function isIndexEqual(
	a?: number[] | null,
	b?: number[] | null
): boolean {
	if (!a || !b) return false;
	if (a.length !== b.length) return false;
	return a.every((val, idx) => val === b[idx]);
}

/**
 * Assign a stable index to every node in the tree.
 * The root is always [0], then each child appends its
 * sibling position to its parent's index.
 */
export function assignIndex(
	person: Person,
	parentIndex: number[] = [],
	siblingIdx = 0
): Person {
	const currentIndex =
		parentIndex.length === 0 ? [0] : [...parentIndex, siblingIdx];

	return {
		...person,
		index: currentIndex,
		children: (person.children ?? []).map((child, idx) =>
			assignIndex(
				{
					...child,
					background_color:
						child.background_color == null ||
						child.background_color === ""
							? person.background_color
							: child.background_color,
					text_color:
						child.text_color == null || child.text_color === ""
							? person.text_color
							: child.text_color,
				},
				currentIndex,
				idx
			)
		),
	};
}

/**
 * Depth‑first lookup by index path.
 */
export function findPersonByIndex(
	root: Person,
	path: number[]
): Person | undefined {
	if (!path?.length || path[0] !== 0) return undefined;

	let node: Person | undefined = root;
	for (let i = 1; i < path.length; i++) {
		const idx = path[i];
		if (!node?.children || idx < 0 || idx >= node.children.length) return;
		node = node.children[idx];
	}
	return node;
}

/**
 * All ancestor paths for a given path, excluding the node itself.
 * e.g. [0,2,1] ➔ [[0], [0,2]]
 */
export function getHighlightedAncestors(path: number[]): number[][] {
	const ancestors: number[][] = [];
	for (let i = 1; i < path.length; i++) {
		ancestors.push(path.slice(0, i));
	}
	return ancestors;
}

export function getDescendants(person: Person): number[][] {
	const result: number[][] = [];

	const walk = (p: Person) => {
		for (const child of p.children ?? []) {
			result.push(child.index);
			walk(child);
		}
	};

	walk(person);
	return result;
}

/**
 * Collect every descendant index path of a node.
 */
export function getHighlightedDescendants(person: Person): number[][] {
	const result: number[][] = [];

	const walk = (p: Person) => {
		if (!p.children?.length) return;

		let firstChild = p.children[0];
		for (const child of p.children) {
			const last = child.index[child.index.length - 1];
			const currentMin = firstChild.index[firstChild.index.length - 1];
			if (last < currentMin) firstChild = child;
		}

		result.push(firstChild.index);
		walk(firstChild);
	};

	walk(person);
	return result;
}

/**
 * Build consecutive parent-child pairs from an ordered list of active indexes.
 *
 * @example
 *   makeRelationPairs([[0], [0,2], [0,2,0]]);
 *   → [ { parent:[0],   child:[0,2]   },
 *       { parent:[0,2], child:[0,2,0] } ]
 */
export function makeRelationPairs(
	active: number[]
): { parent: number[]; child: number[] }[] {
	const pairs: { parent: number[]; child: number[] } = [];
	for (let i = 0; i < active.length - 1; i++) {
		pairs.push({ parent: active[i], child: active[i + 1] });
	}
	return pairs;
}

/**
 * Utility helpers for UI.
 */
export function formatPersonName(person: Person): string {
	return `${person.first_name ?? ""} ${
		person.nickname ? `(${person.nickname}) ` : ""
	}${person.last_name ?? ""}`.trim();
}

export function getDisplayName(person: Person, personActive = false): string {
	return personActive && person.spouse
		? `${person.first_name ?? ""} ${
				person.nickname ? `(${person.nickname}) ` : ""
		  }${person.last_name ?? ""} and ${person.spouse}`
		: `${person.first_name ?? ""} ${
				person.nickname ? `(${person.nickname}) ` : ""
		  }`.trim();
}
