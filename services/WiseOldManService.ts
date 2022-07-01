import fetch from "node-fetch";

export const addMemberToWiseOldMan = async (inGameName: string): Promise<boolean | null> => {
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

export interface WomMember {
    exp: number,
    id: number,
    username: string,
    displayName: string,
    type: string,
    build: string,
    country: string | null,
    flagged: boolean,
    ehp: number,
    ehb: number,
    ttm: number,
    tt200m: number,
    lastImportedAt: string,
    lastChangedAt: string,
    registeredAt: string,
    updatedAt: string,
    role: string,
    joinedAt: string
}

export const getGroupMembersAsync = async (): Promise<Array<WomMember>> => {
    if (!process.env.WISE_OLD_MAN_GROUP_ID) {
        console.error('No WOM group id set')
        throw new Error('WOM values not initialized');
    }
    const response = await fetch(`https://api.wiseoldman.net/groups/${parseInt(process.env.WISE_OLD_MAN_GROUP_ID, 10)}/members`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        console.error(response.body)
        throw new Error(`Error requesting members ${response.status}`)
    }
    return response.json();
}

export const updateAllMembers = async (): Promise<void> => {
    if (!process.env.WISE_OLD_MAN_GROUP_ID) {
        console.error('No WOM group id set')
        throw new Error('WOM values not initialized');
    }

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