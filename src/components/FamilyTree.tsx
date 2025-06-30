"use client";
import React, { useState, useRef, useMemo, useLayoutEffect } from "react";
import { Index, Person, TreeState, UnindexedPerson } from "@/lib/types";
import {
	assignIndex,
	isIndexEqual,
	findPersonByIndex,
	getHighlightedAncestors,
	getHighlightedDescendants,
} from "@/lib/treeUtils";
import TreeNode from "./TreeNode";
import PersonDetailsCard from "./PersonDetailsCard";
import RelationshipDisplay from "./RelationshipDisplay";

interface FamilyTreeProps {
	familyData: UnindexedPerson;
}

export default function FamilyTree({ familyData }: FamilyTreeProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const indexedTree = useMemo(() => assignIndex(familyData), [familyData]);

	const rootIndex = indexedTree.index!; // always [0]
	const initialAncestors = getHighlightedAncestors(rootIndex); // [] for root
	const initialDescendants = getHighlightedDescendants(indexedTree);

	const [treeState, setTreeState] = useState<TreeState>(() => ({
		primarySelectedPersonIndex: rootIndex,
		secondarySelectedPersonIndex: rootIndex,
		activeSelection: "primary",
		highlightedAncestors: initialAncestors,
		highlightedDescendants: initialDescendants,
		highlightedPersons: [
			...initialAncestors,
			rootIndex,
			...initialDescendants,
		],
		showTooltip: false,
		tooltipPosition: { x: 0, y: 0 },
	}));

	const handlePersonClick = (personIndex: Index) => {
		const person = findPersonByIndex(indexedTree, personIndex);
		if (!person) return;

		const ancestors = getHighlightedAncestors(personIndex);
		const descendants = getHighlightedDescendants(person);

		console.log(
			treeState.activeSelection,
			treeState.secondarySelectedPersonIndex
		);

		setTreeState((prev) => ({
			...prev,
			[prev.activeSelection === "primary"
				? "primarySelectedPersonIndex"
				: "secondarySelectedPersonIndex"]: personIndex,
			highlightedAncestors: ancestors,
			highlightedDescendants: descendants,
			highlightedPersons: [...ancestors, personIndex, ...descendants],
		}));
	};

	const handlePersonHover = (_: Index, event: React.MouseEvent) => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;

		setTreeState((prev) => ({
			...prev,
			showTooltip: true,
			tooltipPosition: {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			},
		}));
	};

	const handlePersonLeave = () =>
		setTreeState((prev) => ({ ...prev, showTooltip: false }));

	const handleCardClick = (selection: "primary" | "secondary") => {
		if (treeState.activeSelection === selection) return;

		const personIndex =
			selection === "primary"
				? treeState.primarySelectedPersonIndex
				: treeState.secondarySelectedPersonIndex;

		if (!personIndex) return;

		const person = findPersonByIndex(indexedTree, personIndex);
		if (!person) return;

		const ancestors = getHighlightedAncestors(personIndex);
		const descendants = getHighlightedDescendants(person);

		setTreeState((prev) => ({
			...prev,
			activeSelection: selection,
			highlightedAncestors: ancestors,
			highlightedDescendants: descendants,
			highlightedPersons: [...ancestors, personIndex, ...descendants],
		}));
	};

	const renderTreeRow = (siblings: Person[]): React.ReactElement => (
		<div
			key={`row-${siblings.map((p) => p.index!.join("-"))!.join("|")}`}
			className="grid grid-flow-col auto-cols-max generation-row"
			id={`gen-${siblings[0].index.length}`}
		>
			{siblings.map((person) => {
				const isHighlighted = treeState.highlightedPersons.some(
					(path) => isIndexEqual(path, person.index)
				);
				const activePersonIndex =
					treeState.activeSelection === "primary"
						? treeState.primarySelectedPersonIndex
						: treeState.secondarySelectedPersonIndex;
				const isSelected = isIndexEqual(
					person.index,
					activePersonIndex
				);

				return (
					<TreeNode
						key={person.index!.join("-")}
						person={person}
						isSelected={isSelected}
						isHighlighted={isHighlighted}
						isSecondarySelected={isIndexEqual(
							person.index,
							treeState.activeSelection === "secondary"
								? treeState.primarySelectedPersonIndex
								: treeState.secondarySelectedPersonIndex
						)}
						hasChildren={
							isHighlighted && (person.children?.length ?? 0) > 0
						}
						onPersonClick={handlePersonClick}
						onPersonHover={handlePersonHover}
						onPersonLeave={handlePersonLeave}
					/>
				);
			})}
		</div>
	);

	const renderTree = (generation: Person[]): React.ReactElement[] => {
		if (!generation.length) return [];

		const rows: React.ReactElement[] = [];
		rows.push(renderTreeRow(generation));
		const highlightedChild = generation.find((p) =>
			treeState.highlightedPersons.some((path) =>
				isIndexEqual(path, p.index)
			)
		);

		if (highlightedChild?.children?.length) {
			rows.push(...renderTree(highlightedChild.children));
		}

		return rows;
	};

	const primarySelectedPerson = treeState.primarySelectedPersonIndex
		? findPersonByIndex(indexedTree, treeState.primarySelectedPersonIndex)
		: null;

	const secondarySelectedPerson = treeState.secondarySelectedPersonIndex
		? findPersonByIndex(indexedTree, treeState.secondarySelectedPersonIndex)
		: null;

	useLayoutEffect(() => {
		const centerX = (el: Element) => {
			const r = el.getBoundingClientRect();
			return r.left + r.width / 2;
		};

		document
			.querySelectorAll<HTMLDivElement>(".generation-row")
			.forEach((row) => {
				const gen = Number(row.id.split("-")[1] ?? 0);
				const activeParent = row.querySelector<HTMLElement>(".active");
				const nextGenRow = document.getElementById(
					`gen-${gen + 1}`
				) as HTMLDivElement | null;

				if (!activeParent || !nextGenRow) return;

				nextGenRow.style.paddingLeft = "";
				nextGenRow.style.paddingRight = "";

				const parentCx = centerX(activeParent);
				const children = Array.from(
					nextGenRow.children
				) as HTMLElement[];

				if (children.length === 0) return;

				let shift = 0;

				const firstCx = centerX(children[0]);
				const lastCx = centerX(children[children.length - 1]);

				if (children.length === 1) {
					shift = parentCx - centerX(children[0]);
				} else if (parentCx < firstCx) {
					shift = parentCx - firstCx;
				} else if (parentCx > lastCx) {
					shift = parentCx - lastCx;
				}

				if (shift !== 0) {
					if (shift > 0) {
						nextGenRow.style.paddingLeft = `${shift * 2}px`;
					} else {
						nextGenRow.style.paddingRight = `${
							Math.abs(shift) * 2
						}px`;
					}
				}
			});
	}, [treeState]);

	return (
		<div className="w-full h-screen bg-gray-50 dark:bg-gray-900 relative overflow-auto flex flex-col">
			{/* Tree */}
			<div ref={containerRef} className="w-full h-full relative">
				<div className="z-10 w-full h-full flex flex-col justify-start items-center mt-8">
					{renderTree([indexedTree])}
				</div>
			</div>

			{/* Dual Person Details Cards */}
			<div className="z-20 w-full flex flex-col p-4 justify-center items-center">
				{/* Person Details Cards */}
				<div className="flex gap-4 mb-4 max-w-4xl h-64">
					<PersonDetailsCard
						person={primarySelectedPerson}
						onClick={() => handleCardClick("primary")}
						active={treeState.activeSelection === "primary"}
					/>

					{/* Relationship Display */}
					<RelationshipDisplay
						primaryPerson={primarySelectedPerson}
						secondaryPerson={secondarySelectedPerson}
					/>

					<PersonDetailsCard
						person={secondarySelectedPerson}
						onClick={() => handleCardClick("secondary")}
						active={treeState.activeSelection === "secondary"}
					/>
				</div>
				{/* Footer instructions */}
				<div className="text-center text-sm text-gray-600 dark:text-gray-400">
					Click family members to select • Click cards below to switch
					active view • Compare two people side by side
				</div>
			</div>
		</div>
	);
}
