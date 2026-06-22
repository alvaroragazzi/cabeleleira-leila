import { Model } from "../../core/Eloquent/Model";

import Usuarios from "./Usuarios";
import AgendamentoServicos from "./AgendamentoServicos";
import Clientes from "./Clientes";

export default class Agendamentos extends Model {
    static table = "agendamentos";
    static primaryKey = "id";
    static timestamps = false;

    usuario() {
        return this.hasOne(Usuarios, "id", "id_usuario");
    }

    agendamentoServicos() {
        return this.hasMany(AgendamentoServicos, "id_agendamento", "id");
    }

    cliente() {
        return this.hasOne(Clientes, "id", "id_cliente");
    }
}