import CommunityAwards, {ICommunityAward} from '../models/CommunityAwards';
import {Channel, Guild, GuildMember, Message, MessageCollector, TextChannel} from "discord.js";
import {AwardQuestions} from "./constants/award-questions";
import _omit from 'lodash.omit';

export const sendAwardQuestions = async (message: Message, server: Guild) => {
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

        if (authorId) {
            if (validateAnswers(collectedArray)) {
                console.log('error')
                await message.channel.send('Seems like one of your answers was invalid, please try again!')
                return;
            }
            try {
                const result = await saveAnswers(authorId, collectedArray);
                if (result === null) {
                    await message.channel.send("Looks like you've already submitted your nominations for this year!");
                    return;
                }
                await message.channel.send('Your answers have been recorded! Thank you!')
            } catch (e) {
                console.log(e);
            }
        }
    })
}

const saveAnswers = async (authorId: string, answers: Array<string>) => {
    const existingEntry = await ensureUnique(authorId);
    if (existingEntry) {
        return null;
    }
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

const ensureUnique = async (authorId: string) => {
    return CommunityAwards.exists({discordId: authorId})
}

const validateAnswers = (answers: Array<string>) => Boolean(answers.filter(answer => !answer.length || answer.length > 13).length);

export const reportCurrentVotes = async (nominationChannel?: Channel) => {
    const allNominations: Array<ICommunityAward> = await CommunityAwards.find({});
    const foo = allNominations.map(x => x.answers.map(y => ({...y, discordId: x.discordId}))).flat().map(y => _omit(y, 'question'));

    // https://stackoverflow.com/questions/45258566/javascript-counting-duplicates-in-object-array-and-storing-the-count-as-a-new
    const countedNominations = [...foo.reduce( (mp, o) => {
        const key = JSON.stringify([o.questionId, o.answer, o.discordId]);
        if (!mp.has(key)) {
            mp.set(key, { ...o, count: 0 });
        }
        const val = mp.get(key);
        if (val) {
            val.count++;
        }
        return mp;
    }, new Map<string, { questionId: number, answer: string, count: number, discordId: string}>()).values()];

    let formattedString = '';

    AwardQuestions.forEach((x) => {
        const nominations = countedNominations.filter(nom => nom.questionId === x.order);
        const winner = nominations?.reduce((prev, current) => (prev.count > current.count) ? prev : current, nominations[0]);
        if (winner) {
            formattedString += `\n${x.question}?\n<@${winner.discordId}>: ${winner.count} votes!`;
        }
    });
    return formattedString;
}