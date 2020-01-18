// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, BotState, StatePropertyAccessor } from 'botbuilder';
import { Dialog, DialogState } from 'botbuilder-dialogs';

import { BotDialog } from "./HotelBot/hotel.booking.bot";

export class MyBot extends ActivityHandler {
    conversationState: BotState;
    dialog: Dialog;
    dialogState: StatePropertyAccessor<DialogState>;

    constructor(conversationState, dialog) {
        super();

        // Creates a new user property accessor.
        // this.askFeedbackProperty = userState.createProperty(ASK_FEEDBACK);
        this.conversationState = conversationState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty<DialogState>('DialogState');

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context: any, next: any) => {

            // Call the bot and handle the user input
            await (this.dialog as BotDialog).handleInput(context, this.dialogState);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // For things such as saving state that you want to do at the end of a turn, there is a special handler called onDialog. The onDialog handler runs at the end, after the rest of the handlers have run, and is not tied to a certain activity type. The onDialog method gets called last after other defined handlers are run, such as onMessage. In this way, we are saving state after the message handler completes but before the turn itself completes.
        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await next();
        });
    }
}
