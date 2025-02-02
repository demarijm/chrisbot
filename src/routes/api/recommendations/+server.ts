// +server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { getRecommendations } from '$lib/vendor-logic';
import type { RecommendationResult } from '$lib/types';

import Fuse from 'fuse.js';

const prisma = new PrismaClient();

// Simple “clean up” function for district names
function normalizeDistrictName(name: string) {
	// Lowercase, remove punctuation, extra spaces, etc.
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.trim();
}

export async function POST({ request }) {
	const { district: rawDistrict = '', risk: rawRisk = null } = await request.json();

	// Clean + normalize user input
	const districtNameRaw = rawDistrict.trim();
	const districtName = districtNameRaw ? normalizeDistrictName(districtNameRaw) : null;
	const userRisk = rawRisk ? rawRisk.toString().trim() : null;

	let districtCarriers = null;
	let matchedDistrictName = null;

	if (districtName) {
		// 1. Grab all districts (or a filtered subset if your table is huge).
		const allDistricts = await prisma.district.findMany({
			include: { carriers: true }
		});

		// 2. Initialize Fuse on the “name” field.
		//    We’ll store both the “raw” name and a “normalized” name for best results.
		//    Suppose our District model has a “name” field. We’ll also create an array
		//    of objects that contain a normalized version for fuzzy searching.
		const fuseData = allDistricts.map((d) => ({
			...d,
			normalizedName: normalizeDistrictName(d.name)
		}));

		const fuse = new Fuse(fuseData, {
			// We can tell Fuse to look at both the raw name and the normalizedName
			keys: ['name', 'normalizedName'],
			threshold: 0.3 // Adjust as you see fit (lower => stricter match)
		});

		// 3. Search user input with Fuse
		const searchResults = fuse.search(districtName);

		// 4. If we get a result, pick the best match
		if (searchResults.length > 0) {
			const bestMatch = searchResults[0].item;
			districtCarriers = bestMatch.carriers;
			matchedDistrictName = bestMatch.name;
		}
	}

	// Fall back if we didn’t find anything
	if (!matchedDistrictName) {
		matchedDistrictName = 'None';
	}

	// Use the carriers + risk to get recommendations
	const recommendationResult: RecommendationResult = getRecommendations(districtCarriers, userRisk);

	return json({
		district: matchedDistrictName,
		userRisk,
		recommendations: recommendationResult
	});
}
