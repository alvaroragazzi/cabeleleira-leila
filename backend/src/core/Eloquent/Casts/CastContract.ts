import { PlainObject } from "../PlainObject";
import { Model } from "../Model";

export default interface CastContract {
    get(model: Model, key: string, value: any, attributes: PlainObject): any;
    set?(model: Model, key: string, value: any, attributes: PlainObject): any;
}