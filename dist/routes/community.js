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
// Function to generate slug from name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};
// Validation schemas
const createCommunitySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required()
        .messages({
        'string.min': 'Name should be at least 2 characters.',
        'string.empty': 'Name is required.',
        'any.required': 'Name is required.'
    }),
});
// Create community
router.post('/', auth_1.default, (0, validate_1.default)(createCommunitySchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const slug = generateSlug(name);
        if (!req.user) {
            res.status(401).json({
                status: false,
                errors: [{ message: 'User not authenticated' }]
            });
            return;
        }
        // Create community and add owner as admin member
        const community = yield prisma_1.default.community.create({
            data: {
                name,
                slug,
                members: {
                    create: {
                        userId: req.user.id,
                        role: 'Community Admin'
                    }
                }
            }
        });
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: community.id.toString(),
                    name: community.name,
                    slug: community.slug,
                    owner: req.user.id.toString(),
                    created_at: community.createdAt,
                    updated_at: community.updatedAt
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
// Get all communities
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const [communities, total] = yield Promise.all([
            prisma_1.default.community.findMany({
                include: {
                    members: {
                        where: { role: 'Community Admin' },
                        include: { user: true }
                    }
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit
            }),
            prisma_1.default.community.count()
        ]);
        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages: Math.ceil(total / limit),
                    page
                },
                data: communities.map(community => {
                    var _a;
                    return ({
                        id: community.id.toString(),
                        name: community.name,
                        slug: community.slug,
                        owner: ((_a = community.members[0]) === null || _a === void 0 ? void 0 : _a.user) ? {
                            id: community.members[0].user.id.toString(),
                            name: community.members[0].user.name
                        } : null,
                        created_at: community.createdAt,
                        updated_at: community.updatedAt
                    });
                })
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
// Get all communities owned by me
router.get('/me/owner', auth_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                status: false,
                errors: [{ message: 'User not authenticated' }]
            });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const [communities, total] = yield Promise.all([
            prisma_1.default.community.findMany({
                where: {
                    members: {
                        some: {
                            userId: req.user.id,
                            role: 'Community Admin'
                        }
                    }
                },
                include: {
                    members: {
                        where: { role: 'Community Admin' },
                        include: { user: true }
                    }
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit
            }),
            prisma_1.default.community.count({
                where: {
                    members: {
                        some: {
                            userId: req.user.id,
                            role: 'Community Admin'
                        }
                    }
                }
            })
        ]);
        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages: Math.ceil(total / limit),
                    page
                },
                data: communities.map(community => ({
                    id: community.id.toString(),
                    name: community.name,
                    slug: community.slug,
                    owner: community.members[0].user.id.toString(),
                    created_at: community.createdAt,
                    updated_at: community.updatedAt
                }))
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
// Get all communities joined by me
router.get('/me/member', auth_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                status: false,
                errors: [{ message: 'User not authenticated' }]
            });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const [memberships, total] = yield Promise.all([
            prisma_1.default.member.findMany({
                where: { userId: req.user.id },
                include: {
                    community: {
                        include: {
                            members: {
                                where: { role: 'Community Admin' },
                                include: { user: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit
            }),
            prisma_1.default.member.count({
                where: { userId: req.user.id }
            })
        ]);
        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages: Math.ceil(total / limit),
                    page
                },
                data: memberships.map(membership => {
                    var _a;
                    return ({
                        id: membership.community.id.toString(),
                        name: membership.community.name,
                        slug: membership.community.slug,
                        owner: ((_a = membership.community.members[0]) === null || _a === void 0 ? void 0 : _a.user) ? {
                            id: membership.community.members[0].user.id.toString(),
                            name: membership.community.members[0].user.name
                        } : null,
                        created_at: membership.community.createdAt,
                        updated_at: membership.community.updatedAt
                    });
                })
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
// Get community members
router.get('/:id/members', auth_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        // Check if community exists
        const community = yield prisma_1.default.community.findUnique({
            where: { id: parseInt(id, 10) }
        });
        if (!community) {
            res.status(404).json({
                status: false,
                errors: [{
                        message: 'Community not found',
                        code: 'RESOURCE_NOT_FOUND'
                    }]
            });
            return;
        }
        // Get members of the community
        const [members, total] = yield Promise.all([
            prisma_1.default.member.findMany({
                where: { communityId: parseInt(id, 10) },
                include: {
                    user: true
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit
            }),
            prisma_1.default.member.count({
                where: { communityId: parseInt(id, 10) }
            })
        ]);
        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages: Math.ceil(total / limit),
                    page
                },
                data: members.map(member => ({
                    id: member.id,
                    community: member.communityId,
                    user: {
                        id: member.user.id,
                        name: member.user.name
                    },
                    role: {
                        id: member.id,
                        role: member.role,
                    },
                    created_at: member.createdAt
                }))
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
