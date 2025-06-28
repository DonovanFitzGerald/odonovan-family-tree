"use client";

import { useState, useEffect, useRef } from "react";
import { Person, PositionedPerson, TreeState } from "@/lib/types";
import {
	positionTreeNodes,
	calculateTreeDimensions,
	getAncestors,
	getDescendants,
	findPersonById,
	getDisplayName,
} from "@/lib/treeUtils";
import TreeNode from "./TreeNode";
import TreeConnectors from "./TreeConnectors";

interface FamilyTreeProps {
	familyData: Person;
}

export default function FamilyTree({ familyData }: FamilyTreeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [treeState, setTreeState] = useState<TreeState>({
		selectedPersonId: null,
		highlightedAncestors: new Set(),
		highlightedDescendants: new Set(),
		showTooltip: false,
		tooltipPosition: { x: 0, y: 0 },
	});

	// Calculate tree layout
	const dimensions = calculateTreeDimensions(familyData);
	const positionedTree = positionTreeNodes(familyData, dimensions);

	// Handle person selection
	const handlePersonClick = (personId: string) => {
		const person = findPersonById(positionedTree, personId);
		if (!person) return;

		const ancestors = getAncestors(personId, positionedTree);
		const descendants = getDescendants(person);

		setTreeState((prev) => ({
			...prev,
			selectedPersonId: personId,
			highlightedAncestors: ancestors,
			highlightedDescendants: descendants,
		}));
	};

	// Handle person hover
	const handlePersonHover = (personId: string, event: React.MouseEvent) => {
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

	// Handle person leave
	const handlePersonLeave = () => {
		setTreeState((prev) => ({
			...prev,
			showTooltip: false,
		}));
	};

	// Clear selection
	const clearSelection = () => {
		setTreeState((prev) => ({
			...prev,
			selectedPersonId: null,
			highlightedAncestors: new Set(),
			highlightedDescendants: new Set(),
		}));
	};

	// Render all tree nodes recursively
	const renderTreeNodes = (person: PositionedPerson): JSX.Element[] => {
		const nodes: JSX.Element[] = [];

		const isSelected = person.id === treeState.selectedPersonId;
		const isHighlighted =
			treeState.highlightedAncestors.has(person.id) ||
			treeState.highlightedDescendants.has(person.id);

		nodes.push(
			<TreeNode
				key={person.id}
				person={person}
				isSelected={isSelected}
				isHighlighted={isHighlighted}
				onPersonClick={handlePersonClick}
				onPersonHover={handlePersonHover}
				onPersonLeave={handlePersonLeave}
			/>
		);

		if (person.children) {
			person.children.forEach((child) => {
				nodes.push(...renderTreeNodes(child));
			});
		}

		return nodes;
	};

	const selectedPerson = treeState.selectedPersonId
		? findPersonById(positionedTree, treeState.selectedPersonId)
		: null;

	return (
		<div className="w-full h-screen bg-gray-50 dark:bg-gray-900 relative overflow-auto">
			{/* Clear Selection Button */}
			<div className="absolute top-4 left-4 z-20">
				<button
					type="button"
					onClick={clearSelection}
					className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
				>
					Clear Selection
				</button>
			</div>

			{/* Tree Container */}
			<div ref={containerRef} className="w-full h-full relative">
				<div
					className="relative mx-auto"
					style={{
						width: `${dimensions.width}px`,
						height: `${dimensions.height}px`,
					}}
				>
					{/* Connectors */}
					<TreeConnectors
						rootPerson={positionedTree}
						width={dimensions.width}
						height={dimensions.height}
					/>

					{/* Nodes */}
					<div className="relative z-10">
						{renderTreeNodes(positionedTree)}
					</div>
				</div>
			</div>

			{/* Selected Person Details Panel */}
			{selectedPerson && (
				<div className="absolute top-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-20">
					<h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
						{getDisplayName(selectedPerson)}
					</h3>
					<div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
						<p>
							<strong>Generation:</strong>{" "}
							{selectedPerson.generation + 1}
						</p>
						{selectedPerson.spouse && (
							<p>
								<strong>Spouse:</strong> {selectedPerson.spouse}
							</p>
						)}
						{selectedPerson.children &&
							selectedPerson.children.length > 0 && (
								<p>
									<strong>Children:</strong>{" "}
									{selectedPerson.children.length}
								</p>
							)}
						<p className="mt-3 text-xs italic">
							Click another person to explore their family
							connections, or click Clear Selection to clear
							selection.
						</p>
					</div>
				</div>
			)}

			{/* Instructions */}
			<div className="absolute bottom-4 left-4 right-4 text-center text-sm text-gray-600 dark:text-gray-400 z-20">
				<p>Click on family members to highlight their connections</p>
			</div>
		</div>
	);
}
