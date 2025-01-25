// +server.ts (or any SvelteKit endpoint)
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { getRecommendations } from '$lib/vendor-logic';
import type { RecommendationResult } from '$lib/types'; // if you want to annotate

const prisma = new PrismaClient();

export async function GET({ url }) {
	const districtName = url.searchParams.get('district');
	const userRisk = url.searchParams.get('risk') ?? null;

	let districtCarriers = null;

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
