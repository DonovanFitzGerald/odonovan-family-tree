"use client";

import React from "react";
import { Person } from "@/lib/types";
import { relate, isIndexEqual } from "@/lib/treeUtils";

interface RelationshipDisplayProps {
	primaryPerson: Person | null | undefined;
	secondaryPerson: Person | null | undefined;
}

export default function RelationshipDisplay({
	primaryPerson,
	secondaryPerson,
}: RelationshipDisplayProps) {
	// Don't render if either person is missing
	if (!primaryPerson || !secondaryPerson) {
		return null;
	}

	// Handle same person selected twice
	if (isIndexEqual(primaryPerson.index, secondaryPerson.index)) {
		return (
			<div className="flex items-center justify-center px-4">
				<div className="text-sm text-gray-500 dark:text-gray-400 italic">
					Same person selected
				</div>
			</div>
		);
	}

	// Calculate relationship
	const relationship = relate(primaryPerson, secondaryPerson);

	// Handle case where no relationship can be determined
	if (
		!relationship.personA.american ||
		relationship.personA.american === "unknown"
	) {
		return (
			<div className="flex items-center justify-center px-4">
				<div className="text-sm text-gray-500 dark:text-gray-400 italic">
					No relationship found
				</div>
			</div>
		);
	}

	if (relationship.personA.irish === relationship.personB.irish) {
		return (
			<div className="flex items-center justify-center px-4">
				<div className="text-sm font-medium text-gray-700 dark:text-gray-300">
					{relationship.personA.irish}s
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center px-4">
			<div className="text-center space-y-1">
				{/* Person A → Person B */}
				<div className="flex items-center justify-center space-x-2">
					<div className="text-sm font-medium text-gray-700 dark:text-gray-300">
						{relationship.personA.irish}
					</div>
					{relationship.personA.irish !==
						relationship.personA.american && (
						<div className="text-xs text-gray-500 dark:text-gray-400 italic">
							({relationship.personA.american})
						</div>
					)}
					<div className="text-xs text-gray-500 dark:text-gray-400">
						→
					</div>
				</div>

				{/* Person B → Person A */}
				<div className="flex items-center justify-center space-x-2">
					<div className="text-xs text-gray-500 dark:text-gray-400">
						←
					</div>
					<div className="text-sm font-medium text-gray-700 dark:text-gray-300">
						{relationship.personB.irish}
					</div>
					{relationship.personB.irish !==
						relationship.personB.american && (
						<div className="text-xs text-gray-500 dark:text-gray-400 italic">
							({relationship.personB.american})
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
