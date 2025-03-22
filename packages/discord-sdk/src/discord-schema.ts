import { z } from 'zod';

/**
 * User schema for representing Discord users.
 */
export const DiscordUserSchema = z.object({
  id: z.string().describe('User ID'),
  username: z.string().describe('Username of the user'),
  avatar: z.string().nullable().describe('Avatar hash or null if none'),
  discriminator: z.string().describe('Discriminator (old system)'),
  public_flags: z.number().describe('Public flags of the user'),
  flags: z.number().describe("User's internal flags"),
  bot: z.boolean().optional().describe('Whether the user is a bot'),
  banner: z.string().nullable().describe('Banner image hash'),
  accent_color: z.number().nullable().describe('Profile accent color'),
  global_name: z.string().nullable().describe('Global display name'),
  avatar_decoration_data: z.any().nullable().describe('Avatar decoration'),
  collectibles: z.any().nullable().describe('Collectibles information'),
  banner_color: z.string().nullable().describe('Hex color of the banner'),
  clan: z.any().nullable().describe('Clan-related information'),
  primary_guild: z.any().nullable().describe('Primary guild information'),
});

/**
 * Image schema for embeds.
 */
export const DiscordImageSchema = z.object({
  url: z.string().describe('Direct image URL'),
  proxy_url: z.string().optional().describe('Proxy URL for image'),
  width: z.number().optional().describe('Image width'),
  height: z.number().optional().describe('Image height'),
  flags: z.number().optional().describe('Image-related flags'),
});

/**
 * Embed schema (used for rich content in messages).
 */
export const DiscordEmbedSchema = z.object({
  type: z.string().describe("Embed type, usually 'rich'"),
  image: DiscordImageSchema.optional().describe('Image inside the embed'),
});

/**
 * Message schema representing messages sent in Discord channels.
 */
export const DiscordMessageSchema = z.object({
  id: z.string().describe('Message ID'),
  type: z.number().describe('Message type identifier'),
  content: z.string().describe('Text content of the message'),
  mentions: z.array(z.any()).describe('List of mentioned users'),
  mention_roles: z.array(z.string()).describe('List of mentioned roles'),
  attachments: z.array(z.any()).describe('List of attachments'),
  embeds: z
    .array(DiscordEmbedSchema)
    .describe('Embeds included in the message'),
  timestamp: z.string().describe('Message creation timestamp'),
  edited_timestamp: z.string().nullable().describe('Time of last edit'),
  flags: z.number().describe('Bitwise flags for message properties'),
  components: z.array(z.any()).describe('Message components (buttons, menus)'),
  channel_id: z
    .string()
    .describe('ID of the channel where the message was sent'),
  author: DiscordUserSchema.describe('User who sent the message'),
  pinned: z.boolean().describe('Whether the message is pinned'),
  mention_everyone: z.boolean().describe('Whether @everyone was mentioned'),
  tts: z.boolean().describe('Whether the message is a TTS message'),
  reactions: z
    .array(
      z.object({
        emoji: z.object({
          id: z.string().nullable().describe('Emoji ID (null for Unicode)'),
          name: z.string().describe('Emoji name'),
        }),
        count: z.number().describe('Total number of reactions'),
        count_details: z.object({
          burst: z.number().describe('Burst reactions count'),
          normal: z.number().describe('Regular reactions count'),
        }),
        burst_colors: z.array(z.any()).describe('Color details for bursts'),
        me_burst: z.boolean().describe('Whether the bot used burst reaction'),
        burst_me: z.boolean().describe('Whether the bot used burst reaction'),
        me: z.boolean().describe('Whether the bot reacted'),
        burst_count: z.number().describe('Burst reaction count'),
      }),
    )
    .optional()
    .describe('List of reactions'),
});

/**
 * Guild (server) schema.
 */
