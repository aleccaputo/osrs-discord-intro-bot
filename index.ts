import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();

const serverId = process.env.SERVER;
const client = new Discord.Client();

client.once('ready', () => {
    console.log('ready');
});

client.login(process.env.TOKEN);

client.on('message', async (message) => {
    // don't respond to messages from self
    if (message.author.id === client.user?.id) {
        return;
    }
    if (message.channel.type === "dm") {
        const server = client.guilds.cache.find(guild => guild.id === serverId);
        if (!server) {
            await message.channel.send("Looks like you're not in the server.")
            return;
        }
        const content = message.content.toLocaleLowerCase();
        if (content === 'yes')
        {
            const guildMember = server.member(message.author);
            if (process.env.INTRO_ROLE_ID) {
                guildMember?.roles.add(process.env.INTRO_ROLE_ID)
                await message.channel.send("Great, you're all set!")
            }
            return;
        } else if (content === 'no') {
            const guildMember = server.member(message.author);
            if (process.env.NOT_IN_CLAN_ROLE_ID) {
                guildMember?.roles.add(process.env.NOT_IN_CLAN_ROLE_ID)
                // message the mods to inform them
                const mods = server.members.cache.filter(member => member.roles.cache.some(r => r.id === process.env.MOD_ROLE_ID));
                mods.forEach(mod => mod.send(`Please add <@${message.author.id}> to the in game clan`));
                await message.channel.send("No problem, we've messaged the mods and will get you in ASAP")
                return;
            }
        } else {
            const splitMessage = content.length ? content.split(' ') : [];
            if (splitMessage.length < 2 || !splitMessage[0]?.startsWith('!')) {
                await message.channel.send("Looks like there was a problem with your message. Make sure it is at least 2 words, the first being !ign followed by you Oldschool RuneScape name")
                return;
            }
            if (splitMessage[0].toLocaleLowerCase() === '!ign') {
                const server = client.guilds.cache.find(guild => guild.id === serverId)
                if (server) {
                    try {
                        const username = splitMessage.slice(0, 1).join(" ");
                        await server.member(message.author)?.setNickname(username);
                        await message.channel.send("Great! Your name is now set in the discord server!\n Have you been accepted into the in-game clan system? Reply yes or no.")
                    } catch (e) {
                        await message.channel.send("Hmmm, something went wrong, please try again.")
                    }
                }
            }
        }
    }
});

client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = client.channels.cache.get(process.env.WELCOME_CHANNEL_ID ?? '');
    if (welcomeChannel && welcomeChannel.isText()) {
        try {
            await welcomeChannel.send(`Welcome <@${member.id}>! Keep an eye out for a DM to complete your registration!`);
        } catch (e) {
            // still attempt to PM the user if we weren't able to send the message to the channel
            console.warn("Unable to send welcome message to welcome channel...attempting to send PM")
        }
    }
    await member.send("Welcome to the clan! Reply !ign [Your In Game Name]\n For example `!ign Thugga`");
})