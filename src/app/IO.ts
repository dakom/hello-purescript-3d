import MyWorker = require('worker-loader!./Worker');
import {gltf_load, GltfBridge, GltfScene, LightKind, createVec3, createQuat, GltfLightNode, NodeKind, getMatrixFromTrs} from "pure3d";
import { getCompileFlags, loadWorker} from "utils/Utils";
import {WorkerCommand, MESSAGE} from "types/Worker-Types";
import {createRenderer} from "./io/renderer/Renderer";
import {createCamera} from "./io/camera/Camera";
import {parallel} from "fluture";
const {buildMode, buildVersion, isProduction} = getCompileFlags();
console.log(`%c Purescript Hello World ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');

/*
 * Everything here is generic boilerplate... the details are in the imports
 */

const renderer = createRenderer();

parallel (Infinity) ([
    loadWorker(new (MyWorker as any)()),
    gltf_load({
        renderer, 
        path: "static/ball/scene.gltf"
//        path: "static/cube/Cube.gltf"
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

            let scene = gltfBridge.getOriginalScene(createCamera()) (0)

            //TODO make this exported helper function
            const trs = { 
                translation: [0,0,0], 
                rotation: [0,0,0,1], 
                scale: [1,1,1]
            }
            const localMatrix = getMatrixFromTrs(trs);
            const modelMatrix = localMatrix 

            const light:GltfLightNode = {
                originalNodeId: gltfBridge.getAllNodes().length, //TODO strip this from GltfNode - make just on mesh
                animationIds: [], //TODO make this optional
                kind: NodeKind.LIGHT,
                light: {
                    kind: LightKind.Directional,
                    color: [1,1,1],
                    intensity: 100
                },
                transform: { trs, localMatrix, modelMatrix }
            }

            scene.nodes.push(light);

            scene = gltfBridge.updateShaderConfigs(scene)

            worker.postMessage({
                cmd: WorkerCommand.SCENE_PING,
                scene: scene
            });

        }
    );

const startRenderCycle = ([worker, gltfBridge]:[Worker, GltfBridge]) => {
    let readyForUpdate = true;

    worker.addEventListener(MESSAGE, (e:MessageEvent) => {
        switch(e.data.cmd) {
            case WorkerCommand.RENDER: {
                const scene:GltfScene = e.data.scene;

                gltfBridge.renderScene (scene);

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
