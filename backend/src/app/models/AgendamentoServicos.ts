import { Model } from "../../core/Eloquent/Model";

export default class AgendamentoServicos extends Model {
    static table = "agendamento_servicos";
    static primaryKey = "id";
    static timestamps = false;
}