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

	function redirectToDiscordAuth() {
		location.href = `https://discord.com/oauth2/authorize?client_id=1454856481945157795&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=guilds+guilds.members.read`;
	}

	function redirectToDiscordBotAuth() {
		location.href = `https://discord.com/oauth2/authorize?client_id=1454856481945157795&permissions=0&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&integration_type=0&scope=bot+guilds.members.read+guilds`;
	}

	function getFetchHeaders() {
		if (!code) {
			throw new Error('No Discord access code');
		}
		return {
			'X-Discord-Access-Code': code,
			'X-Discord-Redirect-Uri': redirectUri,
		};
	}

	function signOut() {
		code = null;
		discordAuthenticated.value = false;
		sessionStorage.removeItem('discord-access-code');
	}

	const discordAuthenticated = ref(false);
	async function checkAccessToken(timeout: number = 10_000) {
		if (!code) {
			discordAuthenticated.value = false;
			return;
		}
		const response = await fetch(
			`/api/v1/discord/access-token?timeout=${timeout}`,
			{
				method: 'GET',
				headers: {
					'X-Discord-Access-Code': code,
					'X-Discord-Redirect-Uri': redirectUri,
				},
			}
		);
		discordAuthenticated.value = response.ok;
	}

	let scopeDestroyed = false;
	onScopeDispose(() => {
		scopeDestroyed = true;
	});

	async function loop(backoff: number = 1_000, isFirst: boolean = false) {
		if (scopeDestroyed || !code || (ready.value && !discordAuthenticated.value)) return;
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
	const ready = ref(false);
	const readyPromise = loop(undefined, true).finally(() => ready.value = true);

	return {
		redirectToDiscordAuth,
		redirectToDiscordBotAuth,
		getFetchHeaders,
		signOut,
		code,
		redirectUri,
		discordAuthenticated,
		ready,
		readyPromise,
	};
}

export const useDiscordAccess = wrapMixin(_useDiscordAccess, () => 'discord-access');
