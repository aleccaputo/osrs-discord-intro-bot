import {ChannelType, Interaction, SlashCommandBuilder} from 'discord.js';
import {getUser} from '../services/UserService';
import {lastRequestForPointsTime, rateLimitSeconds} from '../index';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('myPoints')
        .setDescription('Replies with your clan points'),
    async execute(interaction: Interaction) {
        if (interaction.isCommand()) {
            // rate limit any requests that are checking non-discord apis (ie internal storage)
            if (lastRequestForPointsTime && interaction.createdTimestamp - (rateLimitSeconds * 1000) < lastRequestForPointsTime) {
                return;
            }
            const userId = interaction.user.id;
            try {
                const publicSubmissionsChannel = interaction.client.channels.cache.get(process.env.PUBLIC_SUBMISSIONS_CHANNEL_ID ?? '');
                const dbUser = await getUser(userId);
                if (publicSubmissionsChannel && publicSubmissionsChannel.type === ChannelType.GuildText && dbUser) {
                    await publicSubmissionsChannel.send(`<@${userId}> has ${dbUser.points} points`)
                } else {
                    return;
                }
            } catch (e) {
                console.error("unable to fetch a users points", e);
                return;
            }
        }
    },
};