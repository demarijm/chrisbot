import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private'; // if you're using SvelteKit 1.0+

export async function POST({ request }) {
	try {
		// 1. Parse the incoming request body as JSON
		const payload = await request.json();

		// 2. Pull the API key from environment variables
		const API_KEY = env.API_KEY; // e.g., set API_KEY in your .env file

		if (!API_KEY) {
			throw new Error('Missing API_KEY environment variable');
		}

		// 3. Make a POST request to self-enroll.ai
		const response = await fetch('https://self-enroll.ai/api/external-registration', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'x-api-key': API_KEY
			},
			body: JSON.stringify(payload)
		});

		// 4. Check if the request to the external service succeeded
		if (!response.ok) {
			throw new Error(`Proxy responded with ${response.status} ${response.statusText}`);
		}

		// 5. Return the JSON response from the external service
		const data = await response.json();
		return json(data);
	} catch (error) {
		// Log and return a generic 500 error response
		console.error('Error in external-registration proxy endpoint:', error);
		return new Response(
			JSON.stringify({
				message: 'An error occurred while proxying request',
				error: (error as Error)?.message
			}),
			{ status: 500 }
		);
	}
}
