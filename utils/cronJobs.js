'use strict';

const cron = require('cron');

function scheduleCronEveryDayAt(hours, minutes, seconds, job) {
    let scheduledJob = new cron.CronJob(`${seconds} ${minutes} ${hours} * * *`, job);
    scheduledJob.start();
}

function scheduleCronEveryXSeconds(seconds, job) {
    let scheduledJob = new cron.CronJob(`0/${seconds} * * * * *`, job);
    scheduledJob.start();
}

module.exports = {
    scheduleCronEveryDayAt,
    scheduleCronEveryXSeconds,
};