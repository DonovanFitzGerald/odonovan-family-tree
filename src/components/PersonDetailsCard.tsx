"use client";

import React from "react";
import { Person } from "@/lib/types";
import { getDisplayName, getDescendants } from "@/lib/treeUtils";
import clsx from "clsx";

interface PersonDetailsCardProps {
	person: Person | null | undefined;
	onClick?: () => void;
	active?: boolean;
}

export default function PersonDetailsCard({
	person,
	onClick,
	active,
}: PersonDetailsCardProps) {
	if (person == null) return null;
	return (
		<div
			className={clsx(
				`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex-1 cursor-pointer transition-all duration-200 w-64`,
				active
					? "ring-2 ring-blue-500 dark:ring-blue-400"
					: "hover:shadow-xl hover:scale-[1.02]"
			)}
			onClick={onClick}
		>
			<div className="mb-3">
				<h4 className="text-base font-medium text-gray-900 dark:text-white">
					{getDisplayName(person)}
				</h4>
			</div>

			<div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
				<p>
					<strong>Generation:</strong> {person.index.length}
				</p>
				{person.spouse && (
					<p>
						<strong>Spouse:</strong> {person.spouse}
					</p>
				)}
				{person.birth?.date && (
					<p>
						<strong>Birth:</strong> {person.birth.date}
						{person.birth.location &&
							` in ${person.birth.location}`}
					</p>
				)}
				{person.death?.date && (
					<p>
						<strong>Death:</strong> {person.death.date}
						{person.death.location &&
							` in ${person.death.location}`}
					</p>
				)}
				{!!person.children?.length && (
					<p>
						<strong>Children:</strong> {person.children.length}
					</p>
				)}
				{!!person.children?.length && (
					<p>
						<strong>Descendants:</strong>{" "}
						{getDescendants(person).length}
					</p>
				)}
			</div>
		</div>
	);
}
