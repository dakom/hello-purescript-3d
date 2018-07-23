import {Future} from "fluture";
import {WorkerLoaderCommand, MESSAGE} from "types/Worker-Types";


/*
 * these loaders resolve _after_ communication is established
 */
//Loaded by main thread 
export const loadWorker = (worker:any) => Future<any, Worker>((reject, resolve) => {
    const onInitial = (e: MessageEvent) => {
        if(e.data.cmd === WorkerLoaderCommand.READY) {
            worker.removeEventListener(MESSAGE, onInitial);
            resolve(worker);
        }
    }
    worker.addEventListener(MESSAGE, onInitial);

    worker.postMessage({ cmd: WorkerLoaderCommand.INIT});
});

//Loaded by worker thread
export const initWorker = () => Future<any, any>((reject, resolve) => {

    const onInitial = (e: MessageEvent) => {

        if(e.data.cmd === WorkerLoaderCommand.INIT) {
            (self as any).removeEventListener(MESSAGE, onInitial);
            (self as any).postMessage({cmd: WorkerLoaderCommand.READY});
            resolve(self);
        }
    }
    (self as any).addEventListener(MESSAGE, onInitial);
});

