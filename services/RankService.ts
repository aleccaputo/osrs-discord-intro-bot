import {EmbedField} from "discord.js";
import {getUsersByPointsDesc} from "./UserService";
import {formatDiscordUserTag} from "./MessageHelpers";

export const createPointsLeaderboard = async () => {
    const users = await getUsersByPointsDesc();
    const topTenUsers = users.slice(0, 10);
    const embedUsers: EmbedField[] = topTenUsers.map((x, idx) => ({name: (idx + 1).toString(10), value: `${formatDiscordUserTag(x.discordId)}: ${x.points}`, inline: false}));
    return {
        color: 0x8b0000,
        title: 'ChillTopia Leaderboard',
        description: 'Current clan point leaders',
        fields: embedUsers
    };
}