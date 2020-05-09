'use strict';

const cron = require('cron');

module.exports = {
    scheduleCronEveryDayAt(hours, minutes, seconds, job) {
        let scheduledJob = new cron.CronJob(`${seconds} ${minutes} ${hours} * * *`, job);
        scheduledJob.start();
        job();
    },
    scheduleCronEveryXSeconds(seconds, job) {
        let scheduledJob = new cron.CronJob(`0/${seconds} * * * * *`, job);
        scheduledJob.start();
        job();
    },
};