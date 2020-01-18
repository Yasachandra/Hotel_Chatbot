export default class {
    public intent: string;
    public connected_intent: string;
    public entities: Array<object>;
    public location: string;
    public date: string;
    public num_of_people: string;
    public user_input: string;

    public clearBotData(): void {
        this.intent = undefined;
        this.connected_intent = undefined;
        this.entities = undefined;
        this.location = undefined;
        this.date = undefined;
        this.num_of_people = undefined;
        this.user_input = undefined;
    }
}
