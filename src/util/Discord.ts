import { APIConnection, APIUser } from "discord-api-types/v9";
import { Presence } from "discord.js-selfbot-v13";

export interface Session {
	status: string;
	session_id: string;
	client_info: ClientInfo;
	activities: Activity[];
	active?: boolean;
}

export interface Activity {
	type: number;
	state: string;
	name: string;
	id: string;
	emoji?: Emoji;
	created_at: number;
	timestamps?: Timestamps;
	sync_id?: string;
	session_id?: string;
	party?: Party;
	flags?: number;
	details?: string;
	assets?: Assets;
}

export interface Emoji {
	name: string;
}

export interface Party {
	id: string;
}

export interface ClientInfo {
	version: number;
	os: string;
	client: string;
}

export interface GuildPresence {
	user_id: string;
	status: Status;
	client_status: ClientStatus;
	broadcast: null;
	activities: Activity[];
}

export enum LargeText {
	Idling = "Idling",
	Wake = "Wake",
}

export interface Emoji {
	name: string;
	id?: string;
	animated?: boolean;
}

export enum ActivityID {
	A56Acdd357C75176 = "a56acdd357c75176",
	Custom = "custom",
	Eb6Ae5D3E4A3Bfa7 = "eb6ae5d3e4a3bfa7",
	Ec0B28A579Ecb4Bd = "ec0b28a579ecb4bd",
	Spotify1 = "spotify:1",
	The69A65D9Ff28B032B = "69a65d9ff28b032b",
}

export interface Party {
	id: string;
}

export interface Timestamps {
	end?: number;
	start?: number;
}

export interface ClientStatus {
	web?: Status;
	desktop?: Status;
	mobile?: Status;
}

export interface MergedPresences {
	guilds: Array<GuildPresence[]>;
	friends: Friend[];
}

export interface Friend {
	user: Partial<APIUser> & { id: string };
	user_id?: string;
	status: Status;
	client_status: ClientStatus;
	activities: FriendActivity[];
}

export interface FriendActivity {
	url?: string;
	type: number;
	state?: string;
	name: string;
	id: string;
	details?: string;
	created_at: number;
	assets?: Assets;
	emoji?: Emoji;
	timestamps?: Timestamps;
	application_id?: string;
	sync_id?: string;
	session_id?: string;
	party?: Party;
	flags?: number;
}

export interface Assets {
	large_image?: string;
	large_text?: string;
	small_text?: string;
	small_image?: string;
}

export interface Emoji {
	name: string;
	id?: string;
	animated?: boolean;
}

export interface Party {
	id: string;
	size?: number[];
}

export interface Timestamps {
	start?: number;
	end?: number;
}

export interface ClientStatus {
	desktop?: Status;
	mobile?: Status;
	embedded?: Status;
	web?: Status;
}

export enum Status {
	DND = "dnd",
	Idle = "idle",
	Offline = "offline",
	Online = "online",
}

export interface IGuild {
	version: number;
	threads: Thread[];
	stickers: Sticker[];
	stage_instances: any[];
	roles: IRole[];
	properties: Properties;
	premium_subscription_count: number;
	member_count: number;
	lazy: boolean;
	large: boolean;
	joined_at: Date;
	id: string;
	guild_scheduled_events: GuildScheduledEvent[];
	emojis: Emoji[];
	data_mode: DataMode;
	channels: Channel[];
	application_command_counts: { [key: string]: number };
}

export interface Channel {
	type: number;
	topic?: null | string;
	rate_limit_per_user?: number;
	position: number;
	permission_overwrites: PermissionOverwrite[];
	parent_id?: null | string;
	name: string;
	last_message_id?: null | string;
	id: string;
	icon_emoji?: IconEmoji | null;
	flags: number;
	last_pin_timestamp?: Date;
	user_limit?: number;
	status?: null;
	rtc_region?: null | string;
	bitrate?: number;
	default_thread_rate_limit_per_user?: number;
	template?: string;
	default_reaction_emoji?: DefaultReactionEmoji | null;
	available_tags?: AvailableTag[];
	nsfw?: boolean;
	theme_color?: number | null;
	default_auto_archive_duration?: number;
	default_forum_layout?: number;
	video_quality_mode?: number;
	default_sort_order?: number | null;
}

export interface AvailableTag {
	name: string;
	moderated: boolean;
	id: string;
	emoji_name: null | string;
	emoji_id: null | string;
}

export interface DefaultReactionEmoji {
	emoji_name: null | string;
	emoji_id: null | string;
}

export interface IconEmoji {
	name: string;
	id: null | string;
}

export interface PermissionOverwrite {
	type: number;
	id: string;
	deny: string;
	allow: string;
}

export enum DataMode {
	Full = "full",
}

