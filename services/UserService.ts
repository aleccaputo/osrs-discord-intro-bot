import User from "../models/User";
import dayjs from "dayjs";
import {GuildMember} from "discord.js";

export const createUser = async (member: GuildMember | null) => {
    if (!member) {
        throw new Error('Unable to add member as user');
    }
    const existingMember = User.findOne({discordId: member.id});
    if (existingMember !== null) {
        throw new Error('Member already exists as user');
    }
    await new User({
        discordId: member.id,
        points: 0,
        joined: dayjs(member.joinedAt?.toUTCString() ?? new Date().toUTCString()).toISOString()
    }).save();
}
