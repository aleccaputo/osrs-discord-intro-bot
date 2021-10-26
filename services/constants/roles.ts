import * as dotenv from "dotenv";
dotenv.config();

interface Role {
    name: string;
    womName: string;
    id: string;
    order: number;
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


