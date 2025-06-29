import { Person, PositionedPerson, TreeDimensions } from "./types";

/**
 * Generate a recursive ID based on node structure and position
 */
export function generateId(
	person: Person,
	parentId: string = "",
	siblingIndex: number = 0
): string {
	if (parentId === "") {
		return "root";
	}
	return `${parentId}-${siblingIndex}`;
}

/**
 * Format display name for a person
 */
export function formatPersonName(person: Person): string {
	const parts: string[] = [];

	if (person.first_name) {
		parts.push(person.first_name);
	}

	if (person.nickname) {
		parts.push(`"${person.nickname}"`);
	}

	if (person.last_name) {
		parts.push(`'${person.last_name}`);
	}

	return parts.join(" ");
}

/**
 * Calculate tree dimensions based on the family data
 */
export function calculateTreeDimensions(rootPerson: Person): TreeDimensions {
	const maxGeneration = getMaxGeneration(rootPerson);
	const maxSiblingsInGeneration = getMaxSiblingsInGeneration(rootPerson);

	return {
		width: Math.max(800, maxSiblingsInGeneration * 120 + 100),
		height: (maxGeneration + 1) * 120 + 100,
		generationHeight: 120,
		nodeWidth: 100,
		nodeHeight: 40,
		horizontalSpacing: 120,
		verticalSpacing: 120,
	};
}

/**
 * Get the maximum generation depth
 */
function getMaxGeneration(person: Person, currentGeneration = 0): number {
	if (!person.children || person.children.length === 0) {
		return currentGeneration;
	}

	return Math.max(
		...person.children.map((child) =>
			getMaxGeneration(child, currentGeneration + 1)
		)
	);
}

/**
 * Get the maximum number of siblings in any generation
 */
function getMaxSiblingsInGeneration(person: Person): number {
	const generationCounts: number[] = [];

	function countSiblingsAtGeneration(p: Person, generation: number) {
		if (!generationCounts[generation]) {
			generationCounts[generation] = 0;
		}
		generationCounts[generation]++;

		if (p.children) {
			p.children.forEach((child) =>
				countSiblingsAtGeneration(child, generation + 1)
			);
		}
	}

	countSiblingsAtGeneration(person, 0);
	return Math.max(...generationCounts);
}

/**
 * Position all nodes in the tree with proper layout
 */
export function positionTreeNodes(
	rootPerson: Person,
	dimensions: TreeDimensions
): PositionedPerson {
	// First pass: assign generations and IDs
	const withGenerations = assignGenerations(rootPerson, 0);

	// Second pass: calculate positions
	const positioned = calculatePositions(withGenerations, dimensions);

	return positioned;
}

/**
 * Assign generation numbers and IDs to all nodes
 */
function assignGenerations(
	person: Person,
	generation: number,
	parentId: string = "",
	siblingIndex: number = 0
): PositionedPerson {
	const id = person.id || generateId(person, parentId, siblingIndex);

	const positioned: PositionedPerson = {
		...person,
		id,
		generation,
		x: 0, // Will be calculated later
		y: generation * 120 + 50,
		children: person.children?.map((child, index) =>
			assignGenerations(child, generation + 1, id, index)
		),
	};

	return positioned;
}

/**
 * Calculate X positions for all nodes
 */
function calculatePositions(
	person: PositionedPerson,
	dimensions: TreeDimensions,
	siblingIndex = 0,
	totalSiblings = 1
): PositionedPerson {
	// Calculate positions for children first (bottom-up approach)
	if (person.children && person.children.length > 0) {
		person.children = person.children.map((child, index) =>
			calculatePositions(
				child,
				dimensions,
				index,
				person.children!.length
			)
		);

		// Position parent centered above children
		const childrenXPositions = person.children.map((child) => child.x);
		const minX = Math.min(...childrenXPositions);
		const maxX = Math.max(...childrenXPositions);
		person.x = (minX + maxX) / 2;
	} else {
		// Leaf node: position based on sibling index
		const totalWidth = (totalSiblings - 1) * dimensions.horizontalSpacing;
		const startX = dimensions.width / 2 - totalWidth / 2;
		person.x = startX + siblingIndex * dimensions.horizontalSpacing;
	}

	return person;
}

/**
 * Get all ancestors of a person
 */
export function getAncestors(
	personId: string,
	rootPerson: PositionedPerson,
	ancestors: Set<string> = new Set()
): Set<string> {
	function findAncestorsRecursive(
		current: PositionedPerson,
		targetId: string
	): boolean {
		if (current.id === targetId) {
			return true;
		}

		if (current.children) {
			for (const child of current.children) {
				if (findAncestorsRecursive(child, targetId)) {
					ancestors.add(current.id);
					return true;
				}
			}
		}

		return false;
	}

	findAncestorsRecursive(rootPerson, personId);
	return ancestors;
}

/**
 * Get all descendants of a person
 */
export function getDescendants(
	person: PositionedPerson,
	descendants: Set<string> = new Set()
): Set<string> {
	if (person.children) {
		person.children.forEach((child) => {
			descendants.add(child.id);
			getDescendants(child, descendants);
		});
	}

	return descendants;
}

/**
 * Find a person by ID in the tree
 */
export function findPersonById(
	rootPerson: PositionedPerson,
	targetId: string
): PositionedPerson | null {
	if (rootPerson.id === targetId) {
		return rootPerson;
	}

	if (rootPerson.children) {
		for (const child of rootPerson.children) {
			const found = findPersonById(child, targetId);
			if (found) return found;
		}
	}

	return null;
}

/**
 * Format display name for a person (including spouse if present)
 */
export function getDisplayName(
	person: Person,
	showSpouse: boolean = false
): string {
	const personName = formatPersonName(person);
	if (showSpouse && person.spouse) {
		return `${personName} and ${person.spouse}`;
	}
	return personName;
}
