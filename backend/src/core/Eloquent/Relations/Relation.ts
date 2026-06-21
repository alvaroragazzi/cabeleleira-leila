import { Knex } from "knex";

import { Model } from "../Model";
import { ModelStatic } from "../ModelStatic";

export default abstract class Relation<T extends Model = Model> {
    constructor(
        protected parent: Model,
        protected related: ModelStatic<T>,
    ) {}

    getRelatedModel(): ModelStatic<T> {
        return this.related;
    }

    getRelatedTable(): string {
        return this.related.getTable();
    }

    abstract getResults(): Promise<any>;

    abstract eagerLoad(
        models: Model[],
        relationName: string,
        columns?: string[]
    ): Promise<void>;

    abstract applyJoin(
        qb: Knex.QueryBuilder,
        parentAliasOrTable: string,
        relatedAlias: string,
        joinType?: "inner" | "left"
    ): void;
}