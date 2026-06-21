import { Model } from "../../core/Eloquent/Model";

export default class Clientes extends Model {
    static table = "clientes";
    static primaryKey = "id";
    static timestamps = false;
}