export interface GuildScheduledEvent {
	test: null;
	status: number;
	sku_ids: any[];
	scheduled_start_time: Date;
	scheduled_end_time: Date | null;
	recurrence_rule: null;
	privacy_level: number;
	name: string;
	image: null | string;
	id: string;
	guild_scheduled_event_exceptions: any[];
	guild_id: string;
	entity_type: number;
	entity_metadata: EntityMetadata;
	entity_id: null;
	description: string;
	channel_id: null | string;
	auto_start: boolean;
}

export interface EntityMetadata {
	speaker_ids?: any[];
	location?: string;
}

export interface Properties {
	home_header: null | string;
	system_channel_flags: number;
	nsfw: boolean;
	application_id: null;
	hub_type: null;
	premium_tier: number;
	default_message_notifications: number;
	safety_alerts_channel_id: null | string;
	public_updates_channel_id: null | string;
	verification_level: number;
	id: string;
	banner: null | string;
	splash: null | string;
	name: string;
	premium_progress_bar_enabled: boolean;
	max_stage_video_channel_users: number;
	owner_id: string;
	inventory_settings: InventorySettings | null;
	max_members: number;
	latest_onboarding_question_id: null | string;
	incidents_data: IncidentsData | null;
	description: null | string;
	system_channel_id: null | string;
	nsfw_level: number;
	features: string[];
	icon: null | string;
	rules_channel_id: null | string;
	mfa_level: number;
	afk_channel_id: null | string;
	explicit_content_filter: number;
	preferred_locale: PreferredLocale;
	discovery_splash: null | string;
	vanity_url_code: null | string;
	afk_timeout: number;
	max_video_channel_users: number;
}

export interface IncidentsData {
	raid_detected_at: Date | null;
	invites_disabled_until: Date | null;
	dms_disabled_until: Date | null;
	dm_spam_detected_at: null;
}

export interface InventorySettings {
	is_emoji_pack_collectible: boolean;
}

export enum PreferredLocale {
	EnUS = "en-US",
}

export interface IRole {
	unicode_emoji: null | string;
	tags: Tags;
	position: number;
	permissions: string;
	name: string;
	mentionable: boolean;
	managed: boolean;
	id: string;
	icon: null | string;
	hoist: boolean;
	flags: number;
	color: number;
}

export interface Tags {
	premium_subscriber?: null;
	bot_id?: string;
	integration_id?: string;
	guild_connections?: null;
	subscription_listing_id?: string;
	is_guild_product_role?: boolean;
	available_for_purchase?: null;
}

export interface Sticker {
	type: number;
	tags: string;
	name: string;
	id: string;
	guild_id: string;
	format_type: number;
	description: null | string;
	available: boolean;
	asset?: string;
}

export interface Thread {
	type: number;
	total_message_sent: number;
	thread_metadata: ThreadMetadata;
	rate_limit_per_user: number;
	parent_id: string;
	owner_id: string;
	name: string;
	message_count: number;
	member_ids_preview: string[];
	member_count: number;
	member: Member;
	last_message_id: string;
	id: string;
	guild_id: string;
	flags: number;
	last_pin_timestamp?: Date;
}

export interface Member {
	muted: boolean;
	mute_config: null;
	join_timestamp: Date;
	flags: number;
}

export interface ThreadMetadata {
	locked: boolean;
	invitable?: boolean;
	create_timestamp: Date;
	auto_archive_duration: number;
	archived: boolean;
	archive_timestamp: Date;
}

export interface MergedMember {
	user_id: string;
	roles: string[];
	premium_since: null;
	pending: boolean;
	nick: null | string;
	mute: boolean;
	joined_at: Date;
	flags: number;
	deaf: boolean;
	communication_disabled_until: Date | null;
	avatar: null;
}

export interface PrivateChannel {
	type: number;
	safety_warnings?: any[];
	recipient_ids: string[];
	last_pin_timestamp?: Date;
	last_message_id: null | string;
	is_spam?: boolean;
	id: string;
	flags: number;
	owner_id?: string;
	name?: null | string;
	icon?: null | string;
	is_message_request_timestamp?: Date | null;
	is_message_request?: boolean;
}

export interface ReadyRelationship {
	user_id: string;
	type: number;
	since?: Date;
	nickname: null | string;
	id: string;
}

export interface Ready {
	_trace: string[];
	v: number;
	user: APIUser;
	user_settings_proto?: string;
	guilds: IGuild[];
	relationships: ReadyRelationship[];
	friend_suggestion_count?: number;
	private_channels: PrivateChannel[];
	connected_accounts: APIConnection[];
	notes: Map<string, string>;
	presences: Presence[];
	merged_members: Array<MergedMember[]>;
	merged_presences: MergedPresences;
	users: APIUser[];
	session_id: string;
	session_type: string;
	auth_session_id_hash: string;
	auth_token?: string;
	analytics_token: string;
	required_action?: string;
	country_code: string;
	geo_ordered_rtc_regions: string[];
	shard?: [number, number];
	resume_gateway_url: string;
	api_code_version: number;
	sessions: Session[];
}
