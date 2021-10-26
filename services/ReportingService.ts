import {schedule} from 'node-cron';
import type {Client} from "discord.js";
import dayjs from "dayjs";
import {TimeRole, TimeRoles} from "./constants/roles";
import {GuildMember} from "discord.js";
import {getGroupMembers} from "./WiseOldManService";
import _keyBy from 'lodash.keyby';

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

export const initializeReportMembersEligibleForRankUp = async (client: Client, reportingChannelId: string, serverId: string, groupId: string) => {
        console.log('Kicking off member rankup cron...');
        const server = client.guilds.cache.find(guild => guild.id === serverId);
        if (server) {
            const today = dayjs();
            // dont get from cache, we need an up to date list
            const currentMembers = await server.members.fetch();
            const currentWOMMembers = await getGroupMembers(groupId);
            if (!currentWOMMembers) {
                console.error('Unable to sync members, could not fetch WOM members');
                return;
            }
            const currentDiscordMembersArray = [...currentMembers.array()].filter(x => x.nickname !== null);
            const currentDiscordMembersDictionary = _keyBy(currentDiscordMembersArray, x => x?.nickname?.toLowerCase() ?? '');

            const membersDueForRank = currentWOMMembers.filter(x => x.joinedAt !== null).map((member) => {
                const discordMember = currentDiscordMembersDictionary[member.displayName.toLowerCase()];
                if (discordMember) {
                    // hard casting date since its not picking up on the filter
                    const joinedDate = dayjs(member.joinedAt);
                    const monthsInClan = today.diff(joinedDate, 'month');
                    if (discordMember?.nickname?.toLowerCase() === 'mrpooter') {
                        console.log(joinedDate);
                        console.log(monthsInClan);
                    }
                    const memberRoleIds = discordMember.roles.cache.map(role => role.id);
                    const currentRanks = TimeRoles.filter(x => memberRoleIds.includes(x.id));
                    if (currentRanks && currentRanks.length) {
                        const highestRank = currentRanks.reduce((prev, current) => prev.order > current.order ? prev : current);
                        if (monthsInClan >= highestRank.maxMonths) {
                            const nextRank = TimeRoles.find(x => x.order === highestRank.order + 1);
                            // we can rank this user up!
                            if (nextRank) {
                                return {
                                    userId: discordMember.id,
                                    nextRank: nextRank
                                } as IMemberDueForRank
                            }
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

// grab the wom members, and update ranks in discord based on that data (as it reflects the actual in game clan ranks)
export const initializeClanDiscordSync = async (client: Client, reportingChannelId: string, serverId: string, groupId: string) => {
    const server = client.guilds.cache.find(guild => guild.id === serverId);
    if (server) {
        const currentDiscordMembers = await server.members.fetch();
        if (!currentDiscordMembers) {
            console.error('Unable to sync members, could not fetch discord members');
            return;
        }
        const currentWOMMembers = await getGroupMembers(groupId);
        if (!currentWOMMembers) {
            console.error('Unable to sync members, could not fetch WOM members');
            return;
        }
        // key members by nickname for faster lookups
        const currentDiscordMembersArray = [...currentDiscordMembers.array()].filter(x => x.nickname !== null);
        // ignore since i filter above
        // @ts-ignore
        const currentDiscordMembersDictionary = _keyBy(currentDiscordMembersArray, x => x.nickname.toLowerCase());
        // console.log(currentDiscordMembersDictionary)
        // console.log('______________________________________________________________')
        currentWOMMembers.forEach((womMember) => {
            const discordMember = currentDiscordMembersDictionary[womMember.displayName.toLowerCase()];
            if (discordMember) {
                console.log(discordMember)
            }
            if (discordMember) {
                const memberRoleIds = discordMember.roles.cache.map(role => role.id);
                const currentRanks = TimeRoles.filter(x => memberRoleIds.includes(x.id));
                const highestRank = currentRanks.reduce((prev, current) => prev.order > current.order ? prev : current);
                const womRankOrder = TimeRoles.find(x => x.womName === womMember.role);
                console.log(womRankOrder);
                if (womRankOrder && womRankOrder.order > highestRank.order) {
                    const reportingChannel = client.channels.cache.get(reportingChannelId);
                    if (reportingChannel && reportingChannel.isText()) {
                        let message = `TESTING!!! WOM role is higher than discord for <@${discordMember.id}> ...ranking up in discord`
                        reportingChannel.send(message);
                    }
                }
            }
        });
    }
}



export const scheduleReportMembersEligibleForRankUp = (client: Client, reportingChannelId: string, serverId: string, groupId: string) => {
    schedule('0 21 * * *',  async () => {
        try {
            await initializeReportMembersEligibleForRankUp(client, reportingChannelId, serverId, groupId)
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
