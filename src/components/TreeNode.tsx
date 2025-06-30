"use client";

import { Person } from "@/lib/types";
import { getDisplayName } from "@/lib/treeUtils";
import clsx from "clsx";

interface TreeNodeProps {
	person: Person;
	isSelected: boolean;
	isHighlighted: boolean;
	isSecondarySelected: boolean;
	hasChildren: boolean;
	onPersonClick: (personIndex: Index) => void;
	onPersonHover: (personIndex: Index, event: React.MouseEvent) => void;
	onPersonLeave: () => void;
}

export default function TreeNode({
	person,
	isSelected,
	isHighlighted,
	isSecondarySelected,
	hasChildren,
	onPersonClick,
	onPersonHover,
	onPersonLeave,
}: TreeNodeProps) {
	const displayName = getDisplayName(person, hasChildren);

	const style = {
		backgroundColor: person.background_color || undefined,
		color: person.text_color || undefined,
	};

	return (
		<div
			className={clsx("group", isHighlighted ? "active" : "")}
			id={person.index?.join("-")}
		>
			<div className="flex group-first:justify-end">
				<div className="h-1 w-1/2 bg-white group-first:w-0"></div>
				<div className="h-1 w-1/2 bg-white group-last:w-0"></div>
			</div>

			<div className={`h-5 m-auto mt-[-4px] bg-white w-1`}></div>

			<div
				className={clsx(
					"cursor-pointer transition-transform duration-200",
					"rounded-lg shadow-md py-1 mx-3 px-2 inline-block border-2 text-s",
					"text-center ",
					"transition-all duration-200 ",
					"whitespace-nowrap",
					isHighlighted
						? "scale-110 border-transparent font-semibold"
						: " border-transparent font-medium",
					isSecondarySelected &&
						"ring-2 ring-red-900 dark:ring-red-400",
					isSelected && "ring-2 ring-blue-500 dark:ring-blue-400"
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
