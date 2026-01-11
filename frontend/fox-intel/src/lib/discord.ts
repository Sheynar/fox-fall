export function useDiscordAccess() {
	const url = new URL(location.href);
	const urlCode = url.searchParams.get('code');
	if (urlCode) {
		sessionStorage.setItem('discord-access-code', urlCode);
		url.searchParams.delete('code');
		history.replaceState(null, '', url.href);
	}

	const redirectUri = (() => {
		const url = new URL(location.href);
		url.search = '';
		url.hash = '';
		return url.href;
	})();

	let code = sessionStorage.getItem('discord-access-code');
	if (!code) {
		redirectToDiscordAuth();
		code = '';
	}

	function redirectToDiscordAuth() {
		location.href = `https://discord.com/oauth2/authorize?client_id=1454856481945157795&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=guilds+guilds.members.read`;
	}

	function redirectToDiscordBotAuth() {
		location.href = `https://discord.com/oauth2/authorize?client_id=1454856481945157795&permissions=0&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&integration_type=0&scope=bot+guilds.members.read+guilds`;
	}

	return {
		redirectToDiscordAuth,
		redirectToDiscordBotAuth,
		code,
		redirectUri,
	};
}
