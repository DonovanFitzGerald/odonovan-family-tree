"use client";

import { Person } from "@/lib/types";
import { getDisplayName } from "@/lib/treeUtils";
import clsx from "clsx";

interface TreeNodeProps {
	person: Person;
	isSelected: boolean;
	isHighlighted: boolean;
	hasChildren: boolean;
	onPersonClick: (personIndex: number[]) => void;
	onPersonHover: (personIndex: number[], event: React.MouseEvent) => void;
	onPersonLeave: () => void;
}

export default function TreeNode({
	person,
	isSelected,
	isHighlighted,
	hasChildren,
	onPersonClick,
	onPersonHover,
	onPersonLeave,
}: TreeNodeProps) {
	const displayName = getDisplayName(person, hasChildren);

	const backgroundColor = person.background_color
		? `bg-${person.background_color}`
		: "bg-white dark:bg-gray-800";
	const textColor = person.text_color
		? `text-${person.text_color}`
		: "text-black dark:text-white";

	return (
		<div className="group">
			<div className="flex group-first:justify-end">
				<div className="h-1 w-1/2 bg-white group-first:w-0"></div>
				<div className="h-1 w-1/2 bg-white group-last:w-0"></div>
			</div>
			<div className="h-5 w-1 bg-white m-auto mt-[-4]"></div>
			<div
				className={clsx(
					"cursor-pointer transition-all duration-200",
					"rounded-lg shadow-md px-1 py-1 border-2 inline-block",
					"text-center font-medium",
					"transition-all duration-200",
					"whitespace-nowrap",
					backgroundColor,
					textColor,
					isSelected && "border-black",
					isHighlighted
						? "border-gray-500 text-xl"
						: "border-gray-500 text-s"
				)}
				onClick={() => onPersonClick(person.index)}
				onMouseEnter={(e) => onPersonHover(person.index, e)}
				onMouseLeave={onPersonLeave}
			>
				{displayName}
			</div>
			{isHighlighted && hasChildren && (
				<div className="h-8 w-1 bg-white m-auto"></div>
			)}
		</div>
	);
}
