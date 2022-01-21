import { startLaunch, finishLaunch } from './k6ReportPortal.js';
import exec from 'k6/execution';
import RpClient from './k6ReportPortal.js';
import { sleep } from 'k6';
import http from 'k6/http';
import { check, fail } from 'k6';

const reporterOptions = JSON.parse(open(__ENV.TEST_CONFIG)).reporterOptions;

export const options = {
    scenarios: {
        'my-sceanrio': {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 3,
            maxDuration: '10m',
        },
    },
};

export function setup() {
    const launchId = startLaunch(reporterOptions);
    console.log(launchId);
    return { 'launchId': launchId }
}
export default function (data) {
    let logBatch = []; // Defining array for log batch to be uploaded later
    const execIteration = exec.scenario.iterationInTest;
    const launchId = data.launchId
    const rpClient = new RpClient(launchId, reporterOptions);
    const suiteId = rpClient.startSuite(`(Suite) Services #${execIteration + 1}`, 'Performance Test Workflow');
    console.log(suiteId);
    const testId = rpClient.startTest(suiteId, '(Test) PluginServiceTest', 'Test Plugin service');
    console.log(testId);
    const uploadPlugintestStepId = rpClient.startTestStep(testId, '(Step) Check k6 get', '(Step) checkK6get');
    console.log(uploadPlugintestStepId);
    const res = http.get('http://test.k6.io');
    if (
        !check(res, {
            'status code MUST be 200': (response) => response.status == 200,
        })
    ) {
        rpClient.writeLog(uploadPlugintestStepId, 'Response was not 200', 'error'); // Save single log
        fail('status code was *not* 200');
    }
    logBatch = rpClient.addLogToBatch(logBatch, 'Response *was* 200', uploadPlugintestStepId, 'info'); // Add first log to batch
    const updatePlugintestStepId = rpClient.startTestStep(testId, '(Step) Sleep 1 second', '(Step) Sleep');
    sleep(1);
    rpClient.writeLog(updatePlugintestStepId, 'Sleep', 'info');
    logBatch = rpClient.addLogToBatch(logBatch, 'Sleep', updatePlugintestStepId, 'info'); // Add second log to batch
    rpClient.writeLogBatch(logBatch); // Upload log batch to the launch
    //finishTestStep(testStepId,'passed');
    rpClient.finishTestStep(uploadPlugintestStepId, 'failed', 'ab001', '(Step) uploadPlugin Failed');
    rpClient.finishTestStep(updatePlugintestStepId, 'passed'); // As passed , it doesn't have issue type and comment
    rpClient.finishTest(testId, 'failed');
    rpClient.finishSuite(suiteId);
}
export function teardown(data) {
    finishLaunch(data.launchId, reporterOptions);
}
