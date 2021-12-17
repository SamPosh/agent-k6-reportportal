import { startLaunch,finishLaunch } from "./k6ReportPortal.js";
import exec from "k6/execution";
import RpClient from "./k6ReportPortal.js";

var configFilePath = `./${__ENV.TEST_CONFIG}`
var testConfig = JSON.parse(open(configFilePath));
var reporterOptions = testConfig.reporterOptions;

export const options = {
    scenarios: {
        "my-sceanrio": {
            executor: "shared-iterations",
            vus: 1,
            iterations: 3,
            maxDuration: "10m",
        },
    },
};

export function setup()
{

    let launchId = startLaunch(reporterOptions);
    console.log(launchId);
    return {"launchId": launchId}
}
export default function(data)
{
    const execIteration = exec.scenario.iterationInTest;
    let launchId = data.launchId
    let rpClient = new RpClient(launchId,reporterOptions);
    let suiteId =rpClient.startSuite(`(Suite) Services #${execIteration+1}`,"Performance Test Workflow");
    console.log(suiteId);
    let testId =rpClient.startTest(suiteId,"(Test) PluginServiceTest","Test Plugin service");
    console.log(testId);
    let uploadPlugintestStepId =rpClient.startTestStep(testId,"(Step) uploadPlugin","(Step) uploadPlugin");
    console.log(uploadPlugintestStepId);
    let updatePlugintestStepId =rpClient.startTestStep(testId,"(Step) updatePlugin","(Step) updatePlugin");
    //finishTestStep(testStepId,"passed");
    rpClient.finishTestStep(uploadPlugintestStepId,"failed","ab001","(Step) uploadPlugin Failed");
    rpClient.finishTestStep(updatePlugintestStepId,"passed"); // As passed , it doesn't have issue type and comment
    rpClient.finishTest(testId,"failed");
    rpClient.finishSuite(suiteId);
}
export function teardown(data) {
   finishLaunch(data.launchId,reporterOptions);
}
