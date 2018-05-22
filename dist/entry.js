"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sso_1 = __importDefault(require("./spider/sso"));
async function start() {
    //shoac();
    //sgt();
    sso_1.default();
}
exports.default = start;
//# sourceMappingURL=entry.js.map