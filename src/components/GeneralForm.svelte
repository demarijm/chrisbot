<script lang="ts">
	// import { PUBLIC_APP_URL } from '$env/static/public';
	// 1) Define form inputs
	let firstName = 'ij';
	let lastName = 's';
	let employerDistrict = 'w';
	let school = 'w';
	let jobTitle = 'w';
	let workEmail = 'ij@ni.de';
	let personalEmail = 'ij@ni.de';
	let mobileNumber = '3';
	let selectedState = '';
	const states = [
		'AL',
		'AK',
		'AZ',
		'AR',
		'CA',
		'CO',
		'CT',
		'DE',
		'FL',
		'GA',
		'HI',
		'ID',
		'IL',
		'IN',
		'IA',
		'KS',
		'KY',
		'LA',
		'ME',
		'MD',
		'MA',
		'MI',
		'MN',
		'MS',
		'MO',
		'MT',
		'NE',
		'NV',
		'NH',
		'NJ',
		'NM',
		'NY',
		'NC',
		'ND',
		'OH',
		'OK',
		'OR',
		'PA',
		'RI',
		'SC',
		'SD',
		'TN',
		'TX',
		'UT',
		'VT',
		'VA',
		'WA',
		'WV',
		'WI',
		'WY'
	];

	// 2) Store submitted data (so it can be displayed after submission)
	let submittedData: {
		firstName?: string;
		lastName?: string;
		employerDistrict?: string;
		school?: string;
		jobTitle?: string;
		workEmail?: string;
		personalEmail?: string;
		mobileNumber?: string;
	} = {};

	let chatUrl = '';

	function handleSubmit(event: Event) {
		event.preventDefault();
		// Create a NEW conversation in Botpress "chat" every time:
		chatUrl = `${window.location.origin}/chat?firstName=${firstName}&lastName=${lastName}&employerDistrict=${employerDistrict}&school=${school}&jobTitle=${jobTitle}&workEmail=${workEmail}&personalEmail=${personalEmail}&mobileNumber=${mobileNumber}&state=${selectedState}`;

		// Save the submitted form data into `submittedData`

		// Optionally, reset the form fields
		firstName = '';
		lastName = '';
		employerDistrict = '';
		school = '';
		jobTitle = '';
		workEmail = '';
		personalEmail = '';
		mobileNumber = '';
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="mx-auto w-full max-w-md space-y-6 rounded-md bg-white p-6 shadow-md"
>
	<!-- FIRST NAME -->
	<div>
		<label for="firstName" class="mb-2 block font-semibold text-gray-700">First Name</label>
		<input
			id="firstName"
			bind:value={firstName}
			type="text"
			placeholder="Enter your first name"
			required
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<!-- LAST NAME -->
	<div>
		<label for="lastName" class="mb-2 block font-semibold text-gray-700">Last Name</label>
		<input
			id="lastName"
			bind:value={lastName}
			type="text"
			placeholder="Enter your last name"
			required
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<!-- EMPLOYER/DISTRICT -->
	<div>
		<label for="employerDistrict" class="mb-2 block font-semibold text-gray-700"
			>Employer/District</label
		>
		<input
			id="employerDistrict"
			bind:value={employerDistrict}
			type="text"
			placeholder="Enter your employer/district"
			required
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<!-- SCHOOL -->
	<div>
		<label for="school" class="mb-2 block font-semibold text-gray-700">School</label>
		<input
			id="school"
			bind:value={school}
			type="text"
			placeholder="Enter your school"
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<!-- JOB TITLE -->
	<div>
		<label for="jobTitle" class="mb-2 block font-semibold text-gray-700">Job Title</label>
		<input
			id="jobTitle"
			bind:value={jobTitle}
			type="text"
			placeholder="Enter your job title"
			required
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<!-- WORK EMAIL -->
	<div>
		<label for="workEmail" class="mb-2 block font-semibold text-gray-700">Work Email</label>
		<input
			id="workEmail"
			bind:value={workEmail}
			type="email"
			placeholder="Work email address"
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<!-- PERSONAL EMAIL -->
	<div>
		<label for="personalEmail" class="mb-2 block font-semibold text-gray-700">Personal Email</label>
		<input
			id="personalEmail"
			bind:value={personalEmail}
			type="email"
			placeholder="Personal email address"
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<!-- MOBILE NUMBER -->
	<div>
		<label for="mobileNumber" class="mb-2 block font-semibold text-gray-700">Mobile Number</label>
		<input
			id="mobileNumber"
			bind:value={mobileNumber}
			type="tel"
			placeholder="Enter your mobile number"
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>
	<div>
		<label for="selectedState" class="mb-2 block font-semibold text-gray-700">State</label>
		<select
			id="selectedState"
			bind:value={selectedState}
			required
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		>
			<option value="" disabled selected>Select your state</option>
			{#each states as st}
				<option value={st}>{st}</option>
			{/each}
		</select>
	</div>

	<button
		type="submit"
		class="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
	>
		Create New Chat
	</button>

	<!-- SHOW DATA AFTER SUBMISSION -->
	{#if chatUrl}
		<div class="mt-4 text-center">
			<p class="mb-2 text-gray-700">Your new chat is ready:</p>
			<div>Data you submitted:</div>
			<ul class="ml-4 text-left">
				<li>First Name: {submittedData.firstName}</li>
				<li>Last Name: {submittedData.lastName}</li>
				<li>Employer/District: {submittedData.employerDistrict}</li>
				<li>School: {submittedData.school}</li>
				<li>Job Title: {submittedData.jobTitle}</li>
				<li>Work Email: {submittedData.workEmail}</li>
				<li>Personal Email: {submittedData.personalEmail}</li>
				<li>Mobile Number: {submittedData.mobileNumber}</li>
			</ul>

			<div class="mt-2 border border-dashed border-red-300 p-4">
				Note: This link may not work until everything is fully configured or you open it in an
				environment that can access Botpress Cloud.
			</div>

			<a href={chatUrl} target="_blank" class="text-blue-600 underline hover:text-blue-800">
				{chatUrl}
			</a>
		</div>
	{/if}
</form>
