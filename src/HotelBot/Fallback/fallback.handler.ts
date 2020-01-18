import IntentRes from '../Utils/intent.response.triggers';

export default class {
    private _intent_res = new IntentRes();

    public async getFallbackResp(): Promise<any> {
        return {
            reply: this._intent_res.intent_msg.CANNED_RESPONSE,
            intent: 'fallback'
        };
    }
}