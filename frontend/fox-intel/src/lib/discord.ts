import { onScopeDispose, ref } from 'vue';
import { wrapMixin } from '@packages/frontend-libs/src/reference-cache';

function _useDiscordAccess() {
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

	const ready = ref(false);
	async function checkAccessToken(timeout: number = 10_000) {
		const response = await fetch(
			`/api/v1/discord/access-token?timeout=${timeout}`,
			{
				method: 'GET',
				headers: {
					'X-Discord-Access-Code': code!,
					'X-Discord-Redirect-Uri': redirectUri,
				},
			}
		);
		if (!response.ok) {
			alert('There is a problem with your session token, redirecting to Discord auth');
			redirectToDiscordAuth();
		} else {
			ready.value = true;
		}
	}

	let scopeDestroyed = false;
	onScopeDispose(() => {
		scopeDestroyed = true;
	});

	async function loop(backoff: number = 1_000, isFirst: boolean = false) {
		if (scopeDestroyed) return;
		await checkAccessToken(isFirst ? 0 : undefined)
			.then(() => {
				if (scopeDestroyed) return;
				loop();
			})
			.catch((err) => {
				console.error(err);
				if (scopeDestroyed) return;
				setTimeout(() => loop(Math.min(backoff * 2, 60_000)), backoff);
			});
	}
	const readyPromise = loop(undefined, true);

	return {
		redirectToDiscordAuth,
		redirectToDiscordBotAuth,
		code,
		redirectUri,
		ready,
		readyPromise,
	};
}

export const useDiscordAccess = wrapMixin(_useDiscordAccess, () => 'discord-access');
