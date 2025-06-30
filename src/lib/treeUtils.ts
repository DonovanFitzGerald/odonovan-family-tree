import { Gender, Index, Person, UnindexedPerson } from "./types";

/**
 * Compare two index paths safely.
 */
export function isIndexEqual(a?: Index | null, b?: Index | null): boolean {
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
	person: UnindexedPerson,
	parentIndex: Index = [],
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
	path: Index
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
export function getHighlightedAncestors(path: Index): Index[] {
	const ancestors: Index[] = [];
	for (let i = 1; i < path.length; i++) {
		ancestors.push(path.slice(0, i));
	}
	return ancestors;
}

export function getDescendants(person: Person): Index[] {
	const result: Index[] = [];

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
export function getHighlightedDescendants(person: Person): Index[] {
	const result: Index[] = [];

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

type Relationship = {
	american: string;
	irish: string;
};

export interface RelateResult {
	personA: Relationship; // A ➜ B
	personB: Relationship; // B ➜ A
}

const ord = (n: number) =>
	n === 1 ? "first" : n === 2 ? "second" : n === 3 ? "third" : `${n}th`;

const repeat = (s: string, n: number) => Array(n).fill(s).join("");

const pick = (g: Gender, male: string, female: string, neutral: string) =>
	g === "male" ? male : g === "female" ? female : neutral;

/**
 * How are “A” and “B” related?
 *
 * @param aPath  index path for person A  (e.g. [0,2,1])
 * @param bPath  index path for person B
 * @param genderA  gender of A  ("male" | "female" | "neutral")
 * @param genderB  gender of B
 */
export function relate(personA: Person, personB: Person): RelateResult {
	const aPath = personA.index!;
	const bPath = personB.index!;
	const genderA = personA.gender;
	const genderB = personB.gender;

	/* 1. lowest common ancestor depth */
	let i = 0;
	while (i < aPath.length && i < bPath.length && aPath[i] === bPath[i]) i++;
	const upA = aPath.length - i;
	const upB = bPath.length - i;

	/* 2. build American terms */
	const amA = americanTerm(upA, upB, genderB);
	const amB = americanTerm(upB, upA, genderA);

	/* 3. translate to Irish usage where it differs */
	const irA = irishTerm(amA, upA, upB, genderB);
	const irB = irishTerm(amB, upB, upA, genderA);

	return {
		personA: { american: amA, irish: irA },
		personB: { american: amB, irish: irB },
	};
}

function americanTerm(
	upSelf: number,
	upOther: number,
	genderOther: Gender
): string {
	/* direct descendant ------------------------------------------ */
	if (upSelf === 0) {
		if (upOther === 0) return "self";

		if (upOther === 1) return pick(genderOther, "son", "daughter", "child");

		if (upOther === 2)
			return pick(genderOther, "grandson", "granddaughter", "grandchild");

		const prefix = repeat("great-", upOther - 2);
		return pick(
			genderOther,
			`${prefix}grandson`,
			`${prefix}granddaughter`,
			`${prefix}grandchild`
		);
	}

	/* direct ancestor -------------------------------------------- */
	if (upOther === 0) {
		if (upSelf === 1)
			return pick(genderOther, "father", "mother", "parent");

		if (upSelf === 2)
			return pick(
				genderOther,
				"grandfather",
				"grandmother",
				"grandparent"
			);

		const prefix = repeat("great-", upSelf - 2);
		return pick(
			genderOther,
			`${prefix}grandfather`,
			`${prefix}grandmother`,
			`${prefix}grandparent`
		);
	}

	/* same generation -------------------------------------------- */
	if (upSelf === upOther) {
		if (upSelf === 1)
			return pick(genderOther, "brother", "sister", "sibling");

		const degree = upSelf - 1; // 1 → first cousin …
		return `${ord(degree)} cousin`;
	}

	/* cousins removed -------------------------------------------- */
	const cousinDeg = Math.min(upSelf, upOther) - 1;
	const removed = Math.abs(upSelf - upOther);
	return `${ord(cousinDeg)} cousin ${ord(removed)} removed`;
}

/* Irish usage tweaks for two “removed” cases */
function irishTerm(
	am: string,
	upSelf: number,
	upOther: number,
	genderOther: Gender
): string {
	// Parent's cousin  (A↑1, B↑2)  →  aunt / uncle
	if (upSelf === 1 && upOther === 2)
		return pick(genderOther, "uncle", "aunt", "aunt / uncle");

	// Cousin's child   (A↑2, B↑1)  →  nephew / niece
	if (upSelf === 2 && upOther === 1)
		return pick(genderOther, "nephew", "niece", "nephew / niece");

	return am; // otherwise identical
}
