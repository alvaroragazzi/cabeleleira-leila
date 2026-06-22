import BaseMiddleware from "../../../core/request/BaseMiddleware";

import Agendamentos from "../../models/Agendamentos";

export default class ClienteAuthMiddleware extends BaseMiddleware {
    public async handle() : Promise<any> {
        const agendamento = await Agendamentos.findOrFail(this.req.params.id);
        const id_cliente = this.req.session.id_cliente;
        const usuarioLogado = this.req.auth.user();

        // só permite excluir se for usuário do sistema ou cliente que está tentando deletar seu próprio agendamento
        if (!usuarioLogado && agendamento.getAttribute("id_cliente") !== id_cliente) {
            return this.res.status(403).send({ message: "Você não tem permissão para realizar esta ação" });
        }

        return this.next();
    }
}