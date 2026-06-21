import { PlainObject } from "./PlainObject";
import { ModelStatic } from "./ModelStatic";
import { QueryBuilder } from "./QueryBuilder";
import { HookHandler } from "./HookHandler";

import Relation from "./Relations/Relation";

import HasOneRelation from "./Relations/HasOneRelation";
import HasManyRelation from "./Relations/HasManyRelation";
import BelongsToRelation from "./Relations/BelongsToRelation";

import CastContract from "./Casts/CastContract";

import JsonCast from "./Casts/JsonCast";
import FileCast from "./Casts/FileCast";

import DB from "./DB";

import { Knex } from "knex";
import dayjs from "dayjs";

type ModelConnection = Knex | Knex.Transaction;
type CastMap = Record<string, string | CastContract>;
type HookName =
    | 'retrieved'
    | 'saving'
    | 'saved'
    | 'creating'
    | 'created'
    | 'updating'
    | 'updated'
    | 'deleting'
    | 'deleted';

const hooksStore = new WeakMap<Function, Record<HookName, HookHandler[]>>();
const bootedStore = new WeakMap<Function, boolean>();

function studly(value: string): string {
    return value
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
        .replace(/^(.)/, (m) => m.toUpperCase());
}

function cloneDeep<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

export class Model {
    static connection = "default";
    static table = "";
    static primaryKey = "id";
    static sequence?: string;
    static incrementing = true;
    static timestamps = true;
    static CREATED_AT = 'created_at';
    static UPDATED_AT = 'updated_at';
    static fillable: string[] = [];
    static appends: string[] = [];
    static casts: CastMap = {};

    protected $attributes: PlainObject = {};
    protected $original: PlainObject = {};
    protected $relations: PlainObject = {};
    protected $exists = false;
    protected $trx: Knex.Transaction | null = null;

    constructor(attributes: PlainObject = {}, exists = false) {
        this.constructorAsModel().bootIfNotBooted();
        this.$exists = exists;
        this.fill(attributes);
        this.syncOriginal();

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (typeof prop === 'symbol') {
                    return Reflect.get(target, prop, receiver);
                }

                if (typeof prop === 'string' && prop.startsWith('$')) {
                    return (target as any)[prop];
                }

                if (prop in target) {
                    return Reflect.get(target, prop, receiver);
                }

                return target.getAttribute(prop);
            },

            set: (target, prop, value, receiver) => {
                if (typeof prop === 'symbol') {
                    return Reflect.set(target, prop, value, receiver);
                }

                if (typeof prop === 'string' && prop.startsWith('$')) {
                    (target as any)[prop] = value;
                    return true;
                }

                if (prop in target) {
                    return Reflect.set(target, prop, value, receiver);
                }

                target.setAttribute(prop, value);
                return true;
            },

