<script lang="ts">
	import { onMount } from 'svelte';
	// import { theme } from './theme';

	const firstname = 'John';
	const lastname = 'Doe';
	const email = 'sdw@dfw.ce';
	async function init() {
		const theme = await fetch(
			'https://mediafiles.botpress.cloud/34ffb0c3-deb4-4b2f-9906-e80e1b5fc39c/webchat/v2/theme.json'
		).then((response) => response.json());

		// Ensure window.botpress is defined (may need <script src="...botpress.bundle.js"> in index.html)
		window.botpress.on('webchat:ready', () => {
			window.botpress.open();
		});

		window.botpress.init({
			theme,
			clientId: '0bcc6702-fe27-4a3d-b149-0710b414996b',
			botId: '34ffb0c3-deb4-4b2f-9906-e80e1b5fc39c',
			style:
				'https://mediafiles.botpress.cloud/34ffb0c3-deb4-4b2f-9906-e80e1b5fc39c/webchat/v2/style.css',
			configuration: {
				botDescription: 'This is a Webchat demo bot.',
				botName: 'Webchat Demo',
				composerPlaceholder: 'Chat with me!',
				email: {
					title: 'contact@botpress.com',
					link: 'mailto:contact@botpress.com'
				},
				phone: {
					title: '555 555 555',
					link: 'tel:555 555 555'
				},
				privacyPolicy: {
					title: 'Privacy policy',
					link: 'https://botpress.com/legal/privacy-statement'
				},
				termsOfService: {
					title: 'Terms of service',
					link: 'https://botpress.com/legal/terms-of-service'
				},
				website: {
					title: 'https://botpress.com',
					link: 'https://botpress.com'
				}
			},
			user: {
				data: {
					firstName: 'John',
					lastName: 'Doe',
					email: 'john.doe@example.com'
				}
			}
		});
	}

	onMount(() => {
		init();
	});
</script>

<style global>
	html,
	body {
		margin: 0;
		padding: 0;
		height: 100%;
		width: 100%;
		overflow: hidden; /* optional, helps if you don't want any scrollbar */
	}

	.webchat {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100vw;
	}
</style>
