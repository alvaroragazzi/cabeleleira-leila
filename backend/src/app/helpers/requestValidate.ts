import express, { Request } from "express";

type RuleMap = Record<string, string>;

export class RequestValidationError extends Error {
    status: number;
    errors: Record<string, string[]>;

    constructor(errors: Record<string, string[]>) {
        super("Validation failed");
        this.name = "RequestValidationError";
        this.status = 422;
        this.errors = errors;
    }
}

function splitRules(ruleString: string): string[] {
    return ruleString
        .split("|")
        .map((rule) => rule.trim())
        .filter(Boolean);
}

function readValue(req: Request, field: string): unknown {
    const bodyValue = (req.body ?? {})[field];
    if (bodyValue !== undefined) return bodyValue;

    const paramsValue = (req.params ?? {})[field];
    if (paramsValue !== undefined) return paramsValue;

    const queryValue = (req.query ?? {})[field];
    if (queryValue !== undefined) return queryValue;

    const singleFile = req.file;
    if (singleFile && singleFile.fieldname === field) {
        return singleFile;
    }

    const files = req.files;

    if (Array.isArray(files)) {
        const matchedFiles = files.filter((file) => file.fieldname === field);

        if (matchedFiles.length === 1) return matchedFiles[0];
        if (matchedFiles.length > 1) return matchedFiles;
    }

    if (files && !Array.isArray(files)) {
        const fieldFiles = files[field];

        if (Array.isArray(fieldFiles)) {
            if (fieldFiles.length === 1) return fieldFiles[0];
            if (fieldFiles.length > 1) return fieldFiles;
        }
    }

    return undefined;
}

function parseBoolean(value: unknown): boolean | null {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") {
        if (value === 1) return true;
        if (value === 0) return false;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes", "on"].includes(normalized)) return true;
        if (["false", "0", "no", "off"].includes(normalized)) return false;
    }

    return null;
}

function asString(value: unknown): string {
    if (value === null || value === undefined) return "";
    return String(value);
}

function isMulterFile(value: unknown): value is Express.Multer.File {
    return (
        typeof value === "object" &&
        value !== null &&
        "fieldname" in value &&
        "originalname" in value &&
        "mimetype" in value &&
        "size" in value
    );
}

function isFileArray(value: unknown): value is Express.Multer.File[] {
    return Array.isArray(value) && value.every(isMulterFile);
}

function getFiles(value: unknown): Express.Multer.File[] {
    if (isMulterFile(value)) return [value];
    if (isFileArray(value)) return value;
    return [];
}

