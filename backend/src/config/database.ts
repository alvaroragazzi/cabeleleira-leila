import { types } from "pg";

types.setTypeParser(types.builtins.INT8, (value: string) => {
    return parseInt(value, 10);
});

types.setTypeParser(types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});

export default {
    default: {
        client: "pg",
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT ?? 5432),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        pool: {
            min: 0,
            max: 10,
            afterCreate(conn: any, done: (err: Error | null, conn: any) => void) {
                conn.query("SET TIME ZONE 'UTC';", (err: Error | null) => {
                    done(err, conn);
                });
            }
        },
    },
};
