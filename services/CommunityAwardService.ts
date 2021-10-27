import CommunityAwards, {ICommunityAward} from '../models/CommunityAwards';
import {Channel, Guild, GuildMember, Message, MessageCollector, TextChannel} from "discord.js";
import {AwardQuestions} from "./constants/award-questions";

export const sendAwardQuestions = async (message: Message, server: Guild, nominationChannel?: Channel) => {
    let questionCounter = 0;
    // assert the person sending the response is the same we sent the application to.
    const questionFilter = (m: Message) => m.author.id === message.author.id;
    const collector = new MessageCollector(message.channel as TextChannel, questionFilter, {
        max: AwardQuestions.length - 20
    });
    message.channel.send(AwardQuestions[questionCounter++].question);
    collector.on('collect', m => {
        if (questionCounter < AwardQuestions.length - 20) {
            message.channel.send(AwardQuestions[questionCounter++].question)
        }
    });
    collector.on('end', async collected => {
        const collectedArray = collected.array().map(x => x.toString());

        const authorId = message.author.id;

        if (nominationChannel && nominationChannel.isText() && authorId) {
            if (validateAnswers(collectedArray)) {
                console.log('error')
                await message.channel.send('Seems like one of your answers was invalid, please try again!')
                return;
            }
            try {
                const result = await saveAnswers(authorId, collectedArray);
                console.log(result);
                await message.channel.send('Your answers have been recorded! Thank you!')
                const report = await reportCurrentVotes();
                // nominationChannel.send(report);
            } catch (e) {
                console.log(e);
            }
        }
    })
}

const saveAnswers = async (authorId: string, answers: Array<string>) => {
    const questionAnswers = answers.map((answer, idx) => ({
        question: AwardQuestions[idx].question,
        questionId: AwardQuestions[idx].order,
        answer: answer
    }));
    return new CommunityAwards({
        discordId: authorId,
        answers: questionAnswers
    }).save();
}

const validateAnswers = (answers: Array<string>) => Boolean(answers.filter(answer => !answer.length || answer.length > 13).length);

export const reportCurrentVotes = async () => {
    const allNominations: Array<ICommunityAward> = await CommunityAwards.find({});
    const countedNominations = allNominations.map(record => {
        return record.answers.sort().reduce((prev, cur) => {
            prev[cur.questionId] = cur.answer
            return prev
        }, {} as Record<number, string>)
    });
    /** currently...we want this as one key value where key is question id and value is winner
     * [
     { '1': 'Skoo', '2': 'MrPooter', '3': 'MrPooter', '4': 'Sawdey' },
     { '1': 'MrPooter', '2': 'Sawdey', '3': 'Sawdey', '4': 'MrPooter' }
     ]
     */

    console.log(countedNominations);
    let formattedString = '';
    const entries = Object.entries(countedNominations.sort());
    entries.forEach(([key, value]) => {
        formattedString += `<@${key}>: ${value}`;
    })
    return formattedString;
}