import { Knex } from "knex";

import { ModelStatic } from "./ModelStatic";
import { Model } from "./Model";
import { PlainObject } from "./PlainObject";

import Relation from "./Relations/Relation";

export class QueryBuilder<T extends Model> {
    private qb: Knex.QueryBuilder;
    private eagerLoads: string[] = [];
    private joinedRelations = new Map<string, string>();

    constructor(private modelClass: ModelStatic<T>, protected trx?: Knex.Transaction) {
        this.qb = this.modelClass.getConnection(trx).from(this.modelClass.getTable());
    }

    private makeNestedBuilder(qb: Knex.QueryBuilder): QueryBuilder<T> {
        const nested = Object.create(QueryBuilder.prototype) as QueryBuilder<T>;

        nested.qb = qb;
        nested.eagerLoads = this.eagerLoads;
        nested.joinedRelations = this.joinedRelations;
        nested.modelClass = this.modelClass;
        nested.trx = this.trx;

        return nested;
    }

    private makeRelation<M extends Model>(
        modelClass: ModelStatic<M>,
        relationName: string
    ): Relation {
        const instance = new modelClass({}, true);
        const relationFactory = (instance as any)[relationName];

        if (typeof relationFactory !== "function") {
            throw new Error(`Relação [${relationName}] não existe em [${modelClass.name}]`);
        }

        const relation = relationFactory.call(instance);

        if (!(relation instanceof Relation)) {
            throw new Error(`Relação [${relationName}] em [${modelClass.name}] é inválida`);
        }

        return relation;
    }

    private qualifyColumn(column: string): string {
        if (
            column.includes(".") ||
            column.includes("(") ||
            column.includes(")") ||
            column.toUpperCase().includes(" AS ") ||
            column.includes("->")
        ) {
            return column;
        }

        return `${this.modelClass.getTable()}.${column}`;
    }

    private joinRelationHandler(path: string, alias: string, joinType: "left" | "inner"): this {
        const parts = path
            .split(".")
            .map((part) => part.trim())
            .filter(Boolean);

        if (!parts.length) {
            throw new Error("O caminho da relação está vazio.");
        }

        let currentModel: ModelStatic<any> = this.modelClass;
        let parentAliasOrTable = this.modelClass.getTable();
        let currentPath = "";

        for (let i = 0; i < parts.length; i++) {
            const relationName = parts[i];
            const isLast = i === parts.length - 1;

            currentPath = currentPath ? `${currentPath}.${relationName}` : relationName;

            const relation = this.makeRelation(currentModel, relationName);

            const relationAlias = this.joinedRelations.get(currentPath) ?? (isLast ? (alias ?? relationName) : currentPath.replace(/\./g, "__"));

            if (!this.joinedRelations.has(currentPath)) {
                relation.applyJoin(this.qb, parentAliasOrTable, relationAlias, joinType);
                this.joinedRelations.set(currentPath, relationAlias);
            }

            parentAliasOrTable = relationAlias;
            currentModel = relation.getRelatedModel();
        }

        return this;
    }

    leftJoinRelation(path: string, alias: string): this {
        return this.joinRelationHandler(path, alias, "left");
    }

    joinRelation(path: string, alias: string): this {
        return this.joinRelationHandler(path, alias, "inner");
    }

    where(column: string | ((query: QueryBuilder<T>) => void), operator?: any, value?: any): this {
        if (typeof column === "function") {
            this.qb.where((qb) => {
                const nested = this.makeNestedBuilder(qb as Knex.QueryBuilder);
                column(nested);
            });

            return this;
        }

        const qualifiedColumn = this.qualifyColumn(column);

        if (arguments.length === 2) {
            this.qb.where(qualifiedColumn, operator);
        } else {
            this.qb.where(qualifiedColumn, operator, value);
        }

        return this;
    }

    orWhere(column: string | ((query: QueryBuilder<T>) => void), operator?: any, value?: any): this {
        if (typeof column === "function") {
            this.qb.orWhere((qb) => {
                const nested = this.makeNestedBuilder(qb as Knex.QueryBuilder);
                column(nested);
            });

            return this;
        }

        const qualifiedColumn = this.qualifyColumn(column);

        if (arguments.length === 2) {
            this.qb.orWhere(qualifiedColumn, operator);
        } else {
            this.qb.orWhere(qualifiedColumn, operator, value);
        }

        return this;
    }

    whereIn(column: string, values: any[]): this {
        const qualifiedColumn = this.qualifyColumn(column);

        this.qb.whereIn(qualifiedColumn, values);

        return this;
    }

    whereNotIn(column: string, values: any[]): this {
        const qualifiedColumn = this.qualifyColumn(column);

        this.qb.whereNotIn(qualifiedColumn, values);

        return this;
    }

    whereNull(column: string): this {
        const qualifiedColumn = this.qualifyColumn(column);

        this.qb.whereNull(qualifiedColumn);

        return this;
    }

    whereNotNull(column: string): this {
        const qualifiedColumn = this.qualifyColumn(column);

        this.qb.whereNotNull(qualifiedColumn);

        return this;
    }

    whereBetween(column: string, values: [string | number, string | number]) {
        const qualifiedColumn = this.qualifyColumn(column);

        this.qb.whereBetween(qualifiedColumn, values);

        return this;
    }

    orWhereBetween(column: string, values: [string | number, string | number]) {
        const qualifiedColumn = this.qualifyColumn(column);

        this.qb.orWhereBetween(qualifiedColumn, values);

        return this;
    }

    orderBy(column: string, direction: "asc" | "desc" = "asc"): this {
        const qualifiedColumn = this.qualifyColumn(column);

        this.qb.orderBy(qualifiedColumn, direction);

        return this;
    }

    limit(limit: number): this {
        this.qb.limit(limit);

        return this;
    }

    offset(offset: number): this {
        this.qb.offset(offset);

        return this;
    }

    select(...columns: string[]): this {
        this.qb.select(columns.length ? columns : "*");

        return this;
    }

    with(...relations: string[]): this {
        this.eagerLoads.push(
            ...relations
                .map((r) => r.trim())
                .filter(Boolean)
        );

        return this;
    }

    async count(column = "*"): Promise<number> {
        const result = await this.qb.clone().count<{ total: string | number }[]>({ total: column });

        return Number(result[0]?.total ?? 0);
    }

    async exists(): Promise<boolean> {
        const total = await this.count();

        return total > 0;
    }

    async first(): Promise<T | null> {
        const row = await this.qb.clone().first();

        if (!row) return null;

        const model = this.modelClass.hydrate(row);
        model.useTransaction(this.trx);

        await this.modelClass.runHook("retrieved", model);

        if (this.eagerLoads.length) {
            await this.modelClass.eagerLoadRelations([model], this.eagerLoads);
        }

        return model;
    }

    async get(): Promise<T[]> {
        const rows = await this.qb.clone();

        const models = rows.map((row: PlainObject) => {
            const model = this.modelClass.hydrate(row);
            model.useTransaction(this.trx);
            return model;
        });

        for (const model of models) {
            await this.modelClass.runHook("retrieved", model);
        }

        if (models.length && this.eagerLoads.length) {
            await this.modelClass.eagerLoadRelations(models, this.eagerLoads);
        }

        return models;
    }

    async update(values: PlainObject): Promise<number> {
        const payload = this.modelClass.prepareAttributesForDatabase(values);
        return this.qb.clone().update(payload);
    }

    async delete(): Promise<number> {
        return this.qb.clone().delete();
    }

    toSQL() {
        return this.qb.toSQL();
    }
}