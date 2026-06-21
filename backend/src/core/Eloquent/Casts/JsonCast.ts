import CastContract from "./CastContract";
import { Model } from "../Model";

export default class JsonCast implements CastContract {
    get(_: Model, __: string, value: any): any {
        if (value == null) return value;
        if (typeof value === 'object') return value;
        
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    set(_: Model, __: string, value: any): any {
        return value == null ? value : JSON.stringify(value);
    }
}