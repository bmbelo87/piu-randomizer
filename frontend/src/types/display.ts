import type { Phase } from "./phase";

export interface DisplayData {

    championship: {
        id: string;
        name: string;
    };

    phase: Phase;
}