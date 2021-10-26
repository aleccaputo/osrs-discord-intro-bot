import fetch from "node-fetch";


const baseUrl = 'https://api.wiseoldman.net';

export interface IWOMGroupMemberRequest {
    username: string;
    role: string;
}
export interface IAddMembersToGroupRequestBody {
    verificationCode: string;
    members: Array<IWOMGroupMemberRequest>
}
export const addMembersToGroupPost = async (groupId: string, request: IAddMembersToGroupRequestBody) => {
    return fetch(`${baseUrl}/groups/${parseInt(groupId, 10)}/add-members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
}

export interface IWOMGroupMember {
    exp: number;
    id: number;
    username: string;
    displayName: string;
    type: string;
    build: string;
    country: string | null;
    flagged: boolean;
    ehp: number;
    ehb: number;
    ttm: number;
    tt200m: number;
    lastImportedAt: string;
    lastChangedAt: string;
    registeredAt: string;
    updatedAt: string;
    role: string;
    joinedAt: string;
}

export const groupMembersGet = async (groupId: string): Promise<Array<IWOMGroupMember>> => {
    const response = await fetch(`${baseUrl}/groups/${parseInt(groupId, 10)}/members`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Unable to fetch group members');
    }
    return response.json();
}