export const DiscordGuildSchema = z.object({
  id: z.string().describe('Guild (server) ID'),
  name: z.string().describe('Guild name'),
  icon: z.string().nullable().describe('Guild icon hash'),
  description: z.string().nullable().describe('Guild description'),
  home_header: z.any().nullable().describe('Home header details'),
  splash: z.any().nullable().describe('Guild splash image'),
  discovery_splash: z.any().nullable().describe('Splash image for discovery'),
  features: z.array(z.any()).describe('Guild feature list'),
  banner: z.any().nullable().describe('Banner image hash'),
  owner_id: z.string().describe('User ID of the guild owner'),
  application_id: z.any().nullable().describe('Application ID if bot-owned'),
  region: z.string().describe('Voice region (deprecated)'),
  afk_channel_id: z.any().nullable().describe('AFK channel ID'),
  afk_timeout: z.number().describe('AFK timeout in seconds'),
  system_channel_id: z.any().nullable().describe('System message channel ID'),
  system_channel_flags: z.number().describe('Flags for system channel'),
  widget_enabled: z.boolean().describe('Whether widget is enabled'),
  widget_channel_id: z.string().nullable().describe('Widget channel ID'),
  verification_level: z.number().describe('Guild verification level'),
  roles: z
    .array(
      z.object({
        id: z.string().describe('Role ID'),
        name: z.string().describe('Role name'),
        description: z.string().nullable().describe('Role description'),
        permissions: z.string().describe('Bitwise permission flags'),
        position: z.number().describe('Role position in hierarchy'),
        color: z.number().describe('Role color in decimal'),
        colors: z.object({
          primary_color: z.number().describe('Primary role color'),
          secondary_color: z.any().nullable().describe('Secondary color'),
          tertiary_color: z.any().nullable().describe('Tertiary color'),
        }),
        hoist: z.boolean().describe('Whether role is hoisted'),
        managed: z.boolean().describe('Whether the role is managed'),
        mentionable: z.boolean().describe('Whether the role is mentionable'),
        icon: z.any().nullable().describe('Role icon hash'),
        unicode_emoji: z.any().nullable().describe('Role emoji'),
        flags: z.number().describe('Role flags'),
        tags: z.any().optional().describe('Tags related to the role'),
      }),
    )
    .describe('List of roles in the guild'),
  default_message_notifications: z
    .number()
    .describe('Default notification setting'),
  mfa_level: z.number().describe('Multi-factor authentication level'),
  explicit_content_filter: z.number().describe('Explicit content filter level'),
  max_presences: z.any().nullable().describe('Max presence count'),
  max_members: z.number().describe('Max members allowed in the guild'),
  max_stage_video_channel_users: z.number().describe('Max stage video users'),
  max_video_channel_users: z.number().describe('Max video call users'),
  vanity_url_code: z.any().nullable().describe('Custom vanity URL code'),
  premium_tier: z.number().describe('Boost tier of the guild'),
  premium_subscription_count: z.number().describe('Number of boosts'),
  preferred_locale: z.string().describe('Preferred language setting'),
  rules_channel_id: z.any().nullable().describe('Rules channel ID'),
  safety_alerts_channel_id: z
    .any()
    .nullable()
    .describe('Safety alerts channel'),
  public_updates_channel_id: z
    .any()
    .nullable()
    .describe('Public updates channel'),
  hub_type: z.any().nullable().describe('Type of hub (if applicable)'),
  premium_progress_bar_enabled: z
    .boolean()
    .describe('Whether progress bar is enabled'),
  latest_onboarding_question_id: z
    .any()
    .nullable()
    .describe('Last onboarding question'),
  nsfw: z.boolean().describe('Whether the guild is NSFW'),
  nsfw_level: z.number().describe('NSFW content level'),
  emojis: z.array(z.any()).describe('List of guild emojis'),
  stickers: z.array(z.any()).describe('List of guild stickers'),
  incidents_data: z.any().nullable().describe('Incident-related data'),
  inventory_settings: z.any().nullable().describe('Inventory settings'),
  embed_enabled: z.boolean().describe('Whether server widget is enabled'),
  embed_channel_id: z.string().nullable().describe('Embed channel ID'),
});

/**
 * Combined response types.
 */
export const DiscordResponses = {
  MessageResponse: DiscordMessageSchema,
  UserResponse: DiscordUserSchema,
  GuildResponse: DiscordGuildSchema,
};
