import { describe, it, expect } from "@jest/globals";
import {
	generateId,
	getDisplayName,
	calculateTreeDimensions,
	positionTreeNodes,
	formatPersonName,
} from "../treeUtils";
import { Person } from "../types";

describe("treeUtils", () => {
	describe("generateId", () => {
		it("should generate recursive IDs based on structure", () => {
			const person: Person = {
				first_name: "John",
				nickname: "",
				last_name: "O'Donovan",
			};
			expect(generateId(person)).toBe("root");
			expect(generateId(person, "root", 0)).toBe("root-0");
			expect(generateId(person, "root-0", 1)).toBe("root-0-1");
		});
	});

	describe("formatPersonName", () => {
		it("should format name with first and last name", () => {
			const person: Person = {
				first_name: "John",
				nickname: "",
				last_name: "O'Donovan",
			};
			expect(formatPersonName(person)).toBe("John 'O'Donovan");
		});

		it("should format name with nickname", () => {
			const person: Person = {
				first_name: "Cornelius",
				nickname: "Con",
				last_name: "O'Donovan",
			};
			expect(formatPersonName(person)).toBe(
				"Cornelius \"Con\" 'O'Donovan"
			);
		});
	});

	describe("getDisplayName", () => {
		it("should return just the formatted name when no spouse", () => {
			const person: Person = {
				first_name: "John",
				nickname: "",
				last_name: "Doe",
			};
			expect(getDisplayName(person)).toBe("John 'Doe");
		});

		it("should return combined name when spouse exists and showSpouse is true", () => {
			const person: Person = {
				first_name: "John",
				nickname: "",
				last_name: "Doe",
				spouse: "Jane Smith",
			};
			expect(getDisplayName(person, true)).toBe(
				"John 'Doe and Jane Smith"
			);
		});

		it("should not show spouse when showSpouse is false", () => {
			const person: Person = {
				first_name: "John",
				nickname: "",
				last_name: "Doe",
				spouse: "Jane Smith",
			};
			expect(getDisplayName(person, false)).toBe("John 'Doe");
		});
	});

	describe("calculateTreeDimensions", () => {
		it("should calculate dimensions for a simple tree", () => {
			const person: Person = {
				first_name: "Root",
				nickname: "",
				last_name: "Person",
				children: [
					{ first_name: "Child", nickname: "", last_name: "One" },
					{ first_name: "Child", nickname: "", last_name: "Two" },
				],
			};

			const dimensions = calculateTreeDimensions(person);

			expect(dimensions.width).toBeGreaterThan(0);
			expect(dimensions.height).toBeGreaterThan(0);
			expect(dimensions.generationHeight).toBe(120);
			expect(dimensions.nodeWidth).toBe(100);
			expect(dimensions.nodeHeight).toBe(40);
		});
	});

	describe("positionTreeNodes", () => {
		it("should position nodes with correct coordinates", () => {
			const person: Person = {
				first_name: "Root",
				nickname: "",
				last_name: "Person",
				children: [
					{ first_name: "Child", nickname: "", last_name: "One" },
					{ first_name: "Child", nickname: "", last_name: "Two" },
				],
			};

			const dimensions = calculateTreeDimensions(person);
			const positioned = positionTreeNodes(person, dimensions);

			expect(positioned.x).toBeGreaterThanOrEqual(0);
			expect(positioned.y).toBeGreaterThanOrEqual(0);
			expect(positioned.generation).toBe(0);
			expect(positioned.id).toBe("root");

			if (positioned.children) {
				expect(positioned.children).toHaveLength(2);
				positioned.children.forEach((child) => {
					expect(child.generation).toBe(1);
					expect(child.x).toBeGreaterThanOrEqual(0);
					expect(child.y).toBeGreaterThan(positioned.y);
				});
			}
		});
	});
});
