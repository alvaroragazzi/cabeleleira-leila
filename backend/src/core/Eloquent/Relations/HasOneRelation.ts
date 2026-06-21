import { Knex } from "knex";

import { Model } from "../Model";
import { ModelStatic } from "../ModelStatic";
import Relation from "./Relation";

export default class HasOneRelation<T extends Model = Model> extends Relation<T> {
    constructor(
        parent: Model,
        related: ModelStatic<T>,
        private foreignKey: string,
        private localKey: string,
    ) {
        super(parent, related);
    }

    async getResults(): Promise<T | null> {
        const value = this.parent.getAttribute(this.localKey);
        if (value == null) return null;
        return this.related.query().where(this.foreignKey, value).first();
    }

    async eagerLoad(
        models: Model[],
        relationName: string,
        columns?: string[]
    ): Promise<void> {
        const ids = [...new Set(models.map((m) => m.getAttribute(this.localKey)).filter((v) => v != null))];

        if (!ids.length) {
            for (const model of models) model.setRelation(relationName, null);
            return;
        }

        const query = this.related.query();

        if (columns?.length) {
            const selectColumns = Array.from(new Set([...columns, this.foreignKey]));
            query.select(...selectColumns);
        }

        const related = await query.whereIn(this.foreignKey, ids).get();
        const map = new Map<any, T>();

        for (const item of related) {
            map.set(item.getAttribute(this.foreignKey), item);
        }

        for (const model of models) {
            model.setRelation(relationName, map.get(model.getAttribute(this.localKey)) ?? null);
        }
    }

    applyJoin(
        qb: Knex.QueryBuilder,
        parentAliasOrTable: string,
        relatedAlias: string,
        joinType?: "inner" | "left"
    ): void {
        const type = joinType ?? "left";
        const relatedTable = this.related.getTable();
        const joinMethod = type === "left" ? "leftJoin" : "join";

        qb[joinMethod](
            `${relatedTable} as ${relatedAlias}`,
            `${relatedAlias}.${this.foreignKey}`,
            "=",
            `${parentAliasOrTable}.${this.localKey}`,
        );
    }
}