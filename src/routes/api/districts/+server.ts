// src/routes/api/districts/+server.ts
import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';

const prisma = new PrismaClient();

export async function GET() {
	// Fetch all District names from DB
	// Adjust the "select" fields if you want more columns
	const districts = await prisma.district.findMany({
		select: {
			name: true
		}
	});

	// Return them as a simple array of strings
	// e.g. [{ name: "Anniston City Board of Education" }, ... ]
	// We'll map them to just the "name" string
	const districtNames = districts.map((d) => d.name);

	return json(districtNames);
}
