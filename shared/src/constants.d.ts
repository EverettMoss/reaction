import type { MatchLengthOption } from './types';
export declare const MATCH_LENGTH_OPTIONS: MatchLengthOption[];
export declare const WAGER_OPTIONS: readonly [0, 1, 2, 3, 5, 10];
export type WagerValue = typeof WAGER_OPTIONS[number];
export declare const ACCURACY_BONUSES: {
    readonly DEAD_CENTER: {
        readonly thresholdMs: 0;
        readonly bonus: 5;
        readonly label: "Dead Center!";
    };
    readonly PERFECT: {
        readonly thresholdMs: 10;
        readonly bonus: 2;
        readonly label: "Perfect!";
    };
    readonly ELITE: {
        readonly thresholdMs: 25;
        readonly bonus: 1;
        readonly label: "Elite!";
    };
};
export declare const TARGET_INTERVAL_RANGE: {
    minMs: number;
    maxMs: number;
};
export declare const PRE_ROUND_DISPLAY_DURATION_MS = 3000;
//# sourceMappingURL=constants.d.ts.map