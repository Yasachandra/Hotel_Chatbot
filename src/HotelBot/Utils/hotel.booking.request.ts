import { get } from "lodash";

import HttpService from "../../RequestHandler/request.handler";
import botConfig from "../bot.config";

export default class {
    private _http = new HttpService();

    /**
     * Calls the hotel booking LUIS and get the intent and entity for user input
     * @text: string : User input for calling hotel booking LUIS     
    */
    public callHotelBookingLUIS(text: string): any {
        const url = botConfig.HotelBotLUISURL+text;
        return this._http.pull(url, {})
        .then(res => {
            const score = get(res.data,'topScoringIntent.score');
            const intent = get(res.data,'topScoringIntent.intent');
            const entities = get(res.data, 'entities');
            if(score*100 > botConfig.HotelBotLUISConfidence) 
                return { intent, entities };
            else return;
        })
        .catch(err => {
            console.log("Error in calling  hotel booking LUIS\n",err);
            return;
        })
    }

}