const Queue = require('bull');

const config = require('../../config');

class JobQueue {
  constructor(jobName, processor, concurrency = 200) {
    this._queue = new Queue(jobName, config.redis.uri);
    this._queue.process(concurrency, async function (job) {
      await processor(job.data);
      return Promise.resolve();
    });
  }

  addJob(data) {
    this._queue.add(data);
  }
}

module.exports = JobQueue;
