"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const prisma_1 = __importDefault(require("../config/prisma"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const validate_1 = __importDefault(require("../middlewares/validate"));
const router = express_1.default.Router();
// Validation schemas
const createRoleSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required()
        .messages({
        'string.min': 'Name should be at least 2 characters.',
        'string.empty': 'Name is required.',
        'any.required': 'Name is required.',
    }),
});
// Create role
router.post('/', auth_1.default, (0, validate_1.default)(createRoleSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                status: false,
                errors: [{ message: 'User not authenticated' }]
            });
            return;
        }
        const { name } = req.body;
        // Check if role already exists
        const existingRole = yield prisma_1.default.role.findFirst({
            where: { name }
        });
        if (existingRole) {
            res.status(400).json({
                status: false,
                errors: [{
                        param: 'name',
                        message: 'Role with this name already exists.',
                        code: 'RESOURCE_EXISTS'
                    }]
            });
            return;
        }
        // Create a new role
        const role = yield prisma_1.default.role.create({
            data: {
                name,
                permissions: [] // Default empty permissions
            }
        });
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: role.id.toString(),
                    name: role.name,
                    created_at: role.createdAt,
                    updated_at: role.updatedAt
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
// Get all roles
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const [roles, total] = yield Promise.all([
            prisma_1.default.role.findMany({
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit
            }),
            prisma_1.default.role.count()
        ]);
        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages: Math.ceil(total / limit),
                    page
                },
                data: roles.map(role => ({
                    id: role.id.toString(),
                    name: role.name,
                    created_at: role.createdAt,
                    updated_at: role.updatedAt
                }))
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