            has: (target, prop) => {
                if (typeof prop === 'symbol') {
                    return prop in target;
                }

                return prop in target || prop in target.$attributes || prop in target.$relations;
            },
        });
    }

    protected constructorAsModel<T extends Model>(): ModelStatic<T> {
        return this.constructor as ModelStatic<T>;
    }

    // -------------------------
    // Static API
    // -------------------------

    useTransaction(trx?: Knex.Transaction): this {
        this.$trx = trx ?? null;
        return this;
    }

    protected getQueryConnection(): ModelConnection {
        return this.$trx ?? this.constructorAsModel().getConnection();
    }

    static getConnection(trx?: Knex.Transaction): ModelConnection {
        this.bootIfNotBooted();
        return trx ?? DB.connection(this.connection);
    }

    static getTable(): string {
        if (!this.table) {
            throw new Error(`Model [${this.name}] precisa definir static table.`);
        }

        return this.table;
    }

    static getPrimaryKey(): string {
        return this.primaryKey;
    }

    static query<T extends Model>(
        this: ModelStatic<T>,
        trx?: Knex.Transaction
    ): QueryBuilder<T> {
        this.bootIfNotBooted();
        return new QueryBuilder<T>(this, trx);
    }

    static where<T extends Model>(this: ModelStatic<T>, column: string, operator: any, value?: any) {
        return this.query().where(column, operator as any, value);
    }

    static with<T extends Model>(this: ModelStatic<T>, ...relations: string[]) {
        return this.query().with(...relations);
    }

    static async all<T extends Model>(this: ModelStatic<T>): Promise<T[]> {
        return this.query().get();
    }

    static async find<T extends Model>(
        this: ModelStatic<T>,
        id: any,
        trx?: Knex.Transaction
    ): Promise<T | null> {
        return this.query(trx).where(this.getPrimaryKey(), id).first();
    }

    static async findOrFail<T extends Model>(
        this: ModelStatic<T>,
        id: any,
        trx?: Knex.Transaction
    ): Promise<T> {
        const model = await this.find(id, trx);

        if (!model) {
            throw new Error(`${this.name} não encontrado para ID [${id}]`);
        }

        return model;
    }

    static async create<T extends Model>(
        this: ModelStatic<T>,
        attributes: PlainObject,
        trx?: Knex.Transaction
    ): Promise<T> {
        const model = new this(attributes) as T;
        model.useTransaction(trx);

        await model.save();

        return model;
    }

    async update(attributes: PlainObject): Promise<this> {
        this.fill(attributes);
        await this.save();

        return this;
    }

    static async firstOrCreate<T extends Model>(this: ModelStatic<T>, where: PlainObject, values: PlainObject = {}): Promise<T> {
        let query = this.query();
        for (const [key, value] of Object.entries(where)) {
            query = query.where(key, value);
        }

        const existing = await query.first();
        if (existing) return existing;

        return this.create({ ...where, ...values });
    }

    static hydrate<T extends Model>(this: ModelStatic<T>, attributes: PlainObject): T {
        return new this(attributes, true) as T;
    }

    static prepareAttributesForDatabase(this: ModelStatic, attributes: PlainObject): PlainObject {
        const instance = new this({}, false);
        const payload: PlainObject = {};

        for (const [key, value] of Object.entries(attributes)) {
            payload[key] = instance.serializeAttribute(key, value);
        }

        return payload;
    }

    static bootIfNotBooted() {
        if (bootedStore.get(this)) return;

        hooksStore.set(this, {
            retrieved: [],
            saving: [],
            saved: [],
            creating: [],
            created: [],
            updating: [],
            updated: [],
            deleting: [],
            deleted: [],
        });

        if (typeof (this as any).boot === 'function') {
            (this as any).boot();
        }

        if (typeof (this as any).booted === 'function') {
            (this as any).booted();
        }

        bootedStore.set(this, true);
    }

    static on<T extends Model>(this: ModelStatic<T>, hook: HookName, handler: HookHandler<T>) {
        this.bootIfNotBooted();
        hooksStore.get(this)![hook].push(handler as HookHandler);
    }

    static retrieved<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('retrieved', handler); }
    static saving<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('saving', handler); }
    static saved<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('saved', handler); }
    static creating<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('creating', handler); }
    static created<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('created', handler); }
    static updating<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('updating', handler); }
    static updated<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('updated', handler); }
    static deleting<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('deleting', handler); }
    static deleted<T extends Model>(this: ModelStatic<T>, handler: HookHandler<T>) { this.on('deleted', handler); }

    static async runHook<T extends Model>(this: ModelStatic<T>, hook: HookName, model: T) {
        this.bootIfNotBooted();
        const handlers = hooksStore.get(this)?.[hook] ?? [];
        for (const handler of handlers) {
            await handler(model);
        }
    }

    static async eagerLoadRelations<T extends Model>(this: ModelStatic<T>, models: T[], relations: string[]) {
        for (const relationEntry of relations) {
            const [relationPath, columnsRaw] = relationEntry.split(":");

            const columns = columnsRaw
                ? columnsRaw.split(",").map((c) => c.trim()).filter(Boolean)
                : undefined;

            const pathParts = relationPath
                .split(".")
                .map((part) => part.trim())
                .filter(Boolean);

            if (!pathParts.length) {
                continue;
            }

            let currentModels: Model[] = models;
            let currentModelClass: ModelStatic<any> = this;

            for (let i = 0; i < pathParts.length; i++) {
                const relationName = pathParts[i];
                const isLast = i === pathParts.length - 1;
                const relation = (currentModels[0] as any)[relationName]?.();

                if (!(relation instanceof Relation)) {
                    throw new Error(`Relação [${relationName}] não existe em [${currentModelClass.name}]`);
                }

                await relation.eagerLoad(currentModels, relationName, isLast ? columns : undefined);

                currentModels = currentModels.flatMap((model) => {
                    const related = model.getAttribute(relationName);
                    if (related == null) return [];
                    return Array.isArray(related) ? related : [related];
                });

                if (!currentModels.length) {
                    break;
                }

                currentModelClass = relation.getRelatedModel();
            }
        }
    }

    // -------------------------
    // Instance API
    // -------------------------

    get exists(): boolean {
        return this.$exists;
    }

    getKeyName(): string {
        return this.constructorAsModel().getPrimaryKey();
    }

    getKey(): any {
        return this.getAttribute(this.getKeyName());
    }

    setKey(value: any) {
        this.setAttribute(this.getKeyName(), value);
    }

    fill(attributes: PlainObject): this {
        const modelClass = this.constructorAsModel();
        const fillable = modelClass.fillable ?? [];
        const allowAll = fillable.length === 0;

        for (const [key, value] of Object.entries(attributes)) {
            if (allowAll || fillable.includes(key) || key === modelClass.getPrimaryKey()) {
                this.setAttribute(key, value);
            }
        }

        return this;
    }

    forceFill(attributes: PlainObject): this {
        for (const [key, value] of Object.entries(attributes)) {
            this.setAttribute(key, value);
        }

        return this;
    }

    getAttribute(key: string): any {
        if (key in this.$relations) {
            return this.$relations[key];
        }

        const accessor = this.resolveAccessor(key);
        if (accessor) {
            return accessor.call(this);
        }

        const raw = this.$attributes[key];
        return this.castAttribute(key, raw);
    }

    getRawAttribute(key: string): any {
        return this.$attributes[key];
    }

    setAttribute(key: string, value: any): this {
        const mutator = this.resolveMutator(key);

        if (mutator) {
            mutator.call(this, value);
            return this;
        }

        this.$attributes[key] = this.serializeAttribute(key, value);
        return this;
    }

    protected castAttribute(key: string, value: any): any {
        const casts = this.constructorAsModel().casts ?? {};
        const cast = casts[key];

        if (!cast || value == null) return value;

        if (typeof cast !== 'string') {
            return cast.get(this, key, value, this.$attributes);
        }

        if (cast === 'integer') return Number.parseInt(value, 10);
        if (cast === 'float') return Number.parseFloat(value);
        if (cast === 'boolean') return Boolean(value);
        if (cast === 'string') return String(value);
        if (cast === 'json') return new JsonCast().get(this, key, value);

        if (cast.startsWith("date")) {
            const format = cast.slice(5, cast.length);
            
            if (!format) return dayjs(value).toDate();

            return dayjs(value).format(format);
        }

        if (cast.startsWith("timestamp")) {
            const format = cast.slice(10, cast.length);

            if (!format) return dayjs(value).toDate();

            return dayjs(value).format(format);
        }

        return value;
    }

    protected serializeAttribute(key: string, value: any): any {
        const casts = this.constructorAsModel().casts ?? {};
        const cast = casts[key];

        if (!cast || value == null) return value;

        if (typeof cast !== 'string') {
            if (typeof cast.set === 'function') {
                return cast.set(this, key, value, this.$attributes);
            }
            return value;
        }

        if (cast === 'integer') return Number.parseInt(value, 10);
        if (cast === 'float') return Number.parseFloat(value);
        if (cast === 'boolean') return value ? 1 : 0;
        if (cast === 'json') return new JsonCast().set!(this, key, value);

        if (cast.startsWith('date')) {
            const d = dayjs(value);
            return d.isValid() ? d.toDate() : value;
        }

        return value;
    }

    protected resolveAccessor(key: string): Function | null {
        const method = `get${studly(key)}Attribute`;
        return typeof (this as any)[method] === 'function' ? (this as any)[method] : null;
    }

    protected resolveMutator(key: string): Function | null {
        const method = `set${studly(key)}Attribute`;
        return typeof (this as any)[method] === 'function' ? (this as any)[method] : null;
    }

    isDirty(key?: string): boolean {
        if (key) {
            return JSON.stringify(this.$attributes[key]) !== JSON.stringify(this.$original[key]);
        }

        return Object.keys(this.$attributes).some((attr) => this.isDirty(attr));
    }

    getDirty(): PlainObject {
        const dirty: PlainObject = {};

        for (const [key, value] of Object.entries(this.$attributes)) {
            if (JSON.stringify(value) !== JSON.stringify(this.$original[key])) {
                dirty[key] = value;
            }
        }

        return dirty;
    }

    syncOriginal(): this {
        this.$original = cloneDeep(this.$attributes);
        return this;
    }

    setRelation(name: string, value: any) {
        this.$relations[name] = value;
    }

    async load(...relations: string[]): Promise<this> {
        const modelClass = this.constructorAsModel();
        await modelClass.eagerLoadRelations([this], relations);
        return this;
    }

    async save(): Promise<this> {
        const modelClass = this.constructorAsModel();
        await modelClass.runHook('saving', this);

        if (modelClass.timestamps) {
            const now = new Date();

            if (!this.$exists) {
                this.setAttribute(modelClass.CREATED_AT, now);
            }

            this.setAttribute(modelClass.UPDATED_AT, now);
        }

        if (this.$exists) {
            await modelClass.runHook('updating', this);

            const dirty = this.getDirty();
            if (Object.keys(dirty).length) {
                await this
                    .getQueryConnection()
                    .from(modelClass.getTable())
                    .where(modelClass.getPrimaryKey(), this.getKey())
                    .update(dirty);
            }

            await modelClass.runHook('updated', this);
        } else {
            await modelClass.runHook('creating', this);

            if (modelClass.incrementing && modelClass.sequence && !this.getKey()) {
                const nextId = await this.nextSequenceValue(modelClass.sequence);
                this.setKey(nextId);
            }

            const connection = this.getQueryConnection();
            const client = String(connection.client.config.client ?? '').toLowerCase();
            const primaryKey = modelClass.getPrimaryKey();

            let insertedKey: any;

            if (client.includes('pg') || client.includes('postgres') || client.includes('mssql') || client.includes('oracle') || client.includes('oracledb')) {
                const inserted = await connection
                    .from(modelClass.getTable())
                    .insert(this.$attributes)
                    .returning(primaryKey);

                const first = Array.isArray(inserted) ? inserted[0] : inserted;
                insertedKey = first && typeof first === 'object'
                    ? (first as Record<string, any>)[primaryKey] ?? Object.values(first)[0]
                    : first;
            } else {
                const inserted = await connection
                    .from(modelClass.getTable())
                    .insert(this.$attributes);

                insertedKey = Array.isArray(inserted) ? inserted[0] : inserted;
            }

            if (!this.getKey() && insertedKey != null) {
                this.setKey(insertedKey);
            }

            this.$exists = true;
            await modelClass.runHook('created', this);
        }

        await modelClass.runHook('saved', this);
        this.syncOriginal();

        return this;
    }

    async delete(): Promise<boolean> {
        if (!this.$exists) return false;

        const modelClass = this.constructorAsModel();
        await modelClass.runHook('deleting', this);

        const deleted = await this
            .getQueryConnection()
            .from(modelClass.getTable())
            .where(modelClass.getPrimaryKey(), this.getKey())
            .delete();

        if (deleted) {
            this.$exists = false;
            await modelClass.runHook('deleted', this);
            return true;
        }

        return false;
    }

    async refresh(): Promise<this> {
        const modelClass = this.constructorAsModel();
        const fresh = await modelClass.findOrFail(this.getKey(), this.$trx ?? undefined);
        this.forceFill(fresh.getRawAttributes());
        this.$relations = {};
        this.syncOriginal();
        return this;
    }

    getRawAttributes(): PlainObject {
        return { ...this.$attributes };
    }

    toJSON(): PlainObject {
        const data: PlainObject = {};
        const modelClass = this.constructorAsModel();

        for (const key of Object.keys(this.$attributes)) {
            data[key] = this.getAttribute(key);
        }

        for (const key of modelClass.appends ?? []) {
            data[key] = this.getAttribute(key);
        }

        for (const [key, value] of Object.entries(this.$relations)) {
            data[key] = Array.isArray(value)
                ? value.map((item) => (item instanceof Model ? item.toJSON() : item))
                : value instanceof Model
                ? value.toJSON()
                : value;
        }

        return data;
    }

    protected async nextSequenceValue(sequence: string): Promise<any> {
        const connection = this.getQueryConnection();
        const client = connection.client.config.client;

        if (String(client).includes('oracledb') || String(client).includes('oracle')) {
            const result = await connection.raw(`SELECT ${sequence}.NEXTVAL AS id FROM DUAL`);
            const row = Array.isArray(result) ? result[0] : result;
            const data = row?.[0] ?? row?.rows?.[0] ?? row;
            return data?.ID ?? data?.id ?? Object.values(data)[0];
        }

        throw new Error(`Sequence só foi implementada automaticamente para Oracle. Cliente atual: [${client}]`);
    }

    hasOne<T extends Model>(related: ModelStatic<T>, foreignKey: string, localKey?: string) {
        return new HasOneRelation<T>(this, related, foreignKey, localKey ?? this.getKeyName());
    }

    hasMany<T extends Model>(related: ModelStatic<T>, foreignKey: string, localKey?: string) {
        return new HasManyRelation<T>(this, related, foreignKey, localKey ?? this.getKeyName());
    }

    belongsTo<T extends Model>(related: ModelStatic<T>, foreignKey: string, ownerKey?: string) {
        return new BelongsToRelation<T>(this, related, foreignKey, ownerKey ?? related.getPrimaryKey());
    }
}