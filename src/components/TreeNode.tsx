"use client";

import { PositionedPerson } from "@/lib/types";
import { getDisplayName } from "@/lib/treeUtils";
import clsx from "clsx";

interface TreeNodeProps {
	person: PositionedPerson;
	isSelected: boolean;
	isHighlighted: boolean;
	showSpouse: boolean;
	onPersonClick: (personId: string) => void;
	onPersonHover: (personId: string, event: React.MouseEvent) => void;
	onPersonLeave: () => void;
}

export default function TreeNode({
	person,
	isSelected,
	isHighlighted,
	showSpouse,
	onPersonClick,
	onPersonHover,
	onPersonLeave,
}: TreeNodeProps) {
	const displayName = getDisplayName(person, showSpouse);

	// Generate colors based on generation for visual variety
	const getNodeColors = (generation: number) => {
		const colors = [
			"bg-lime-200 dark:bg-lime-700 border-lime-300 dark:border-lime-600",
			"bg-pink-200 dark:bg-pink-700 border-pink-300 dark:border-pink-600",
			"bg-blue-200 dark:bg-blue-700 border-blue-300 dark:border-blue-600",
			"bg-orange-200 dark:bg-orange-700 border-orange-300 dark:border-orange-600",
			"bg-purple-200 dark:bg-purple-700 border-purple-300 dark:border-purple-600",
			"bg-teal-200 dark:bg-teal-700 border-teal-300 dark:border-teal-600",
		];
		return colors[generation % colors.length];
	};

	return (
		<div
			className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-105"
			style={{
				left: `${person.x}px`,
				top: `${person.y}px`,
			}}
			onClick={() => onPersonClick(person.id)}
			onMouseEnter={(e) => onPersonHover(person.id, e)}
			onMouseLeave={onPersonLeave}
		>
			<div
				className={clsx(
					"rounded-lg shadow-md px-1 py-1 border-2 inline-block",
					"text-center text-xs font-medium",
					"text-gray-800 dark:text-white",
					"transition-all duration-200",
					"whitespace-nowrap",
					getNodeColors(person.generation),
					{
						"ring-4 ring-yellow-400 dark:ring-yellow-300 scale-110":
							isSelected,
						"ring-2 ring-blue-400 dark:ring-blue-300":
							isHighlighted && !isSelected,
						"shadow-lg": isSelected || isHighlighted,
					}
				)}
			>
				<div className="leading-tight">{displayName}</div>
				{showSpouse && person.spouse && (
					<div className="text-xs opacity-75 mt-0.5">
						& {person.spouse}
					</div>
				)}
			</div>
		</div>
	);
}
