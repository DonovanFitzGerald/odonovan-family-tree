import FamilyTree from "@/components/FamilyTree";
import { UnindexedPerson } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";

async function getFamilyData(): Promise<UnindexedPerson> {
	try {
		const filePath = path.join(process.cwd(), "data", "family.json");
		const fileContents = await fs.readFile(filePath, "utf8");
		return JSON.parse(fileContents);
	} catch (error) {
		console.error("Error loading family data:", error);
		// Return a fallback minimal tree
		return {
			first_name: "Family Data",
			nickname: "",
			last_name: "Not Found",
			gender: "neutral" as const,
			children: [],
		};
	}
}

export default async function Home() {
	const familyData = await getFamilyData();

	return (
		<main className="w-full h-screen flex align-center justify-center">
			<FamilyTree familyData={familyData} />
		</main>
	);
}
