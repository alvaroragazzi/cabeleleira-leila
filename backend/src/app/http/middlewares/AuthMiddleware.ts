import BaseMiddleware from "../../../core/request/BaseMiddleware";

export default class AuthMiddleware extends BaseMiddleware {
    public async handle() : Promise<any> {
        const user = await this.req.auth.user();

        if (!user) {
            return this.res.sendStatus(401);
        }

        return this.next();
    }
}