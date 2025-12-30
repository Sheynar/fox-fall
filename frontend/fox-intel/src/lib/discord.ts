import { computed } from 'vue';

export function useDiscordAccess() {
	const redirectUri = computed(() => {
		const url = new URL(location.href);
		url.search = '';
		url.hash = '';
		return url.href;
	});

	function redirectToDiscordAuth() {
		location.href = `https://discord.com/oauth2/authorize?client_id=1454856481945157795&response_type=code&redirect_uri=${encodeURIComponent(redirectUri.value)}&scope=guilds+guilds.members.read`;
	}

	function redirectToDiscordBotAuth() {
		location.href = `https://discord.com/oauth2/authorize?client_id=1454856481945157795&permissions=0&response_type=code&redirect_uri=${encodeURIComponent(redirectUri.value)}&integration_type=0&scope=bot+guilds.members.read+guilds`
	}

	return {
		redirectToDiscordAuth,
		redirectToDiscordBotAuth,
		code: computed(() => {
			const code = new URL(location.href).searchParams.get('code');
			if (!code) {
				redirectToDiscordAuth();
				return '';
			}
			return code;
		}),
		redirectUri,
	};
}
