import type {
	DiscordAccessToken,
	DiscordGuild,
	DiscordGuildMember,
	DiscordRole,
} from '@packages/data/dist/discord.js';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_OAUTH2_TOKEN_URL = `${DISCORD_API_URL}/oauth2/token`;

function getAuthorizationHeaders() {
	const clientId = process.env.DISCORD_CLIENT_ID;
	const clientSecret = process.env.DISCORD_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error('DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET must be set');
	}
	return {
		Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
	};
}

const activeAccessTokens = new Map<
	string,
	Promise<DiscordAccessToken & { expiresAt: number }>
>();

async function provisionAccessToken(code: string, redirectUri: string) {
	const response = await fetch(DISCORD_OAUTH2_TOKEN_URL, {
		method: 'POST',
		body: new URLSearchParams({
			code: code,
			grant_type: 'authorization_code',
			client_id: process.env.DISCORD_CLIENT_ID!,
			client_secret: process.env.DISCORD_CLIENT_SECRET!,
			redirect_uri: redirectUri,
		}),
		headers: getAuthorizationHeaders(),
	});
	if (!response.ok) {
		throw new Error(`Failed to get access token: ${await response.text()}`);
	}
	const data: DiscordAccessToken = await response.json();
	return {
		...data,
		expiresAt: Date.now() + data.expires_in * 1000,
	};
}

async function refreshAccessToken(refresh_token: string) {
	const response = await fetch(DISCORD_OAUTH2_TOKEN_URL, {
		method: 'POST',
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
		}),
		headers: getAuthorizationHeaders(),
	});
	if (!response.ok) {
		throw new Error(`Failed to refresh access token: ${await response.text()}`);
	}
	const data: DiscordAccessToken = await response.json();
	return {
		...data,
		expiresAt: Date.now() + data.expires_in * 1000,
	};
}

async function validateAccessToken(
	accessToken: DiscordAccessToken & { expiresAt: number }
) {
	if (accessToken.expiresAt > Date.now() + 60_000) {
		return accessToken;
	}

	const refreshedToken = await refreshAccessToken(accessToken.refresh_token);
	return {
		...refreshedToken,
		expiresAt: Date.now() + refreshedToken.expires_in * 1000,
	};
}

export async function getAccessToken(code: string, redirectUri: string) {
	const existingCode = await activeAccessTokens.get(code)?.catch(() => undefined);
	if (existingCode) {
		const output = validateAccessToken(existingCode);
		activeAccessTokens.set(code, output);
		return await output;
	} else {
		const output = await provisionAccessToken(code, redirectUri);
		activeAccessTokens.set(code, Promise.resolve(output));
		return output;
	}
}

export async function revokeAccessToken(access_token: string) {
	const response = await fetch(`${DISCORD_API_URL}/oauth2/token/revoke`, {
		method: 'POST',
		body: new URLSearchParams({
			token: access_token,
			token_type_hint: 'access_token',
		}),
		headers: getAuthorizationHeaders(),
	});
	if (!response.ok) {
		throw new Error(`Failed to revoke access token: ${await response.text()}`);
	}
	return response.ok;
}

const guildsCache = new Map<string, DiscordGuild[]>();
export async function getUserGuilds(accessToken: DiscordAccessToken) {
	const cachedGuilds = guildsCache.get(accessToken.access_token);
	if (cachedGuilds) {
		return cachedGuilds;
	}
	let response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`,
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to get user guilds: ${await response.text()}`);
	}
	const guilds: DiscordGuild[] = await response.json();
	guildsCache.set(accessToken.access_token, guilds);
	setTimeout(
		() => {
			guildsCache.delete(accessToken.access_token);
		},
		5 * 60 * 1000
	);
	return guilds;
}

const guildMembersCache = new Map<string, DiscordGuildMember>();
export async function getUserGuildMember(
	accessToken: DiscordAccessToken,
	guildId: string
) {
	const cachedMember = guildMembersCache.get(
		`${accessToken.access_token}-${guildId}`
	);
	if (cachedMember) {
		return cachedMember;
	}
	let response = await fetch(
		`${DISCORD_API_URL}/users/@me/guilds/${guildId}/member`,
		{
			headers: {
				Authorization: `Bearer ${accessToken.access_token}`,
			},
		}
	);
	if (!response.ok) {
		throw new Error(
			`Failed to get user guild member: ${await response.text()}`
		);
	}
	const member: DiscordGuildMember = await response.json();
	guildMembersCache.set(`${accessToken.access_token}-${guildId}`, member);
	setTimeout(
		() => {
			guildMembersCache.delete(`${accessToken.access_token}-${guildId}`);
		},
		5 * 60 * 1000
	);
	return member;
}

const guildRolesCache = new Map<string, DiscordRole[]>();
export async function getGuildRoles(
	guildId: string
) {
	const cachedRoles = guildRolesCache.get(
		guildId
	);
	if (cachedRoles) {
		return cachedRoles;
	}
	let response = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/roles`, {
		headers: {
			Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN!}`,
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to get guild roles: ${await response.text()}`);
	}
	const roles: DiscordRole[] = await response.json();
	guildRolesCache.set(guildId, roles);
	setTimeout(
		() => {
			guildRolesCache.delete(guildId);
		},
		5 * 60 * 1000
	);
	return roles;
}

const guildRoleCache = new Map<string, DiscordRole>();
export async function getGuildRole(
	accessToken: DiscordAccessToken,
	guildId: string,
	roleId: string
) {
	const cachedRole = guildRoleCache.get(
		`${accessToken.access_token}-${guildId}-${roleId}`
	);
	if (cachedRole) {
		return cachedRole;
	}
	let response = await fetch(
		`${DISCORD_API_URL}/guilds/${guildId}/roles/${roleId}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken.access_token}`,
			},
		}
	);
	if (!response.ok) {
		throw new Error(`Failed to get guild role: ${await response.text()}`);
	}
	const roles: DiscordRole = await response.json();
	guildRoleCache.set(`${accessToken.access_token}-${guildId}-${roleId}`, roles);
	setTimeout(
		() => {
			guildRoleCache.delete(`${accessToken.access_token}-${guildId}-${roleId}`);
		},
		5 * 60 * 1000
	);
	return roles;
}

export async function getUserRoles(
	accessToken: DiscordAccessToken,
	whitelist?: Map<string, string[]>
) {
	const output = new Map<DiscordGuild, Set<DiscordRole>>();

	const guilds: DiscordGuild[] = await getUserGuilds(accessToken);

	for (const guild of guilds) {
		if (whitelist && !whitelist.has(guild.id)) {
			continue;
		}
		const [member, guildRoles] = await Promise.all([
			getUserGuildMember(accessToken, guild.id),
			getGuildRoles(guild.id),
		]);
		const roleMap = new Map<string, DiscordRole>();
		for (const role of guildRoles) {
			roleMap.set(role.id, role);
		}
		const memberRoles = member.roles
			.filter((roleId) => {
				if (!whitelist) return true;
				const guildRoles = whitelist.get(guild.id);
				if (!guildRoles || guildRoles.length === 0) return true;
				return guildRoles.includes(roleId);
			})
			.map((roleId) => roleMap.get(roleId)!);

		if (memberRoles.length === 0) continue;

		output.set(guild, new Set(memberRoles));
	}

	return output;
}