function validateField(field: string, value: unknown, rules: string[]): { value: unknown; errors: string[] } {
    const errors: string[] = [];
    const hasNullable = rules.includes("nullable");
    const hasRequired = rules.includes("required");

    if (value === undefined || value === null || value === "") {
        if (hasRequired) {
            errors.push(`The ${field} field is required.`);
        }
        return { value, errors };
    }

    let parsedValue: any = value;

    for (const rule of rules) {
        const [name, rawArgs] = rule.split(":");

        if (name === "required" || name === "nullable") continue;

        if (name === "string") {
            if (typeof parsedValue !== "string") {
                errors.push(`The ${field} must be a string.`);
            }
            continue;
        }

        if (name === "integer") {
            const intValue = Number.parseInt(asString(parsedValue), 10);
            const isInteger = Number.isInteger(intValue) && asString(parsedValue).trim() !== "";
            if (!isInteger) {
                errors.push(`The ${field} must be an integer.`);
            } else {
                parsedValue = intValue;
            }
            continue;
        }

        if (name === "numeric") {
            const numberValue = Number(asString(parsedValue));
            if (Number.isNaN(numberValue)) {
                errors.push(`The ${field} must be numeric.`);
            } else {
                parsedValue = numberValue;
            }
            continue;
        }

        if (name === "boolean") {
            const boolValue = parseBoolean(parsedValue);
            if (boolValue === null) {
                errors.push(`The ${field} field must be true or false.`);
            } else {
                parsedValue = boolValue;
            }
            continue;
        }

        if (name === "array") {
            if (!Array.isArray(parsedValue)) {
                errors.push(`The ${field} must be an array.`);
            }
            continue;
        }

        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof parsedValue !== "string" || !emailRegex.test(parsedValue)) {
                errors.push(`The ${field} must be a valid email address.`);
            }
            continue;
        }

        if (name === "min") {
            const minValue = Number(rawArgs);
            if (Number.isNaN(minValue)) continue;

            if (typeof parsedValue === "number" && parsedValue < minValue) {
                errors.push(`The ${field} must be at least ${minValue}.`);
            }
            if (typeof parsedValue === "string" && parsedValue.length < minValue) {
                errors.push(`The ${field} must be at least ${minValue} characters.`);
            }
            if (Array.isArray(parsedValue) && parsedValue.length < minValue) {
                errors.push(`The ${field} must have at least ${minValue} items.`);
            }
            continue;
        }

        if (name === "max") {
            const maxValue = Number(rawArgs);
            if (Number.isNaN(maxValue)) continue;

            if (typeof parsedValue === "number" && parsedValue > maxValue) {
                errors.push(`The ${field} may not be greater than ${maxValue}.`);
            }
            if (typeof parsedValue === "string" && parsedValue.length > maxValue) {
                errors.push(`The ${field} may not be greater than ${maxValue} characters.`);
            }
            if (Array.isArray(parsedValue) && parsedValue.length > maxValue) {
                errors.push(`The ${field} may not have more than ${maxValue} items.`);
            }
            continue;
        }

        if (name === "in") {
            const allowed = (rawArgs ?? "").split(",").map((item) => item.trim());
            if (!allowed.includes(asString(parsedValue))) {
                errors.push(`The selected ${field} is invalid.`);
            }
        }

        if (name === "file") {
            if (!isMulterFile(parsedValue)) {
                errors.push(`The ${field} must be a file.`);
            }
            continue;
        }

        if (name === "files") {
            if (!isFileArray(parsedValue)) {
                errors.push(`The ${field} must be a list of files.`);
            }
            continue;
        }

        if (name === "image") {
            const files = getFiles(parsedValue);

            if (files.length === 0) {
                errors.push(`The ${field} must be an image.`);
                continue;
            }

            const isValid = files.every((file) => file.mimetype.startsWith("image/"));

            if (!isValid) {
                errors.push(`The ${field} must be an image.`);
            }

            continue;
        }

        if (name === "mimes") {
            const allowed = (rawArgs ?? "")
                .split(",")
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);

            const files = getFiles(parsedValue);

            if (files.length === 0) {
                errors.push(`The ${field} must be a valid file.`);
                continue;
            }

            const isValid = files.every((file) => {
                const extension = file.originalname.split(".").pop()?.toLowerCase();
                return extension ? allowed.includes(extension) : false;
            });

            if (!isValid) {
                errors.push(`The ${field} must be a file of type: ${allowed.join(", ")}.`);
            }

            continue;
        }
    }

    if (hasNullable && (parsedValue === "" || parsedValue === undefined)) {
        parsedValue = null;
    }

    return { value: parsedValue, errors };
}

async function validateRequest(this: Request, rules: RuleMap): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};
    const errorBag: Record<string, string[]> = {};

    for (const [field, ruleString] of Object.entries(rules)) {
        const rulesForField = splitRules(ruleString);
        const value = readValue(this, field);
        const output = validateField(field, value, rulesForField);

        if (output.errors.length > 0) {
            errorBag[field] = output.errors;
            continue;
        }

        if (output.value !== undefined) {
            result[field] = output.value;
        }
    }

    if (Object.keys(errorBag).length > 0) {
        throw new RequestValidationError(errorBag);
    }

    return result;
}

express.request.validate = validateRequest as Request["validate"];

export default validateRequest;