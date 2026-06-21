import { Model } from "./Model";

export type HookHandler<T extends Model = Model> = (model: T) => void | Promise<void>;