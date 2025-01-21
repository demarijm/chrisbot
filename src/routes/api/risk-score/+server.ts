import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		// data will look like: { firstName: string, lastName: string, occupation: string }

		console.log('Received form data:', data);


		return new Response(JSON.stringify({ success: true, received: data }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error parsing request body:', error);
		return new Response(JSON.stringify({ success: false, message: 'Invalid request' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
