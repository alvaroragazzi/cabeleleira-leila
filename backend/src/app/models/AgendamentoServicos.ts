import { Model } from "../../core/Eloquent/Model";

import Servicos from "./Servicos";

export default class AgendamentoServicos extends Model {
    static table = "agendamento_servicos";
    static primaryKey = "id";
    static timestamps = false;

    servico() {
        return this.hasOne(Servicos, "id", "id_servico");
    }
}