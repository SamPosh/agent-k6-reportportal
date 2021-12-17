import http from "k6/http";

/**
 * This will create launch in our reportportal project
 * @param {object} reporterOptions 
 * @returns 
 */
export function startLaunch(reporterOptions) {
    let reportPortalUri = `${reporterOptions.endpoint}/${reporterOptions.project}`
    let launchName = reporterOptions.launch;
    let payload = { "name": `${launchName}`, "description": "K6 load test report", "startTime": Date.now(), "mode": "DEFAULT", "attributes": [{ "key": "build", "value": "0.1" }, { "value": "test" }] }
    let response = http.post(`${reportPortalUri}/launch`, JSON.stringify(payload), getHeader(reporterOptions.token));
    let body = JSON.parse(response.body);
    let launchId = body.id;
    return launchId;
}

/**
 * This will finish launch created by startLaunch
 * @param {string} launchId 
 * @param {*} reporterOptions 
 */
export function finishLaunch(launchId,reporterOptions) {
    let reportPortalUri = `${reporterOptions.endpoint}/${reporterOptions.project}`
    let payload = {
        "endTime": Date.now()
    }
    let response = http.put(`${reportPortalUri}/launch/${launchId}/finish`, JSON.stringify(payload), getHeader(reporterOptions.token));
    let body = JSON.parse(response.body);
    console.log(`[FinishLaunch] ${body.message}`);

}

/**
 * This will create header with authorization token.
 * @param {token} token 
 * @returns 
 */
function getHeader(token) {
    var header = {
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        },
    };
    return header;
}


/**
 * 
 */
export default class RpClient {

    constructor(launchId,reporterOptions){
        this.launchId = launchId
        this.reportPortalUri = `${reporterOptions.endpoint}/${reporterOptions.project}`
        this.token = reporterOptions.token


    }

    startSuite(suiteName, suiteDescription) {
        let payload = {
            "name": `${suiteName}`, "startTime": Date.now(), "type": "suite", "launchUuid":
                `${this.launchId}`, "description": `${suiteDescription}`
        }
        let response = http.post(`${this.reportPortalUri}/item`, JSON.stringify(payload), getHeader(this.token));
        let body = JSON.parse(response.body);
        let suiteId = body.id;
        return suiteId;
    }
    startTest( suiteId, testcaseName, testDescription) {
        let payload = { "name": `${testcaseName}`, "startTime": Date.now(), "type": "test", "launchUuid": `${this.launchId}`, "description": `${testDescription}` }
        let response = http.post(`${this.reportPortalUri}/item/${suiteId}`, JSON.stringify(payload), getHeader(this.token));
        let body = JSON.parse(response.body);
        let testId = body.id;
        return testId;
    }

    startTestStep( testId, name, description) {
        let payload = { "name": `${name}`, "startTime": Date.now(), "type": "step", "hasStats": false, "launchUuid": `${this.launchId}`, "description": `${description}` }
        let response = http.post(`${this.reportPortalUri}/item/${testId}`, JSON.stringify(payload), getHeader(this.token));
        let body = JSON.parse(response.body);
        let testStepId = body.id;
        return testStepId;
    }

    finishTestStep(id, status, issueType, comment = "no comments") {

        let payload = {
            "endTime": Date.now(),
            "status": `${status}`,
            "launchUuid": `${this.launchId}`
        }
        if (issueType !== null) {
            payload["issue"] =
            {
                "issueType": `${issueType}`,
                "comment": `${comment}`
            }
        }
        let response = http.put(`${this.reportPortalUri}/item/${id}`, JSON.stringify(payload), getHeader(this.token));
        let body = JSON.parse(response.body);
        console.log(`[FinishTestStep] ${body.message}`);
    }
    finishTest( id, status) {
        let payload = {
            "status": status,
            "endTime": Date.now(),
            "launchUuid": `${this.launchId}`
        }
        let response = http.put(`${this.reportPortalUri}/item/${id}`, JSON.stringify(payload), getHeader(this.token));
        let body = JSON.parse(response.body);
        console.log(`[FinishTest]${body.message}`);

    }
    finishSuite(id) {
        let payload = {
            "endTime": Date.now(),
            "launchUuid": `${this.launchId}`
        }
        let response = http.put(`${this.reportPortalUri}/item/${id}`, JSON.stringify(payload), getHeader(this.token));
        let body = JSON.parse(response.body);
        console.log(`[FinishTestSuite] ${body.message}`);
    }
}

