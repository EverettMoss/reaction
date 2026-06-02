"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRE_ROUND_DISPLAY_DURATION_MS = exports.TARGET_INTERVAL_RANGE = exports.ACCURACY_BONUSES = exports.WAGER_OPTIONS = exports.MATCH_LENGTH_OPTIONS = void 0;
exports.MATCH_LENGTH_OPTIONS = [
    { tier: 'short', label: 'Short (10–30 pts)', min: 10, max: 30 },
    { tier: 'medium', label: 'Medium (50–100 pts)', min: 50, max: 100 },
    { tier: 'long', label: 'Long (150–300 pts)', min: 150, max: 300 },
];
exports.WAGER_OPTIONS = [0, 1, 2, 3, 5, 10];
exports.ACCURACY_BONUSES = {
    DEAD_CENTER: { thresholdMs: 0, bonus: 5, label: 'Dead Center!' },
    PERFECT: { thresholdMs: 10, bonus: 2, label: 'Perfect!' },
    ELITE: { thresholdMs: 25, bonus: 1, label: 'Elite!' },
};
exports.TARGET_INTERVAL_RANGE = { minMs: 1000, maxMs: 9999 };
exports.PRE_ROUND_DISPLAY_DURATION_MS = 3000;
//# sourceMappingURL=constants.js.map