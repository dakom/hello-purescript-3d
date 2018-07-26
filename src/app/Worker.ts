import {GltfScene, gltf_createAnimator, gltf_updateScene} from "pure3d";
import {initWorker} from "utils/Utils";
import {WorkerCommand, MESSAGE} from "types/Worker-Types";
import {move} from "purescript/Main/index";
import * as L from "partial.lenses";

initWorker().fork(
    console.error,
    worker => {

        //top-level mutable state
        let lastTs:number;
        let direction:number = 1;
        let scene:Readonly<GltfScene>;
        let updateSceneForRenderer: (frameTs: number) => (scene:GltfScene) => GltfScene;

        let lightLens:Array<string | number>;

        worker.addEventListener(MESSAGE, (e:MessageEvent) => {
            switch(e.data.cmd) {
                case WorkerCommand.SCENE_PING:

                    scene = e.data.scene;
                    updateSceneForRenderer = gltf_updateScene(gltf_createAnimator(e.data.animations) ({loop: true}));


                    /* One day this will all be purescript :D */
                    lightLens = [
                        "nodes",
                        scene.nodes.findIndex(node => node["name"] === "MyLight"),
                        "transform",
                        "trs",
                        "translation",
                        0
                    ];

                    scene = L.set(lightLens) (-15) (scene);

                    setInterval(() => direction *= -1, 3000);

                    worker.postMessage({
                        cmd: WorkerCommand.SCENE_PONG,
                    });
                    break;

                case WorkerCommand.TICK:

                    //Also this, would ideally all by in purescript... 
                    if(lastTs !== undefined) {
                        const amt = (e.data.frameTs - lastTs) * .01 * direction;

                        scene = L.modify(lightLens) (move(amt)) (scene)
                    }

                    lastTs = e.data.frameTs;

                    scene = updateSceneForRenderer (e.data.frameTs) (scene);

                    worker.postMessage({
                        cmd: WorkerCommand.RENDER,
                        scene
                    });

                    break;
            }
        });
    }
);


