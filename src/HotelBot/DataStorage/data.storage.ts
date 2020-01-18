import DataStorage from '../../DataStorage/dbOperations';

export default class {

    public async addToDB(text: string, intent: string, activity: any): Promise<any> {
        let msg_type = "analytics";
        return await DataStorage(intent, activity, text, "analytics");
    }

}