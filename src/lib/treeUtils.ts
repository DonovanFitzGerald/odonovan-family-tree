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

type RelationshipStrings = { american: string; irish: string };
export interface RelateResult {
	personA: RelationshipStrings; // how A calls B
	personB: RelationshipStrings; // how B calls A
	lcaIndex: Index; // path of their closest common ancestor
}

/* ───────── tiny helpers ───────── */

const ord = (n: number) =>
	[
		"first",
		"second",
		"third",
		"fourth",
		"fifth",
		"sixth",
		"seventh",
		"eighth",
		"ninth",
		"tenth",
	][n - 1] ?? `${n}th`;

const repeat = (s: string, n: number) => Array(n).fill(s).join("");

const pick = (g: Gender, m: string, f: string, n: string) =>
	g === "male" ? m : g === "female" ? f : n;

/* ───────── main API ───────── */

export function relate(personA: Person, personB: Person): RelateResult {
	const aPath = personA.index;
	const bPath = personB.index;
	const gA = personA.gender;
	const gB = personB.gender;

	/* 1 ─ Lowest-common-ancestor depth & slice */
	let split = 0;
	while (
		split < aPath.length &&
		split < bPath.length &&
		aPath[split] === bPath[split]
	)
		split++;

	const lcaIndex = aPath.slice(0, split); // may be [] if unrelated
	const upA = aPath.length - split; // steps A → LCA
	const upB = bPath.length - split; // steps B → LCA

	/* 2 ─ relationship strings */
	const americanA = american(upA, upB, gB);
	const americanB = american(upB, upA, gA);
	const irishA = irish(americanA, upA, upB, gB);
	const irishB = irish(americanB, upB, upA, gA);

	return {
		personA: { american: americanA, irish: irishA },
		personB: { american: americanB, irish: irishB },
		lcaIndex,
	};
}

/* ───────── American canon ───────── */

function american(upSelf: number, upOther: number, gOther: Gender): string {
	/* self = ancestor / descendant / self */
	if (upSelf === 0) return descendant(upOther, gOther);
	if (upOther === 0) return ancestor(upSelf, gOther);

	/* siblings & cousins share the same depth to LCA */
	if (upSelf === upOther) {
		if (upSelf === 1) return pick(gOther, "brother", "sister", "sibling");
		return `${ord(upSelf - 1)} cousin`;
	}

	/* direct collateral line (aunt/uncle ↔ niece/nephew) */
	const closer = Math.min(upSelf, upOther);
	const away = Math.max(upSelf, upOther);
	const diff = away - closer;

	if (closer === 1) {
		// one side is a child of the LCA
		const greats = diff - 1; // 0 → aunt/uncle; 1 → great-aunt …
		const elder = upSelf < upOther; // elder ⇒ aunt/uncle
		const base = elder
			? pick(gOther, "uncle", "aunt", "aunt / uncle")
			: pick(gOther, "nephew", "niece", "nephew / niece");
		return `${repeat("great-", greats)}${base}`;
	}

	/* everybody else = cousins removed */
	const degree = closer - 1; // first / second …
	const removed = diff; // once / twice removed …
	return `${ord(degree)} cousin ${ord(removed)} removed`;
}

/* direct-line helpers ---------------------------------------------------- */
const ancestor = (steps: number, g: Gender) => {
	if (steps === 1) return pick(g, "father", "mother", "parent");
	if (steps === 2)
		return pick(g, "grandfather", "grandmother", "grandparent");
	const prefix = repeat("great-", steps - 2);
	return pick(
		g,
		`${prefix}grandfather`,
		`${prefix}grandmother`,
		`${prefix}grandparent`
	);
};

const descendant = (steps: number, g: Gender) => {
	if (steps === 0) return "self";
	if (steps === 1) return pick(g, "son", "daughter", "child");
	if (steps === 2) return pick(g, "grandson", "granddaughter", "grandchild");
	const prefix = repeat("great-", steps - 2);
	return pick(
		g,
		`${prefix}grandson`,
		`${prefix}granddaughter`,
		`${prefix}grandchild`
	);
};

/* ───────── Irish tweaks ───────── */

function irish(
	us: string,
	upSelf: number,
	upOther: number,
	gOther: Gender
): string {
	/* Parent’s cousin / cousin’s child differences */
	const closer = Math.min(upSelf, upOther);
	const diff = Math.abs(upSelf - upOther);

	if (diff === 1 && closer >= 2) {
		// first-cousin-once-removed cases
		return upSelf < upOther
			? pick(gOther, "uncle", "aunt", "aunt / uncle")
			: pick(gOther, "nephew", "niece", "nephew / niece");
	}
	return us; // all other terms are identical
}
