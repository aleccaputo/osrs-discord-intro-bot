import {ChannelType, ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {createPointsLeaderboard} from "../services/RankService";

export const command = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See ChillTopia\'s current point leaders!'),
    async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.guild) {
            try {
                const embed = await createPointsLeaderboard(interaction.guild);
                await interaction.reply({embeds: [embed]});
                return;
            } catch (e) {
                console.error("unable to create leaderboard", e);
                return;
            }
        } else {
            await interaction.reply('There was a problem generating the leaderboard');
            return;
        }
    }
};
