import {GuildMember} from "discord.js";

const isModRank = (member?: GuildMember) => member?.roles.cache.some(r => r.id === process.env.MOD_ROLE_ID
        || r.id === process.env.OWNER_ROLE_ID
        || r.id === process.env.CO_OWNER_ROLE_ID
        || r.id === process.env.ADMIN_ROLE_ID)
    ?? false;

export { isModRank };
