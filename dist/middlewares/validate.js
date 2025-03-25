"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => {
                const param = detail.path[0]; // Extract field name
                return {
                    param,
                    message: detail.message.replace(/['"]/g, ''),
                    code: 'INVALID_INPUT'
                };
            });
            res.status(400).json({
                status: false,
                errors
            });
            return;
        }
        next();
    };
};
exports.default = validate;
