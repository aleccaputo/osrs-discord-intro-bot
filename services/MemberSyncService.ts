// used to sync discord members and the in game clan. Currently leverages wise old man
import {Guild} from "discord.js";
import {getGroupMembersAsync, WomMember} from "./WiseOldManService";
import {TimeRoles} from "./constants/roles";

interface IMemberSyncModel {
    isInGameLowerThanDiscord: boolean;
    discordId: string;
    higherRank: string;
}
export const getConsolidatedMemberDifferencesAsync = async (server: Guild): Promise<Array<IMemberSyncModel>> => {
    const currentDiscordMembersPromise = server.members.fetch();
    const currentWomMembersPromise = getGroupMembersAsync();

    const [discordMembers, womMembers] = await Promise.all([currentDiscordMembersPromise, currentWomMembersPromise]);
    const womDict = womMembers.reduce((result, filter) => {
        result[filter.displayName.toLowerCase()] = filter;
        return result;
    }, {} as Record<string, WomMember>);
    const newModel: Array<IMemberSyncModel | null> = discordMembers.map(dm => {
        const womMember = womDict[dm.nickname?.toLowerCase() ?? dm.displayName.toLowerCase()];
        if (womMember) {
            const memberRoleIds = dm.roles.cache.map(role => role.id);
            const currentRanks = TimeRoles.filter(x => memberRoleIds.includes(x.id));
            if (currentRanks) {
                const highestDiscordRank = currentRanks.reduce((prev, current) => prev.order > current.order ? prev : current);

                const womRank = womMember.role;
                const mappedWomRank = TimeRoles.find(x => x.name.toLowerCase() === womRank?.toLowerCase());
                if (mappedWomRank) {
                    if (highestDiscordRank.order > mappedWomRank.order) {
                        return {
                            isInGameLowerThanDiscord: true,
                            discordId: dm.id,
                            higherRank: highestDiscordRank.name
                        } as IMemberSyncModel
                    } else if (highestDiscordRank.order < mappedWomRank.order) {
                        return {
                            isInGameLowerThanDiscord: false,
                            discordId: dm.id,
                            higherRank: mappedWomRank.name
                        } as IMemberSyncModel
                    }
                }
            }
        }
        return null;
    });
    return newModel.filter((x): x is IMemberSyncModel => x !== null);
}

export const formatSyncMessage = (syncModel: Array<IMemberSyncModel>) => {
    let message = 'There are some differences between WOM and Discord ranks...';
    syncModel.forEach(x => {
        if (x) {
            message += `\n<@${x.discordId}> has an in game rank that is ${x.isInGameLowerThanDiscord ? 'lower' : 'higher'} than their discord rank. Both ranks should be ${x.higherRank}`;
        }
    });
    return message;
}