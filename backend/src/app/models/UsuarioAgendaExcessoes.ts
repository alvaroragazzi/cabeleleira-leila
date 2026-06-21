import { Model } from "../../core/Eloquent/Model";

export default class UsuarioAgendaExcessoes extends Model {
    static table = "usuario_agenda_excessoes";
    static primaryKey = "id";
    static timestamps = false;
}