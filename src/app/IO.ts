import MyWorker = require('worker-loader!./Worker');
import {gltf_load, GltfBridge, GltfScene} from "pure3d";
import { getCompileFlags, loadWorker} from "utils/Utils";
import {WorkerCommand, MESSAGE} from "types/Worker-Types";
import {createRenderer} from "./io/renderer/Renderer";
import {prepScene} from "./io/scene/Scene-Prep";
import {parallel} from "fluture";

const {buildMode, buildVersion, isProduction} = getCompileFlags();
console.log(`%c Purescript Hello World ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');

const renderer = createRenderer();

parallel (Infinity) ([
    loadWorker(new (MyWorker as any)()),
    gltf_load({
        renderer, 
        path: "static/hello-world/HelloWorld.glb"
    })
]).fork(
        console.error,
        ([worker, gltfBridge]:[Worker, GltfBridge]) => {
            const onPong = (e:MessageEvent) => {
                switch(e.data.cmd) {
                    case WorkerCommand.SCENE_PONG:
                        worker.removeEventListener(MESSAGE, onPong);
                        startRenderCycle ([worker, gltfBridge]);
                        break;
                }
            }

            worker.addEventListener(MESSAGE, onPong);

            worker.postMessage({
                cmd: WorkerCommand.SCENE_PING,
                scene: prepScene(gltfBridge),
                animations: gltfBridge.getData().animations
            });

        }
    );

const startRenderCycle = ([worker, gltfBridge]:[Worker, GltfBridge]) => {
    let readyForUpdate = true;
    
    worker.addEventListener(MESSAGE, (e:MessageEvent) => {
        switch(e.data.cmd) {
            case WorkerCommand.RENDER: {
                gltfBridge.renderScene (e.data.scene);
                readyForUpdate = true;
                break;
            }
        }
    });

    const tick = (frameTs:number) => {
        if(readyForUpdate) {
            readyForUpdate = false;
            worker.postMessage({
                cmd: WorkerCommand.TICK, 
                frameTs
            });
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}
