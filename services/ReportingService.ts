import {schedule} from 'node-cron';
import type {Client} from "discord.js";
import dayjs from "dayjs";
import {TimeRole, TimeRoles} from "./constants/roles";
import {GuildMember} from "discord.js";

interface IMemberDueForRank {
    userId: string;
    nextRank: TimeRole;
}

const formatRankUpMessage = (members: Array<IMemberDueForRank | undefined>) => {
    let message = 'We have some users ready to rank up!'
    members.forEach(member => {
        if (member) {
            message += `\n<@${member.userId}> -> ${member.nextRank.name}`
        }
    });
    console.log(message);
    return message;
}

const formatNotInClanMessage = (members: Array<GuildMember>) => {
    let message = 'The following members have the "Not In Clan" Role:'
    members.forEach(member => {
        if (member) {
            message += `\n<@${member.id}>`
        }
    });
    message += '\nOnce they are in the clan, please remove this role';
    console.log(message);
    return message;
}

const initializeReportMembersEligibleForRankUp = async (client: Client, reportingChannelId: string, serverId: string) => {
        console.log('Kicking off member rankup cron...');
        const server = client.guilds.cache.find(guild => guild.id === serverId);
        if (server) {
            const today = dayjs();
            // dont get from cache, we need an up to date list
            const currentMembers = await server.members.fetch();
            const membersDueForRank = currentMembers.filter(x => x.joinedAt !== null).map((member) => {
                // hard casting date since its not picking up on the filter
                const joinedDate = dayjs(member.joinedAt as Date);
                const monthsInServer = today.diff(joinedDate, 'month');
                const memberRoleIds = member.roles.cache.map(role => role.id);
                const currentRanks = TimeRoles.filter(x => memberRoleIds.includes(x.id));
                if (currentRanks && currentRanks.length) {
                    const highestRank = currentRanks.reduce((prev, current) => prev.order > current.order ? prev : current);
                    if (monthsInServer >= highestRank.maxMonths) {
                        const nextRank = TimeRoles.find(x => x.order === highestRank.order + 1);
                        // we can rank this user up!
                        if (nextRank) {
                            return {
                                userId: member.id,
                                nextRank: nextRank
                            } as IMemberDueForRank
                        }
                    }
                }
            }).filter(x => x !== undefined);
            console.log(membersDueForRank)
            if (membersDueForRank && membersDueForRank.length) {
                const reportingChannel = client.channels.cache.get(reportingChannelId);
                if (reportingChannel && reportingChannel.isText()) {
                    const message = formatRankUpMessage(membersDueForRank)
                    try {
                        await reportingChannel.send(message);
                    } catch (e) {
                        console.log('Error sending rank up report to channel');
                        console.log(e);
                    }
                }
            }
        }
}

const initializeReportMembersNotInClan = async (client: Client, reportingChannelId: string, serverId: string, notInClanId: string) => {
    console.log('Kicking off member not in clan cron...');
    const server = client.guilds.cache.find(guild => guild.id === serverId);
    if (server) {
        const currentMembers = await server.members.fetch();
        const membersWithNotInClanRole = currentMembers.filter(x => x.roles.cache.some(y => y.id === notInClanId)).array();
        if (membersWithNotInClanRole.length) {
            const reportingChannel = client.channels.cache.get(reportingChannelId);
            if (reportingChannel && reportingChannel.isText()) {
                const message = formatNotInClanMessage(membersWithNotInClanRole);
                try {
                    await reportingChannel.send(message);
                } catch (e) {
                    console.log('Error sending not in clan report to channel');
                    console.log(e);
                }
            }
        }

    }
}



export const scheduleReportMembersEligibleForRankUp = (client: Client, reportingChannelId: string, serverId: string) => {
    schedule('0 21 * * *',  async () => {
        try {
            await initializeReportMembersEligibleForRankUp(client, reportingChannelId, serverId)
        } catch (e) {
            console.log(e);
        }
    });
}

export const scheduleReportMembersNotInClan = (client: Client, reportingChannelId: string, serverId: string, notInClanId: string) => {
    schedule('5 21 * * *',  async () => {
        try {
            await initializeReportMembersNotInClan(client, reportingChannelId, serverId, notInClanId)
        } catch (e) {
            console.log(e);
        }
    });
}
