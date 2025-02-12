import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import Fuse from 'fuse.js';

const prisma = new PrismaClient();

function normalizeDistrictName(name: string) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.trim();
}

export async function POST({ request }) {
	const { district: rawDistrict = '', state } = await request.json();

	const districtNameRaw = rawDistrict.trim();
	const districtName = districtNameRaw ? normalizeDistrictName(districtNameRaw) : null;

	if (!districtName) {
		return json({ error: 'District name is required' }, { status: 400 });
	}

	const allDistricts = await prisma.district.findMany({
		include: { carriers: true },
		where: state ? { state } : {}
	});

	const fuseData = allDistricts.map((d) => ({
		...d,
		normalizedName: normalizeDistrictName(d.name)
	}));

	const fuse = new Fuse(fuseData, {
		keys: ['name', 'normalizedName'],
		threshold: 0.5,
		// Commented out to get more results
		distance: 100,
		minMatchCharLength: 3
	});

	const searchResults = fuse.search(districtName);

	if (searchResults.length === 0) {
		return json({ error: 'District not found' }, { status: 400 });
	}

	const matchedDistrict = searchResults[0].item;
	return json({ district: matchedDistrict.name, carriers: matchedDistrict.carriers });
}
