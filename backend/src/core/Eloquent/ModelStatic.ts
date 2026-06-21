import { Knex } from "knex";

import { Model } from "./Model";
import { PlainObject } from "./PlainObject";
import { QueryBuilder } from "./QueryBuilder";

export interface ModelStatic<T extends Model = Model> {
    new (attributes?: PlainObject, exists?: boolean): T;

    connection: string;
    table: string;
    primaryKey: string;
    sequence?: string;
    incrementing: boolean;
    timestamps: boolean;
    CREATED_AT: string;
    UPDATED_AT: string;
    fillable: string[];
    appends: string[];
    casts: Record<string, any>;

    name: string;

    getConnection(trx?: Knex.Transaction): Knex;
    getTable(): string;
    getPrimaryKey(): string;

    query(trx?: Knex.Transaction): QueryBuilder<T>;
    where(column: string, operator: any, value?: any): QueryBuilder<T>;
    with(...relations: string[]): QueryBuilder<T>;
    all(): Promise<T[]>;
    find(id: any, trx?: Knex.Transaction): Promise<T | null>;
    findOrFail(id: any, trx?: Knex.Transaction): Promise<T>;
    create(attributes: PlainObject, trx?: Knex.Transaction): Promise<T>;
    firstOrCreate(where: PlainObject, values?: PlainObject): Promise<T>;
    hydrate(attributes: PlainObject): T;
    prepareAttributesForDatabase(attributes: PlainObject): PlainObject;

    bootIfNotBooted(): void;
    on(hook: any, handler: any): void;
    runHook(hook: any, model: T): Promise<void>;
    eagerLoadRelations(models: T[], relations: string[]): Promise<void>;
}