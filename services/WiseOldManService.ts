import fetch from "node-fetch";
import {WOMClient, GroupMemberFragment, MembershipWithPlayer} from "@wise-old-man/utils";

export const addMemberToWiseOldMan = async (inGameName: string, womClient: WOMClient): Promise<boolean | null> => {
    if (!process.env.WISE_OLD_MAN_GROUP_ID || !process.env.WISE_OLD_MAN_VERIFICATION_CODE) {
        return null;
    }
    const members: GroupMemberFragment[] = [
        {
            username: inGameName,
            role: 'member'
        }
    ];

    try {
        await womClient.groups.addMembers(parseInt(process.env.WISE_OLD_MAN_GROUP_ID, 10), members, process.env.WISE_OLD_MAN_VERIFICATION_CODE);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export const getGroupMembersAsync = async (womClient: WOMClient): Promise<Array<MembershipWithPlayer>> => {
    if (!process.env.WISE_OLD_MAN_GROUP_ID) {
        console.error('No WOM group id set')
        throw new Error('WOM values not initialized');
    }
    try {
        const group = await womClient.groups.getGroupDetails(parseInt(process.env.WISE_OLD_MAN_GROUP_ID, 10));
        return group.memberships;
    } catch (e) {
        console.error(e)
        throw new Error(`Error requesting members`)
    }
}

export const updateAllMembers = async (womClient: WOMClient): Promise<void> => {
    if (!process.env.WISE_OLD_MAN_GROUP_ID || !process.env.WISE_OLD_MAN_VERIFICATION_CODE) {
        console.error('No WOM group id set')
        throw new Error('WOM values not initialized');
    }
    await womClient.groups.updateAll(parseInt(process.env.WISE_OLD_MAN_GROUP_ID, 10), process.env.WISE_OLD_MAN_VERIFICATION_CODE);
    try {
        await fetch(`https://api.wiseoldman.net/groups/${parseInt(process.env.WISE_OLD_MAN_GROUP_ID, 10)}/update-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({verificationCode: process.env.WISE_OLD_MAN_VERIFICATION_CODE})
        });
    } catch (e) {
        console.error(e);
    }
}