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

	const style = {
		backgroundColor: person.background_color,
		color: person.text_color,
	};

	return (
		<div className="group" id={person.index?.join("-")}>
			<div className="flex group-first:justify-end">
				<div className="h-1 w-1/2 bg-white group-first:w-0"></div>
				<div className="h-1 w-1/2 bg-white group-last:w-0"></div>
			</div>

			<div className={`h-5 m-auto mt-[-4px] bg-white w-1`}></div>

			<div
				className={clsx(
					"cursor-pointer transition-all duration-200",
					"rounded-lg shadow-md px-1 py-1  inline-block",
					"text-center font-medium",
					"transition-all duration-200 mx-2",
					"whitespace-nowrap",
					isSelected && "border-black",
					isHighlighted ? "text-xl px-2 font-extrabold" : " text-s"
				)}
				style={style}
				onClick={() => onPersonClick(person.index)}
				onMouseEnter={(e) => onPersonHover(person.index, e)}
				onMouseLeave={onPersonLeave}
			>
				{displayName}
			</div>

			{isHighlighted && hasChildren && (
				<div className="h-8 w-1 m-auto bg-white"></div>
			)}
		</div>
	);
}
