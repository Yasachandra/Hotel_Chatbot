import {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext
} from "botbuilder-dialogs";

import HotelBookingLUIS from '../Utils/hotel.booking.request';
import IntentMap from '../Utils/intent.response.triggers';
import DataStorageHandler from '../DataStorage/data.storage';
import FallbackHandler from '../Fallback/fallback.handler';
import BotDetails from '../Utils/bot.data';

const USER_INPUT_PROMPT = 'USER_INPUT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export default class extends ComponentDialog {
    bot_details: BotDetails;

    private _hotel_booking_handler = new HotelBookingLUIS();
    private _fallback_handler = new FallbackHandler();
    private _intent_map = new IntentMap();
    private _data_storage_handler = new DataStorageHandler();

    constructor(id: string) {
        super(id || 'HOTEL_BOOKING_DIALOG')

        this.addDialog(new TextPrompt(USER_INPUT_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.checkHotelBotLUISStep.bind(this),
            this.checkLocationStep.bind(this),
            this.triggerRespStep.bind(this),
            this.validateLocationStep.bind(this),
            this.checkDateStep.bind(this),
            this.triggerRespStep.bind(this),
            this.getDateStep.bind(this),
            this.checkNumOfPeopleStep.bind(this),
            this.triggerRespStep.bind(this),
            this.validateNumOfPeopleStep.bind(this),
            this.confirmBookingStep.bind(this),
            this.triggerRespStep.bind(this),
            this.getConfirmationForBookingStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    private async triggerRespStep(step: WaterfallStepContext): Promise<any> {
        const text = step.result;
        this.bot_details.user_input = text;
        if(this._intent_map.greeting_triggers.includes(text)) {
            const reply = this._intent_map.intent_msg.WELCOME_TEXT;
            const intent = this._intent_map.intent_map.GREETING;
            await this._data_storage_handler.addToDB(reply, intent, step.context.activity);
            this.bot_details.clearBotData();
            await step.context.sendActivity(reply)
            return await step.endDialog();
        } else
            return await step.next();
    }

    private async checkHotelBotLUISStep(step: WaterfallStepContext): Promise<any> {
        this.bot_details = step.options as BotDetails;
        if(this.bot_details.connected_intent) {
            if(this.bot_details.connected_intent === this._intent_map.intent_map.HOTELBOOKINGLUIS.INTENTS.BOOK_HOTEL)
                return await step.next();
            else {
                const reply = `I am not trained to handle intent ${this.bot_details.connected_intent}`;
                await this._data_storage_handler.addToDB(reply,`hotel_${this.bot_details.connected_intent}`,step.context.activity)
                await step.context.sendActivity(reply);
                return await step.endDialog();
            }
        } else {
            const hotel_booking_luis_resp = await this._hotel_booking_handler.callHotelBookingLUIS(this.bot_details.user_input);
            // If the LUIS confidence is above threshold for calling hotel booking LUIS
            if(hotel_booking_luis_resp) {
                const intent = hotel_booking_luis_resp.intent;
                const entities = hotel_booking_luis_resp.entities;
                if(intent === this._intent_map.intent_map.HOTELBOOKINGLUIS.INTENTS.BOOK_HOTEL) {
                    this.bot_details.connected_intent = intent;
                    this.bot_details.entities = entities;
                    return await step.next();
                } else {
                    const reply = `I am not trained to handle intent ${intent}`;
                    await this._data_storage_handler.addToDB(reply,`hotel_${intent}`,step.context.activity)
                    await step.context.sendActivity(reply);
                    return await step.endDialog();
                }
            } else {
                // If the LUIS confidence is below threshold, get fallback response
                return await this.callFallbackMechanism(step);
            }
        }
    }

    private async checkLocationStep(step: WaterfallStepContext): Promise<any> {
        const hotel_location = this.bot_details.entities.length > 0 ? this.bot_details.entities.find(cur => cur["type"] === this._intent_map.entity_map.HOTELBOOKINGLUIS.ENTITIES.LOCATION): null;
        if(hotel_location) {
            this.bot_details.location = hotel_location["resolution"]["values"][0].toLowerCase();
            return await step.next();
        }
        const valid_locations = this._intent_map.locations.reduce((str,cur)=>str+"\n<br/>"+cur,"");
        const reply = `Please enter one of the locations listed below where you want to book the hotel:${valid_locations}`;
        await this._data_storage_handler.addToDB(reply,`${this.bot_details.connected_intent}_ask_location`,step.context.activity);
        return await step.prompt(USER_INPUT_PROMPT, reply);
    }

    private async validateLocationStep(step: WaterfallStepContext): Promise<any> {
        if(this.bot_details.location) return await step.next();
        const text = this.bot_details.user_input.toLowerCase();
        if(this._intent_map.locations.includes(text)) {
            this.bot_details.location = text;
            return await step.next();
        }
        const reply = `Sorry, we don't have a hotel in location '${text}'`;
        await step.context.sendActivity(reply);
        await this._data_storage_handler.addToDB(reply,`${this.bot_details.connected_intent}_location_not_found`,step.context.activity)
        return await step.endDialog(); 
    }

    private async checkDateStep(step: WaterfallStepContext): Promise<any> {
        const date = this.bot_details.entities.length > 0 ? this.bot_details.entities.find(cur => cur["type"] === this._intent_map.entity_map.HOTELBOOKINGLUIS.ENTITIES.DATE): null;
        if(date) {
            this.bot_details.date = date["resolution"]["values"][0]["value"].toLowerCase();
            return await step.next();
        }
        const reply = `Please enter the date when you want to book the hotel`;
        await this._data_storage_handler.addToDB(reply,`${this.bot_details.connected_intent}_ask_date`,step.context.activity);
        return await step.prompt(USER_INPUT_PROMPT, reply);
    }

    private async getDateStep(step: WaterfallStepContext): Promise<any> {
        if(this.bot_details.date) return await step.next();
        this.bot_details.date = this.bot_details.user_input.toLowerCase();
        return await step.next();
    }

    private async checkNumOfPeopleStep(step: WaterfallStepContext): Promise<any> {
        const num_of_people = this.bot_details.entities.length > 0 ? this.bot_details.entities.find(cur => cur["type"] === this._intent_map.entity_map.HOTELBOOKINGLUIS.ENTITIES.NUM_OF_PEOPLE): null;
        if(num_of_people && this._intent_map.num_of_people.includes(num_of_people["resolution"]["value"].toLowerCase())) {
            this.bot_details.num_of_people = num_of_people["resolution"]["value"].toLowerCase();
            return await step.next();
        }
        const valid_num_of_people = this._intent_map.num_of_people.reduce((str,cur)=>str+"\n<br/>"+cur,"");
        const reply = `Please enter the number of people:${valid_num_of_people}`;
        await this._data_storage_handler.addToDB(reply,`${this.bot_details.connected_intent}_ask_num_of_people`,step.context.activity);
        return await step.prompt(USER_INPUT_PROMPT, reply);
    }

    private async validateNumOfPeopleStep(step: WaterfallStepContext): Promise<any> {
        if(this.bot_details.num_of_people) return await step.next();
        const text = this.bot_details.user_input.toLowerCase();
        if(this._intent_map.num_of_people.includes(text)) {
            this.bot_details.num_of_people = text;
            return await step.next();
        }
        const reply = `Sorry, we don't have the facility to accomodate '${text}' guests.`;
        await step.context.sendActivity(reply);
        await this._data_storage_handler.addToDB(reply,`${this.bot_details.connected_intent}_num_of_people_not_found`,step.context.activity)
        return await step.endDialog(); 
    }

    private async confirmBookingStep(step: WaterfallStepContext): Promise<any> {
        const reply = `The details you have entered to book the hotel are:\nLocation: ${this.bot_details.location}\nDate: ${this.bot_details.date}\nNumber of guests: ${this.bot_details.num_of_people}\nShall I go ahead and confirm your booking? (Yes/No)`;
        await this._data_storage_handler.addToDB(reply,`${this.bot_details.connected_intent}_ask_confirm_booking`,step.context.activity);
        return await step.prompt(USER_INPUT_PROMPT, reply);
    }
    
    private async getConfirmationForBookingStep(step: WaterfallStepContext): Promise<any> {
        const text = this.bot_details.user_input;
        const confirm_booking = this.confirmBooking(text);
        let reply = "Sorry, I didn't understand you. Please book again."
        if(confirm_booking === "yes") reply = "Your booking has been confirmed."
        else if(confirm_booking === "no") reply = "Your booking has been cancelled."
        this.bot_details.intent = `confirm_booking_${confirm_booking}`;
        await this._data_storage_handler.addToDB(reply, this.bot_details.intent, step.context.activity);
        this.bot_details.clearBotData();
        await step.context.sendActivity(reply)
        return await step.endDialog();
    }

    private async callFallbackMechanism(step): Promise<any> {
        const bot_logic_resp = await this._fallback_handler.getFallbackResp();
        const reply = bot_logic_resp['reply'];
        const intent = bot_logic_resp['intent'];
        this.bot_details.intent = intent;
        await this._data_storage_handler.addToDB(reply, intent, step.context.activity);
        await step.context.sendActivity(reply);
        return await step.endDialog();
    }

    private confirmBooking(text: string): string {
        if(["yes","yeah","confirm","accept","proceed"].includes(text)) return "yes";
        else if(["no","nope","don't confirm","cancel","reject"].includes(text)) return "no";
        else return "not sure"
    }
}