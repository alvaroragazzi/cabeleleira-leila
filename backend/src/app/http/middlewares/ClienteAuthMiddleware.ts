import BaseMiddleware from "../../../core/request/BaseMiddleware";

export default class ClienteAuthMiddleware extends BaseMiddleware {
    public async handle() : Promise<any> {
        const id_cliente = this.req.session.id_cliente;

        if (!id_cliente) {
            return this.res.sendStatus(401);
        }

        return this.next();
    }
}