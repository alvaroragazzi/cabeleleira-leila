import CastContract from "./CastContract";
import { Model } from "../Model";

export default class FileCast implements CastContract {
    get(_: Model, key: string, value: any): any {
        if (value == null) return null;

        return {
            field: key,
            content: value,
            base64: Buffer.isBuffer(value) ? value.toString('base64') : Buffer.from(String(value)).toString("base64"),
        };
    }
}