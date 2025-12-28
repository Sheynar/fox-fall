export type DiscordAccessToken = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
};

export type DiscordUser = {
	id: string;
	username: string;
	discriminator: string;
	global_name?: string;
	avatar?: string;
	bot?: boolean;
	system?: boolean;
	mfa_enabled?: boolean;
	banner?: string;
	accent_color?: number;
	locale?: string;
	verified?: boolean;
	email?: string;
	flags?: number;
	premium_type?: number;
	public_flags?: number;
	avatar_decoration_data?: unknown;
	collectibles?: unknown;
	primary_guild?: {
		identity_guild_id?: string;
		identity_enabled?: boolean;
		tag?: string;
		badge?: string;
	};
};

export type DiscordGuild = {
	id: string;
	name: string;
	icon: string;
	banner: string;
	owner: boolean;
	permissions: string;
	features: string[];
	approximate_member_count: number;
	approximate_presence_count: number;
};

export type DiscordGuildMember = {
	user?: DiscordUser;
	nick?: string;
	/** guild avater hash.
	 * See https://discord.com/developers/docs/reference#image-formatting */
	avatar?: string;
	/** guild banner hash.
	 * See https://discord.com/developers/docs/reference#image-formatting */
	banner?: string;
	roles: string[];
};

export type DiscordRole = {
	id: string;
	name: string;
	/** @deprecated */
	color: number;
	colors: {
		primary_color: number;
		secondary_color?: number;
		tertiary_color?: number;
	};
	/** if this role is pinned in the user listing */
	hoist: boolean;
	/** position of this role (roles with the same position are sorted by id) */
	position: number;
	/** permission bit set */
	permissions: number;
	/** whether this role is managed by an integration */
	managed: boolean;
	/** whether this role is mentionable */
	mentionable: boolean;
	tags?: {
		/** the id of the bot this role belongs to */
		bot_id?: string;
		/** the id of the integration this role belongs to */
		integration_id?: string;
		/** whether this is the guild's Booster role */
		premium_subscriber?: boolean;
		/** the id of this role's subscription sku and listing */
		subscription_listing_id?: string;
		/** whether this role is available for purchase */
		available_for_purchase?: boolean;
		/** whether this role is a guild's linked role */
		guild_connections?: boolean;
	};
	/** role flags combined as a bitfield
	 * See https://discord.com/developers/docs/topics/permissions#role-object-role-flags
	 */
	flags: number;
};
