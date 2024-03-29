import {Schema, Document, model, Model} from 'mongoose';

interface ICommunityAwardAnswer {
    question: string;
    questionId: number;
    answer: string;
}
export interface ICommunityAward extends Document {
    discordId: string,
    answers: Array<ICommunityAwardAnswer>
}

const CommunityAwardsSchema = new Schema<ICommunityAward>({
    discordId: {
        type: String,
        required: true,
    },
    answers: [Schema.Types.Mixed]
});

const CommunityAwards: Model<ICommunityAward> = model('CommunityAwards', CommunityAwardsSchema, '2022Nominations');

export default CommunityAwards;
