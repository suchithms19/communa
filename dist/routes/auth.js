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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const validate_1 = __importDefault(require("../middlewares/validate"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = express_1.default.Router();
// Validation schemas
const signupSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required()
        .messages({
        'string.min': 'Name should be at least 2 characters.',
        'string.empty': 'Name is required.',
        'any.required': 'Name is required.'
    }),
    email: joi_1.default.string().email().required()
        .messages({
        'string.email': 'Please provide a valid email address.',
        'string.empty': 'Email is required.',
        'any.required': 'Email is required.'
    }),
    password: joi_1.default.string().min(2).required()
        .messages({
        'string.min': 'Password should be at least 2 characters.',
        'string.empty': 'Password is required.',
        'any.required': 'Password is required.'
    })
});
const signinSchema = joi_1.default.object({
    email: joi_1.default.string().email().required()
        .messages({
        'string.email': 'Please provide a valid email address.',
        'string.empty': 'Email is required.',
        'any.required': 'Email is required.'
    }),
    password: joi_1.default.string().required()
        .messages({
        'string.empty': 'Password is required.',
        'any.required': 'Password is required.'
    })
});
// Generate JWT token
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRY || '1d';
    return jsonwebtoken_1.default.sign({ id: user.id }, secret, { expiresIn: expiresIn });
};
// Signup route
router.post('/signup', (0, validate_1.default)(signupSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({
                status: false,
                errors: [{
                        param: 'email',
                        message: 'User with this email address already exists.',
                        code: 'RESOURCE_EXISTS'
                    }]
            });
            return;
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create new user
        const user = yield prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        const token = generateToken(user);
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.createdAt
                },
                meta: {
                    access_token: token
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
// Signin route
router.post('/signin', (0, validate_1.default)(signinSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user
        const user = yield prisma_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(400).json({
                status: false,
                errors: [{
                        param: 'email',
                        message: 'Please provide a valid email address.',
                        code: 'INVALID_INPUT'
                    }]
            });
            return;
        }
        // Check password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({
                status: false,
                errors: [{
                        param: 'password',
                        message: 'The credentials you provided are invalid.',
                        code: 'INVALID_CREDENTIALS'
                    }]
            });
            return;
        }
        const token = generateToken(user);
        res.json({
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.createdAt
                },
                meta: {
                    access_token: token
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
// Get me route
router.get('/me', auth_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                status: false,
                errors: [{
                        message: 'User not authenticated',
                        code: 'NOT_AUTHENTICATED'
                    }]
            });
            return;
        }
        res.json({
            status: true,
            content: {
                data: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    created_at: req.user.createdAt
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
