import {
    IAddMembersToGroupRequestBody,
    addMembersToGroupPost,
    groupMembersGet,
    IWOMGroupMember
} from "../data-sources/wise-old-man";

export const addMemberToGroup = async (groupId: string, inGameName: string, verificationCode: string) => {
    const request: IAddMembersToGroupRequestBody = {
        verificationCode: verificationCode,
        members: [{
            username: inGameName,
            role: 'member'
        }]
    }
    try {
        await addMembersToGroupPost(groupId, request);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export const getGroupMembers = async (groupId: string): Promise<Array<IWOMGroupMember> | null> => {
    try {
        return groupMembersGet(groupId);
    } catch (e) {
        console.error(e.message);
        return null;
    }
}