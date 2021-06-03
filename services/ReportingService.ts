import {schedule} from 'node-cron';
import type {Client} from "discord.js";
import dayjs from "dayjs";
import {TimeRole, TimeRoles} from "./constants/roles";

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
    console.log(message)
    return message;
}

export const initializeReportMembersEligibleForRankUp = async (client: Client, reportingChannelId: string, serverId: string) => {
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
                    console.log('message time!')
                    const message = formatRankUpMessage(membersDueForRank)
                    reportingChannel.send(message);
                }
            }
        }
}

export const scheduleReportMembersEligibleForRankUp = (client: Client, reportingChannelId: string, serverId: string) => {
    schedule('0 17 * * *',  () => {
        initializeReportMembersEligibleForRankUp(client, reportingChannelId, serverId)
    });
}
