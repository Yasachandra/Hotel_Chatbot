import { get } from "lodash";

import HttpService from "../../RequestHandler/request.handler";
import botConfig from '../bot.config';
import config from '../../config';
import IntentRes from './intent.response.triggers';
import greetingProfessionalChitchatOutput from "../../Greeting/greeting";
import FallbackHandler from '../Fallback/fallback.handler';

export default class {

    private _http = new HttpService();
    private _intent_res = new IntentRes();
    private _fallback_handler = new FallbackHandler();

    public async getReply(text: string): Promise<any> {
        const dispatcher_result = await this.callDispatcher(text);
        const dispatcher_score = get(dispatcher_result.data,'topScoringIntent.score');
        const dispatcher_intent = get(dispatcher_result.data,'topScoringIntent.intent');

        if(dispatcher_score && dispatcher_score*100 > botConfig.DispatcherConfidence) {
            let resp;
            switch(dispatcher_intent) {
                case this._intent_res.intent_map.DISPATCHER.CALL_HOTEL_BOOKING_LUIS:
                    resp = await this.callHotelBookingLUIS(dispatcher_result);
                    break;
                case this._intent_res.intent_map.DISPATCHER.CALL_CHITCHAT_QNA:
                    resp = await this.getChitChatResp(text,dispatcher_intent);
                    break;
                case 'None':
                    resp = await this._fallback_handler.getFallbackResp();
                    break;
                default:
                    resp = await this._fallback_handler.getFallbackResp();
            }
            return resp;
        } else {
            return await this._fallback_handler.getFallbackResp();
        }
    }

    private callDispatcher(text: string): Promise<any> {
        const url = botConfig.DispatcherURL + text;
        return this._http.pull(url, {})
        .then(resp => resp)
        .catch(err => {
            console.log("Error in calling dispacther\n",err);
            return { data: { topScoringIntent: { score: 100, intent: "None" }}};
        });
    }

    private async callHotelBookingLUIS(dispatcher_result: any): Promise<any> {
        const intent = get(dispatcher_result.data,'topScoringIntent.intent');
        const intent_score = get(dispatcher_result.data,'topScoringIntent.score');
        const connected_intent = get(dispatcher_result.data,'connectedServiceResult.topScoringIntent.intent');
        const connected_intent_score = get(dispatcher_result.data,'connectedServiceResult.topScoringIntent.score');
        const connected_entities = get(dispatcher_result.data,'connectedServiceResult.entities');
        if(connected_intent_score && connected_intent_score*100 > botConfig.HotelBotLUISConfidence)
            return {
                reply: '',
                intent,
                connected_intent,
                connected_entities
            }
        else if(intent_score && intent_score*100 > botConfig.DispatcherConfidence)
            return {
                reply: '',
                intent
            }
        const fallback_resp = await this._fallback_handler.getFallbackResp();
        return fallback_resp;
    }

    private async getChitChatResp(text: string, intent: string) {
        let chitchat_qna_resp = await this.callChitchatQnA(text);
        if(chitchat_qna_resp) {
            chitchat_qna_resp = this.updateChitChatResp(chitchat_qna_resp, intent);
            return {
                reply: chitchat_qna_resp.reply,
                intent: chitchat_qna_resp.intent
            };
        }
        const fallback_resp = await this._fallback_handler.getFallbackResp();
        return fallback_resp;
    }

    private updateChitChatResp(text: string, intent: string): any {
        if(greetingProfessionalChitchatOutput.includes(text))
            return {
                reply: this._intent_res.intent_msg.WELCOME_TEXT,
                intent: this._intent_res.intent_map.GREETING
            }
        return {
            reply: text,
            intent
        }
    }

    private callChitchatQnA(text: string): Promise<any> {
        const url = config.chitChatQnAURL;
        const headers = { Authorization: config.chitChatQnAAuthorization };
        const body = { question: text }
        return this._http.push(url, body, { headers })
        .then(res => {
            const chitchat_score = get(res.data,'answers[0].score');
            if(chitchat_score && chitchat_score > config.chitChatQnAConfidence)
                return res.data.answers[0].answer;
            return;
        })
        .catch(err => {
            console.log("Error in calling chitchat QnA",err);
            return;
        })
    }
}