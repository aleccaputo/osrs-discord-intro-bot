import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import {DMChannel} from "discord.js";
import fetch from 'node-fetch';
import {
    initializeReportMembersEligibleForRankUp,
    scheduleReportMembersEligibleForRankUp
} from "./services/ReportingService";
dotenv.config();

const serverId = process.env.SERVER;
const client = new Discord.Client();

client.login(process.env.TOKEN);

client.once('ready', async () => {
    console.log('ready');
    try {
        await initializeReportMembersEligibleForRankUp(client, process.env.REPORTING_CHANNEL_ID ?? '', serverId ?? '');
        scheduleReportMembersEligibleForRankUp(client, process.env.REPORTING_CHANNEL_ID ?? '', serverId ?? '');
    } catch (e) {
        console.error(e);
        console.error("Failed to check ranks, check env vars?")
    }
});


const sendLastMessage = async (channel: DMChannel) => {
    if (process.env.INTRO_CHANNEL_ID && process.env.TIME_IN_CLAN_CHANNEL_ID)
    await channel.send(`Please read the <#${process.env.INTRO_CHANNEL_ID}> to get yourself familiar with the clan.
Next go to <#${process.env.TIME_IN_CLAN_CHANNEL_ID}> and send a message in the following format:
\`\`\`IGN: [Your OSRS in game name]
Joined: [Date you joined the clan]
Reference: [Who told you about the clan]\`\`\``)
}

const addMemberToWiseOldMan = async(inGameName: string): Promise<boolean | null> => {
    if (!process.env.WISE_OLD_MAN_GROUP_ID || !process.env.WISE_OLD_MAN_VERIFICATION_CODE) {
        return null;
    }

    const body = {
        verificationCode: process.env.WISE_OLD_MAN_VERIFICATION_CODE,
        members: [
            {
                username: inGameName,
                role: 'member'
            }
        ]
    };

    try {
        await fetch(`https://api.wiseoldman.net/groups/${parseInt(process.env.WISE_OLD_MAN_GROUP_ID, 10)}/add-members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

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

        const mods = server.members.cache.filter(member => member.roles.cache.some(r => r.id === process.env.MOD_ROLE_ID));
        const content = message.content.toLocaleLowerCase();
        if (content === 'yes')
        {
            const guildMember = server.member(message.author);
            if (process.env.INTRO_ROLE_ID) {
                guildMember?.roles.add(process.env.INTRO_ROLE_ID);
                // dont have into role and not in clan role at the same time
                if (process.env.NOT_IN_CLAN_ROLE_ID) {
                    guildMember?.roles.remove(process.env.NOT_IN_CLAN_ROLE_ID);
                }
                await message.channel.send("Great, you're all set!")
                await sendLastMessage(message.channel);
            }
            return;
        } else if (content === 'no') {
            const guildMember = server.member(message.author);
            if (process.env.NOT_IN_CLAN_ROLE_ID) {
                guildMember?.roles.add(process.env.NOT_IN_CLAN_ROLE_ID)
                if (process.env.INTRO_ROLE_ID) {
                    guildMember?.roles.remove(process.env.INTRO_ROLE_ID);
                }
                // message the mods to inform them
                mods.forEach(mod => mod.send(`Please add <@${message.author.id}> to the in game clan`));
                await message.channel.send("No problem, we've messaged the mods and will get you in ASAP")
                await sendLastMessage(message.channel);
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
                        const username = splitMessage.slice(1).join(" ");
                        await server.member(message.author)?.setNickname(username);
                        await message.channel.send("Great! Your name is now set in the discord server!\n Have you been accepted into the in-game clan system? Reply yes or no.")
                        const response = await addMemberToWiseOldMan(username);
                        if (!response) {
                            mods.forEach(mod => mod.send(`Unable to add <@${message.author.id}> to wise old man.`));
                        }
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
});

client.on('guildMemberRemove', async (member) => {
    if (process.env.REPORTING_CHANNEL_ID) {
        const reportingChannel = client.channels.cache.get(process.env.REPORTING_CHANNEL_ID);
        if (reportingChannel && reportingChannel.isText()) {
            try {
                await reportingChannel.send(`<@${member.id}> has left the server. OSRS name is ${member.nickname}`);
            } catch (e) {
                // still attempt to PM the user if we weren't able to send the message to the channel
                console.log("unable to send server leave message")
            }
        }
    }
});
