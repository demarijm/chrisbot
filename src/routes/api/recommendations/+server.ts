// +server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { getRecommendations } from '$lib/vendor-logic';
import type { RecommendationResult } from '$lib/types';

const prisma = new PrismaClient();

export async function POST({ request }) {
	// Grab the district and risk from the request body
	const { district: rawDistrict = '', risk: rawRisk = null } = await request.json();

	// Trim and normalize the district
	const districtName = rawDistrict.trim() === '' ? null : rawDistrict.trim();
	// Normalize the risk
	const userRisk = rawRisk ? rawRisk.toString().trim() : null;

	let districtCarriers = null;

	// Only look up the district if districtName is non-empty
	if (districtName) {
		const district = await prisma.district.findUnique({
			where: { name: districtName },
			include: { carriers: true }
		});
		if (district) {
			districtCarriers = district.carriers;
		}
	}

	// The function returns a typed RecommendationResult
	const recommendationResult: RecommendationResult = getRecommendations(districtCarriers, userRisk);

	return json({
		district: districtName || 'None',
		userRisk,
		recommendations: recommendationResult
	});
}
