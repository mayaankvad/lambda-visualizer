import { spawn } from "node:child_process";
import EventEmitter from "node:events";
import process from "node:process";

import { Mutex } from "async-mutex";
import chalk from "chalk";

import { LAMBDA_BINARY } from "./config.js";
import { logger } from "./logging.js";

export default class PlacementService {
    private runningPIDs: Set<number>;
    private mutex: Mutex;
    private emitter: EventEmitter;

    constructor() {
        this.runningPIDs = new Set<number>();
        this.mutex = new Mutex();
        this.emitter = new EventEmitter();
    }

    public getRunningPids(): ReadonlySet<number> {
        return this.runningPIDs;
    }

    public getInstanceCount(): number {
        return this.runningPIDs.size;
    }

    public async createInstance(): Promise<number> {
        const child = spawn(LAMBDA_BINARY, [], {
            env: {
                AWS_LAMBDA_RUNTIME_API: "127.0.0.1:8000",
            },
        });

        if (!child.pid) {
            return -1;
        }

        logger.info(
            chalk.bold.yellow(
                `:rocket: Lambda Runtime Created: PID ${child.pid}`
            )
        );

        child.on("close", () => {
            logger.info(
                chalk.bold.redBright(
                    `:skull: Lambda Runtime Exited: PID ${child.pid}`
                )
            );

            this.mutex.runExclusive(() => {
                this.runningPIDs.delete(child.pid!);
                this.emitter.emit(`killed-pid:${child.pid}`);
            });
        });

        child.stdout.on("data", (data) => {
            logger.debug(chalk.gray(`[PID: ${child.pid}] stdout: ${data}`));
        });

        child.stderr.on("data", (data) => {
            logger.debug(chalk.gray(`[PID: ${child.pid}] stderr: ${data}`));
        });

        return new Promise((resolve) => {
            this.mutex.runExclusive(() => {
                this.runningPIDs.add(child.pid!);
                resolve(child.pid!);
            });
        });
    }

    public killInstance(pid: number) {
        if (!this.isInstanceRunning(pid)) {
            return;
        }

        return new Promise((resolve) => {
            this.emitter.once(`killed-pid:${pid}`, resolve);
            process.kill(pid);
        });
    }

    public killAllInstances() {
        const promises = [];

        for (const pid of this.runningPIDs) {
            const promise = this.killInstance(pid);
            promises.push(promise);
        }

        return Promise.all(promises);
    }

    private isInstanceRunning(pid: number): boolean {
        try {
            process.kill(pid, 0);
            return true;
        } catch (_) {
            return false;
        }
    }
}
