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
const addMemberSchema = joi_1.default.object({
    community: joi_1.default.number().required()
        .messages({
        'number.base': 'Community ID must be a number.',
        'any.required': 'Community ID is required.'
    }),
    user: joi_1.default.number().required()
        .messages({
        'number.base': 'User ID must be a number.',
        'any.required': 'User ID is required.'
    }),
    role: joi_1.default.number().required()
        .messages({
        'number.base': 'Role ID must be a number.',
        'any.required': 'Role ID is required.'
    }),
});
// Add member to community
router.post('/', auth_1.default, (0, validate_1.default)(addMemberSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parse IDs as integers
        const communityId = parseInt(req.body.community, 10);
        const userId = parseInt(req.body.user, 10);
        const roleId = parseInt(req.body.role, 10);
        if (!req.user) {
            res.status(401).json({
                status: false,
                errors: [{ message: 'User not authenticated' }]
            });
            return;
        }
        // Check if community exists
        const community = yield prisma_1.default.community.findUnique({
            where: { id: communityId },
            include: {
                members: {
                    where: {
                        userId: req.user.id,
                        role: 'Community Admin'
                    }
                }
            }
        });
        if (!community) {
            res.status(400).json({
                status: false,
                errors: [{
                        param: 'community',
                        message: 'Community not found.',
                        code: 'RESOURCE_NOT_FOUND'
                    }]
            });
            return;
        }
        // Check if user exists
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(400).json({
                status: false,
                errors: [{
                        param: 'user',
                        message: 'User not found.',
                        code: 'RESOURCE_NOT_FOUND'
                    }]
            });
            return;
        }
        // Check if role exists
        const role = yield prisma_1.default.role.findUnique({
            where: { id: roleId }
        });
        if (!role) {
            res.status(400).json({
                status: false,
                errors: [{
                        param: 'role',
                        message: 'Role not found.',
                        code: 'RESOURCE_NOT_FOUND'
                    }]
            });
            return;
        }
        // Check if the authenticated user is an admin of the community
        if (community.members.length === 0) {
            res.status(403).json({
                status: false,
                errors: [{
                        message: 'You are not authorized to perform this action.',
                        code: 'NOT_ALLOWED_ACCESS'
                    }]
            });
            return;
        }
        // Check if member already exists
        const existingMember = yield prisma_1.default.member.findFirst({
            where: {
                communityId,
                userId
            }
        });
        if (existingMember) {
            res.status(400).json({
                status: false,
                errors: [{
                        message: 'User is already added in the community.',
                        code: 'RESOURCE_EXISTS'
                    }]
            });
            return;
        }
        // Create new member with role name
        const member = yield prisma_1.default.member.create({
            data: {
                communityId,
                userId,
                role: role.name // Use role.name instead of roleId
            }
        });
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: member.id.toString(),
                    community: member.communityId.toString(),
                    user: member.userId.toString(),
                    role: role.id.toString(),
                    created_at: member.createdAt
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
// Remove member from community
router.delete('/:id', auth_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberId = parseInt(req.params.id, 10);
        if (!req.user) {
            res.status(401).json({
                status: false,
                errors: [{ message: 'User not authenticated' }]
            });
            return;
        }
        // Check if member exists
        const member = yield prisma_1.default.member.findUnique({
            where: { id: memberId },
            include: {
                community: {
                    include: {
                        members: {
                            where: {
                                userId: req.user.id
                            }
                        }
                    }
                },
                user: true
            }
        });
        if (!member) {
            res.status(404).json({
                status: false,
                errors: [{
                        message: "Member not found.",
                        code: "RESOURCE_NOT_FOUND"
                    }]
            });
            return;
        }
        // Get role information for the authenticated user
        const authUserMember = member.community.members[0];
        if (!authUserMember || !['Community Admin', 'Community Moderator'].includes(authUserMember.role)) {
            res.status(403).json({
                status: false,
                errors: [{
                        message: "You are not authorized to perform this action.",
                        code: "NOT_ALLOWED_ACCESS"
                    }]
            });
            return;
        }
        // Prevent removing community admin if you're a moderator
        if (authUserMember.role === 'Community Moderator' && member.role === 'Community Admin') {
            res.status(403).json({
                status: false,
                errors: [{
                        message: "Moderators cannot remove admins from the community.",
                        code: "NOT_ALLOWED_ACCESS"
                    }]
            });
            return;
        }
        // Remove member
        yield prisma_1.default.member.delete({
            where: { id: memberId }
        });
        res.status(200).json({
            status: true
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
