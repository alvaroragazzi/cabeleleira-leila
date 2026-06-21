import { Knex } from "knex";

import { Model } from "../Model";
import Relation from "./Relation";
import { ModelStatic } from "../ModelStatic";

export default class HasManyRelation<T extends Model = Model> extends Relation<T> {
    constructor(
        parent: Model,
        related: ModelStatic<T>,
        private foreignKey: string,
        private localKey: string,
    ) {
        super(parent, related);
    }

    async getResults(): Promise<T[]> {
        const value = this.parent.getAttribute(this.localKey);
        if (value == null) return [];
        return this.related.query().where(this.foreignKey, value).get();
    }

    async eagerLoad(models: Model[], relationName: string, columns?: string[]): Promise<void> {
        const ids = [...new Set(models.map((m) => m.getAttribute(this.localKey)).filter((v) => v != null))];

        if (!ids.length) {
            for (const model of models) model.setRelation(relationName, []);
            return;
        }

        const query = this.related.query();

        if (columns?.length) {
            const selectColumns = Array.from(new Set([...columns, this.foreignKey]));
            query.select(...selectColumns);
        }

        const related = await query.whereIn(this.foreignKey, ids).get();
        const groups = new Map<any, T[]>();

        for (const item of related) {
            const key = item.getAttribute(this.foreignKey);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        }

        for (const model of models) {
            model.setRelation(relationName, groups.get(model.getAttribute(this.localKey)) ?? []);
        }
    }

    applyJoin(qb: Knex.QueryBuilder, parentAliasOrTable: string, relatedAlias: string, joinType?: "inner" | "left"): void {
        const relatedTable = this.related.getTable();
        const joinMethod = joinType === "left" ? "leftJoin" : "join";

        qb[joinMethod](
            `${relatedTable} as ${relatedAlias}`,
            `${relatedAlias}.${this.foreignKey}`,
            "=",
            `${parentAliasOrTable}.${this.localKey}`,
        );
    }
}