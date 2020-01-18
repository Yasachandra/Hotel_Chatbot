import { get } from "lodash";

import HttpService from "../RequestHandler/request.handler";
import config from "../config";

export default class {
    FEEDBACK_YES_INTENT = "yes";
    FEEDBACK_NO_INTENT = "no";
    positiveFeedback = ["yes","yeah","confirm","sure","yes sure","yeah sure","go ahead","yes please","satisfied","solved","yes solved","yeah solved","resolved","yes resolved","yeah resolved","positive"];
    negativeFeedback = ["no","not","nah","nope","not sure","not solved","not resolved","unsatisfied","not satisfied","negative"];
    
    private _http = new HttpService();

    callFeedbackLUIS(text: string, thresholdConfidence: number): Promise<any> {
        return this._http.pull(config.FeedbackLUISURL+text,{})
        .then(res => {
            const feedbackLUISScore = get(res.data,'topScoringIntent.score')
            if(feedbackLUISScore && feedbackLUISScore*100 > thresholdConfidence)
                return res.data.topScoringIntent.intent;
            return "None";
        });
    }
}