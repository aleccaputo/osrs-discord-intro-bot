import * as dotenv from "dotenv";
dotenv.config();

interface Role {
    name: string,
    id: string;
    order: number;
    womName: string;
}

export interface TimeRole extends Role {
    minMonths: number;
    maxMonths: number;
}

export const TimeRoles: Array<TimeRole> = [
    {
        name: 'Short Green Guy Rank',
        womName: 'short green guy',
        id: process.env.RANK_ONE_ID ?? '1',
        minMonths: 0,
        maxMonths: 1,
        order: 0
    },
    {
        name: 'Goblin Rank',
        womName: 'goblin',
        id: process.env.RANK_TWO_ID ?? '2',
        minMonths: 1,
        maxMonths: 3,
        order: 1
    },
    {
        name: 'Bob Rank',
        womName: 'bob',
        id: process.env.RANK_THREE_ID ?? '3',
        minMonths: 3,
        maxMonths: 6,
        order: 2
    },
    {
        name: 'Imp Rank',
        womName: 'imp',
        id: process.env.RANK_FOUR_ID ?? '4',
        minMonths: 6,
        maxMonths: 10000,
        order: 3
    }
]

export interface PointsRole extends Role {
    minPoints: number;
    maxPoints: number;
}
export const PointsRoles: Array<PointsRole> = [
    {
        name: 'Dunce',
        womName: 'dunce',
        id: process.env.RANK_ONE_ID ?? '1',
        minPoints: 0,
        maxPoints: 100,
        order: 1,
    },
    {
        name: 'Sapphire',
        id: process.env.RANK_TWO_ID ?? '2',
        minPoints: 100,
        maxPoints: 200,
        order: 2,
        womName: 'sapphire'
    },
    {
        name: 'Emerald',
        id: process.env.RANK_THREE_ID ?? '3',
        minPoints: 200,
        maxPoints: 300,
        order: 3,
        womName: 'emerald'
    },
    {
        name: 'Ruby',
        id: process.env.RANK_FOUR_ID ?? '4',
        minPoints: 300,
        maxPoints: 400,
        order: 4,
        womName: 'ruby'
    },
    {
        name: 'Diamond',
        id: process.env.RANK_FIVE_ID ?? '5',
        minPoints: 400,
        maxPoints: 500,
        order: 5,
        womName: 'diamond'
    },
    {
        name: 'Dragonstone',
        id: process.env.RANK_SIX_ID ?? '6',
        minPoints: 600,
        maxPoints: 800,
        order: 6,
        womName: 'dragonstone'
    },
    {
        name: 'Onyx',
        id: process.env.RANK_SEVEN_ID ?? '7',
        minPoints: 800,
        maxPoints: 1000,
        order: 7,
        womName: 'onyx'
    },
    {
        name: 'Zenyte',
        id: process.env.RANK_EIGHT_ID ?? '8',
        minPoints: 1000,
        maxPoints: 100000,
        order: 7,
        womName: 'zenyte'
    }
]


