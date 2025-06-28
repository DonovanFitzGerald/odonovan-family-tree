import FamilyTree from "@/components/FamilyTree";
import { Person } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";

async function getFamilyData(): Promise<Person> {
	try {
		const filePath = path.join(process.cwd(), "data", "family.json");
		const fileContents = await fs.readFile(filePath, "utf8");
		return JSON.parse(fileContents);
	} catch (error) {
		console.error("Error loading family data:", error);
		// Return a fallback minimal tree
		return {
			name: "Family Data Not Found",
			children: [],
		};
	}
}

export default async function Home() {
	const familyData = await getFamilyData();

	return (
		<main className="w-full h-screen">
			<FamilyTree familyData={familyData} />
		</main>
	);
}
