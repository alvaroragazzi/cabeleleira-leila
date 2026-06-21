import { Model } from "../../core/Eloquent/Model";

export default class Agendamentos extends Model {
    static table = "agendamentos";
    static primaryKey = "id";
    static timestamps = false;
}