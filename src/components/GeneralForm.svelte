<script lang="ts">
	import { Client } from '@botpress/client';
	let firstName = '';
	let lastName = '';
	let occupation = 'Developer';
	let chatUrl = '';

	async function handleSubmit(event: Event) {
		event.preventDefault();

		try {
			// 1) Replace with your Botpress endpoint for creating a new conversation/chat
			const endpoint = 'https://api.botpress.cloud/v1/chat/conversations';
			// 2) Gather form data into a payload structure that your Botpress API expects
			const payload = {
				user: {
					firstName,
					lastName,
					occupation
				}
			};

			// 3) Send request to Botpress
			const token = 'bp_pat_I3RztWQiZV3FvwVkaNTuXCkGxNtzNGfDHsIW';
			const workspaceId = 'b09dce2a-736d-482a-8cbc-39b315b2058b';
			const botId = '34ffb0c3-deb4-4b2f-9906-e80e1b5fc39c';
			const client = new Client({ token, workspaceId, botId });

			// 1. plain operations
			const { bot } = await client.getBot({ id: botId });
			console.log('### bot', bot);

			// 2. list utils with `.collect()` function
			const [latestConversation] = await client.list
				.conversations({ sortField: 'createdAt', sortDirection: 'desc', integrationName: 'chat' })
				.collect({ limit: 1 });
			console.log('### latestConversation', latestConversation);

			chatUrl = `https://chat.botpress.cloud/s/${workspaceId}/${botId}?conversationId=${bot.id}`;
			console.log('Created new chat:', workspaceId);

			// 5) Optionally reset form fields
			firstName = '';
			lastName = '';
			occupation = 'Developer';
		} catch (error) {
			console.error('Failed to create new chat via Botpress API:', error);
		}
	}
	const occupations = ['Developer', 'Designer', 'Manager'];
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="mx-auto w-full max-w-md space-y-6 rounded-md bg-white p-6 shadow-md"
>
	<div>
		<label for="firstName" class="mb-2 block font-semibold text-gray-700"> First Name </label>
		<input
			id="firstName"
			bind:value={firstName}
			type="text"
			placeholder="Enter your first name"
			required
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<div>
		<label for="lastName" class="mb-2 block font-semibold text-gray-700"> Last Name </label>
		<input
			id="lastName"
			bind:value={lastName}
			type="text"
			placeholder="Enter your last name"
			required
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		/>
	</div>

	<div>
		<label for="occupation" class="mb-2 block font-semibold text-gray-700"> Occupation </label>
		<select
			id="occupation"
			bind:value={occupation}
			class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-200"
		>
			{#each occupations as job}
				<option value={job}>{job}</option>
			{/each}
		</select>
	</div>

	<button
		type="submit"
		class="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
	>
		Create New Chat
	</button>
	{#if chatUrl}
		<div class="mt-4 text-center">
			<p class="mb-2 text-gray-700">Your new chat is ready:</p>
			<a href={chatUrl} target="_blank" class="text-blue-600 underline hover:text-blue-800">
				{chatUrl}
			</a>
		</div>
	{/if}
</form>
