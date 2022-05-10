import { body } from "express-validator";

const createKey = [
    body("description")
        .customSanitizer(value => value || `Created on ${new Date().toJSON()}`)
        .isString(),
    body("allowedOrigins")
        .isArray()
        .optional()
        .default([])
        .custom(value => {
            if (!value.every((v: unknown) => typeof v === "string")) {
                throw new Error("Array does not contain strings");
            }
            return true;
        }),
];

export { createKey };
