import { Knex, knex } from "knex";

export default class DB {
    private static connections = new Map<string, Knex>();
    private static defaultConnection = "default";

    static addConnection(name: string, config: Knex.Config) {
        this.connections.set(name, knex(config));
    }

    static setDefaultConnection(name: string) {
        this.defaultConnection = name;
    }

    static connection(name?: string): Knex {
        const connName = name ?? this.defaultConnection;
        const connection = this.connections.get(connName);

        if (!connection) {
            throw new Error(`Conexão [${connName}] não registrada.`);
        }

        return connection;
    }

    static async destroyAll() {
        for (const connection of this.connections.values()) {
            await connection.destroy();
        }

        this.connections.clear();
    }
}