"use client";
import React, { useState, useRef, useMemo, useLayoutEffect } from "react";
import { Person, TreeState, UnindexedPerson } from "@/lib/types";
import {
	assignIndex,
	isIndexEqual,
	getDisplayName,
	findPersonByIndex,
	getHighlightedAncestors,
	getHighlightedDescendants,
	getDescendants,
} from "@/lib/treeUtils";
import TreeNode from "./TreeNode";

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
		activePersonIndex: rootIndex,
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

	const handlePersonClick = (personIndex: number[]) => {
		const person = findPersonByIndex(indexedTree, personIndex);
		if (!person) return;

		const ancestors = getHighlightedAncestors(personIndex);
		const descendants = getHighlightedDescendants(person);

		setTreeState((prev) => ({
			...prev,
			activePersonIndex: personIndex,
			highlightedAncestors: ancestors,
			highlightedDescendants: descendants,
			highlightedPersons: [...ancestors, personIndex, ...descendants],
		}));
	};

	const handlePersonHover = (_: number[], event: React.MouseEvent) => {
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

	const clearSelection = () =>
		setTreeState((prev) => ({
			...prev,
			activePersonIndex: null,
			highlightedAncestors: [],
			highlightedDescendants: [],
			highlightedPersons: [],
		}));

	const renderTreeRow = (siblings: Person[]): React.ReactElement => (
		<div
			key={`row-${siblings.map((p) => p.index!.join("-"))!.join("|")}`}
			className="grid grid-flow-col auto-cols-max"
		>
			{siblings.map((person) => {
				const isHighlighted = treeState.highlightedPersons.some(
					(path) => isIndexEqual(path, person.index)
				);
				const isSelected = isIndexEqual(
					person.index,
					treeState.activePersonIndex
				);

				return (
					<TreeNode
						key={person.index!.join("-")}
						person={person}
						isSelected={isSelected}
						isHighlighted={isHighlighted}
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

	const selectedPerson = treeState.activePersonIndex
		? findPersonByIndex(indexedTree, treeState.activePersonIndex)
		: null;

	useLayoutEffect(() => {}, []);

	return (
		<div className="w-full h-screen bg-gray-50 dark:bg-gray-900 relative overflow-auto">
			{/* Clear Selection */}
			<div className="absolute top-4 left-4 z-20">
				<button
					onClick={clearSelection}
					className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
				>
					Clear Selection
				</button>
			</div>

			{/* Tree */}
			<div ref={containerRef} className="w-full h-full relative">
				<div className="z-10 w-full h-full flex flex-col justify-start items-center mt-8">
					{renderTree([indexedTree])}
				</div>
			</div>

			{/* Details panel */}
			{selectedPerson && (
				<div className="absolute top-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-20">
					<h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
						{getDisplayName(selectedPerson)}
					</h3>
					<div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
						<p>
							<strong>Generation:</strong>{" "}
							{selectedPerson.index!.length}
						</p>
						{selectedPerson.spouse && (
							<p>
								<strong>Spouse:</strong> {selectedPerson.spouse}
							</p>
						)}
						{!!selectedPerson.children?.length && (
							<p>
								<strong>Children:</strong>{" "}
								{selectedPerson.children.length}
							</p>
						)}
						{!!selectedPerson.children?.length && (
							<p>
								<strong>Descendents:</strong>{" "}
								{getDescendants(selectedPerson).length}
							</p>
						)}
						<p className="mt-3 text-xs italic">
							Click another person to explore their connections,
							or “Clear Selection” to start over.
						</p>
					</div>
				</div>
			)}

			{/* Footer instructions */}
			<div className="absolute bottom-4 left-4 right-4 text-center text-sm text-gray-600 dark:text-gray-400 z-20">
				Click on family members to highlight their connections
			</div>
		</div>
	);
}
