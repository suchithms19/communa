"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const roles_1 = require("./config/roles");
const auth_1 = __importDefault(require("./routes/auth"));
const community_1 = __importDefault(require("./routes/community"));
const member_1 = __importDefault(require("./routes/member"));
const role_1 = __importDefault(require("./routes/role"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Initialize roles
(0, roles_1.initializeRoles)();
// Routes
app.use('/v1/auth', auth_1.default);
app.use('/v1/community', community_1.default);
app.use('/v1/member', member_1.default);
app.use('/v1/role', role_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: false,
        errors: [{ message: err.message || 'Internal server error' }]
    });
});
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
