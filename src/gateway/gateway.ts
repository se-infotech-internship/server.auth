const cluster = require('cluster');
const koa = require('koa');
const http = require('http');
const os = require('os');
const pid = process.pid;

if (cluster.isMaster) {
    const cpusCount = os.cpus().length;
    console.log(`CPUs: ${cpusCount}`);
    console.log(`Master started. Pid: ${pid}`);
    for (let i = 0; i < cpusCount-1; i++) {
        const worker = cluster.fork();
    }

    cluster.on('exit', (worker: any, code: number) => {
        console.log(`Worker died! Pid: ${worker.process.pid}. Code ${code}`);
        if (code === 1) {
            cluster.fork();
        }
    });
}

if (cluster.isWorker) {
    const app = new koa()
    app.listen(8800, () => {
        console.log(`Worker started. Pid: ${pid}`);
    });
}
