// File: src/routes/api/pension/+server.js

import { calculatePension } from '$lib/pension-calculator';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  try {
    // Parse request body
    const { state, yearsOfService, averageSalary } = await request.json();

    // Call utility
    const estimatedPension = calculatePension(state, yearsOfService, averageSalary);

    // Income gap
    const incomeGap = averageSalary - estimatedPension;

    // Return JSON response
    return json({
      success: true,
      state,
      yearsOfService,
      averageSalary,
      estimatedPension,
      incomeGap
    });

  } catch  {
    // Handle any errors
    return json(
      {
        success: false,
        error: 'Invalid request or server error'
      },
      { status: 400 }
    );
  }
}
