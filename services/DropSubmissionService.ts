import {Emoji} from "discord.js";
import User from "../models/User";

// wonder if the intl lib has something for this
const convertEmojiToNumber = (emoji: Emoji) => {
    switch (emoji.name) {
        case '1️⃣':
            return 1;
        case '2️⃣':
            return 2;
        case '3️⃣':
            return 3;
        case '4️⃣':
            return 4;
        case '5️⃣':
            return 5;
        case '6️⃣':
            return 6;
        case '7️⃣':
            return 7;
        case '8️⃣':
            return 8;
        case '9️⃣':
            return 9;
        case '🔟':
            return 10;
        default:
            return null;
    }
}
export const processPoints = async (emoji: Emoji, userDiscordId: string) => {
    const pointValue = convertEmojiToNumber(emoji);
    if (pointValue) {
        try {
            const user = await User.findOne({discordId: userDiscordId});
            if (user) {
                const newPoints = user.points + pointValue;
                user.points = newPoints;
                user.save();
                return user.points;
            }
        } catch (e) {
            console.error(e);
        }
    }
    return null;
}