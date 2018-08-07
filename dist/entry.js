"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shoac_1 = __importStar(require("./spider/shoac"));
const sgt_1 = __importDefault(require("./spider/sgt"));
const sso_1 = __importStar(require("./spider/sso"));
async function start() {
    await Promise.all([shoac_1.default(), sgt_1.default(), sso_1.default()]);
    await Promise.all([shoac_1.getDetails(), sso_1.getDetails()]);
}
exports.default = start;
//# sourceMappingURL=entry.js.map