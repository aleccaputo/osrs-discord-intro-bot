import {connect} from "../services/DataService";
import * as dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

;(async () => {
    try {
        await connect();
        await User.updateMany({points: {$gte: 0}}, {$set: {points: 0}}, {upsert: true})
        process.exit();
    } catch (e) {
        console.log(e);
    }
})();