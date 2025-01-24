// src/routes/api/recommendations/+server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { getRecommendations } from '$lib/vendor-logic';

const prisma = new PrismaClient();

export async function GET({ url }) {
	const districtName = url.searchParams.get('district');
	const userRisk = url.searchParams.get('risk') ?? null;

	// If no districtName, we pass null for districtCarriers
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

	const recommendations = getRecommendations(districtCarriers, userRisk);

	return json({
		district: districtName || 'None',
		userRisk,
		recommendations
	});
}
