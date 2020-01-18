import axios from 'axios';

export default class {
    pull(url:string, options:object):Promise<any> {
        return axios.get(url, options);
    }

    push(url:string, data:any, options:object):Promise<any> {
        return axios.post(url, data, options );
    }
}