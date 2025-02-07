import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		console.log('Received form data:', data);

		// Sum up all numeric answers
		let totalScore = 0;
		for (const answerKey in data.answers) {
			const numericValue = Number(data.answers[answerKey]);
			totalScore += numericValue;
		}

		// Determine risk category using the ranges:
		//  9–14      Short-Term
		// 15–21      Conservative
		// 22–28      Balanced
		// 29–35      Growth
		// 36–42      Aggressive Growth
		// 43–45      Most Aggressive
		let riskLevel: string;

		if (totalScore <= 14) {
			riskLevel = 'short-term';
		} else if (totalScore <= 21) {
			riskLevel = 'conservative';
		} else if (totalScore <= 28) {
			riskLevel = 'balanced';
		} else if (totalScore <= 35) {
			riskLevel = 'growth';
		} else if (totalScore <= 42) {
			riskLevel = 'aggressive growth';
		} else {
			riskLevel = 'most aggressive';
		}

		// Return the result
		return new Response(JSON.stringify({ success: true, totalScore, riskLevel }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error parsing request body:', error);
		return new Response(JSON.stringify({ success: false, message: 'Invalid request' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
