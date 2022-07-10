import {EmbedField} from "discord.js";
import {getUsersByPointsDesc} from "./UserService";
import {formatDiscordUserTag} from "./MessageHelpers";
import {convertNumberToEmoji} from "./DropSubmissionService";

export const createPointsLeaderboard = async () => {
    const users = await getUsersByPointsDesc();
    const topTenUsers = users.slice(0, 10);
    const embedUsers: EmbedField[] = topTenUsers.map((x, idx) => ({name: 'Top 10', value: `${formatDiscordUserTag(x.discordId)}: ${x.points}`, inline: false}));
    const formatted = topTenUsers.map((x, idx) => `${convertNumberToEmoji(idx)} ${formatDiscordUserTag(x.discordId)}: ${x.points} points`)
    const test: EmbedField = {name: 'Top 10', value: formatted.join('\r\n'), inline: false};

    return {
        color: 0x8b0000,
        title: 'ChillTopia Leaderboard',
        description: 'Current clan point leaders',
        fields: test
    };
}