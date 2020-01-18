import {
    ComponentDialog,
    DialogSet,
    DialogState,
    DialogTurnStatus,
    WaterfallDialog,
    WaterfallStepContext
} from "botbuilder-dialogs";
// import { StatePropertyAccessor, TurnContext } from 'botbuilder';

import BotLogic from "./Utils/bot.logic";
import IntentResTrig from './Utils/intent.response.triggers';
import DataStorageHandler from './DataStorage/data.storage';
import BotDetails from "./Utils/bot.data";
import HotelBookingDialog from './Dialogs/hotel.booking.dialog';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const HOTEL_BOOKING_DIALOG = 'HOTEL_BOOKING_DIALOG';

export class BotDialog extends ComponentDialog {

    private _bot_logic = new BotLogic();
    private _intent_res_trig = new IntentResTrig();
    private _bot_details = new BotDetails();
    private _data_storage_handler = new DataStorageHandler();

    constructor() {
        super('mainDialog')

        // Initialize the bot main dialog
        const hotel_booking_dialog = new HotelBookingDialog(HOTEL_BOOKING_DIALOG);

        this.addDialog(hotel_booking_dialog);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.triggerRespStep.bind(this),
            this.dispatcherStep.bind(this),
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    public async handleInput(turnContext: any, accessor: any): Promise<any> {

        // Waterfall dialog 
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }

    }

    private async triggerRespStep(step: WaterfallStepContext): Promise<any> {
        const text = step.context.activity.text;
        this._bot_details.user_input = text;
        if(this._intent_res_trig.greeting_triggers.includes(text)) {
            const reply = this._intent_res_trig.intent_msg.WELCOME_TEXT;
            const intent = this._intent_res_trig.intent_map.GREETING;
            await this._data_storage_handler.addToDB(reply, intent, step.context.activity);
            this._bot_details.clearBotData();
            await step.context.sendActivity(reply)
            return await step.endDialog();
        } else
            return await step.next();
    }

    private async dispatcherStep(step: WaterfallStepContext): Promise<any> {
        const text = step.context.activity.text;
        this._bot_details.user_input = text;
        const bot_logic_resp = await this._bot_logic.getReply(text);
        let reply = bot_logic_resp['reply'];
        const intent = bot_logic_resp['intent'];

        this._bot_details.intent = intent;

        if(intent === this._intent_res_trig.intent_map.DISPATCHER.CALL_HOTEL_BOOKING_LUIS) {
            return await this.switchToHotelBookingDialog(step, bot_logic_resp);
        }

        await this._data_storage_handler.addToDB(reply, intent, step.context.activity);
        await step.context.sendActivity(reply);
        return await step.endDialog();
    }

    private async switchToHotelBookingDialog(step, resp): Promise<any> {
        if(resp.connected_intent)
            this._bot_details.connected_intent = resp.connected_intent;
        if(resp.connected_entities)
            this._bot_details.entities = resp.connected_entities;
        return await step.replaceDialog(HOTEL_BOOKING_DIALOG, this._bot_details);
    }

}