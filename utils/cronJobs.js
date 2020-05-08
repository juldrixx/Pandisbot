'use strict';

const cron = require('cron');

module.exports = {
    scheduleCronEveryDay(hours, minutes, seconds, job) {
        let scheduledJob = new cron.CronJob(seconds + ' ' + minutes + ' ' + hours + ' * * *', job);
        scheduledJob.start();
        job();
    }
};