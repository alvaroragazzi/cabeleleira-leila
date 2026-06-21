import { Knex } from "knex";

import { Model } from "../Model";
import Relation from "./Relation";
import { ModelStatic } from "../ModelStatic";

export default class BelongsToRelation<T extends Model = Model> extends Relation<T> {
    constructor(
        parent: Model,
        related: ModelStatic<T>,
        private foreignKey: string,
        private ownerKey: string,
    ) {
        super(parent, related);
    }

    async getResults(): Promise<T | null> {
        const value = this.parent.getAttribute(this.foreignKey);
        if (value == null) return null;
        return this.related.query().where(this.ownerKey, value).first();
    }

    async eagerLoad(models: Model[], relationName: string, columns?: string[]): Promise<void> {
        const ids = [...new Set(models.map((m) => m.getAttribute(this.foreignKey)).filter((v) => v != null))];

        if (!ids.length) {
            for (const model of models) model.setRelation(relationName, null);
            return;
        }

        const query = this.related.query();

        if (columns?.length) {
            const selectColumns = Array.from(new Set([...columns, this.ownerKey]));
            query.select(...selectColumns);
        }

        const related = await query.whereIn(this.ownerKey, ids).get();
        const map = new Map<any, T>();

        for (const item of related) {
            map.set(item.getAttribute(this.ownerKey), item);
        }

        for (const model of models) {
            model.setRelation(relationName, map.get(model.getAttribute(this.foreignKey)) ?? null);
        }
    }

    applyJoin(
        qb: Knex.QueryBuilder,
        parentAliasOrTable: string,
        relatedAlias: string,
        joinType?: "inner" | "left"
    ): void {
        const relatedTable = this.related.getTable();
        const joinMethod = joinType === "left" ? "leftJoin" : "join";

        qb[joinMethod](
            `${relatedTable} as ${relatedAlias}`,
            `${relatedAlias}.${this.ownerKey}`,
            "=",
            `${parentAliasOrTable}.${this.foreignKey}`,
        );
    }
}