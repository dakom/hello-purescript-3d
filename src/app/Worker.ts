import {GltfScene} from "pure3d";
import {initWorker} from "utils/Utils";
import {WorkerCommand, MESSAGE} from "types/Worker-Types";
import {updateState, getInitialState} from "purescript/Main/index";

initWorker().fork(
    console.error,
    worker => {

        let state: {
            frameTs?: number;
            scene: GltfScene;
        }

        worker.addEventListener(MESSAGE, (e:MessageEvent) => {
            switch(e.data.cmd) {
                case WorkerCommand.SCENE_PING:
                    state = {
                        scene: e.data.scene
                    }

                    console.log(state.scene);

                    worker.postMessage({
                        cmd: WorkerCommand.SCENE_PONG,
                    });
                    break;
                case WorkerCommand.TICK:

                    /*
                    state = state === undefined
                        ?   getInitialState(e.data.frameTs)
                        :   updateState (e.data.frameTs) (state); 
                    */
                    worker.postMessage({
                        cmd: WorkerCommand.RENDER,
                        scene: state.scene
                    });

                    break;
            }
        });
    }
);


