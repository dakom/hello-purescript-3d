import {Maybe} from "utils/Utils";

export interface State {
    startTime: number;
    tick: Maybe<Tick>
}

export interface Tick {
    lastTime: number;
    deltaTime: number;
    elapsedTime: string;
}
