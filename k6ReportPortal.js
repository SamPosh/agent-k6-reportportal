import http from 'k6/http';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

/**
 * This will create launch in our reportportal project
 * @param {object} reporterOptions 
 * @returns 
 */
export function startLaunch(reporterOptions) {
    const reportPortalUri = `${reporterOptions.endpoint}/${reporterOptions.project}`
    const launchName = reporterOptions.launch;
    const payload = {
        'name': launchName,
        'description': 'K6 load test report',
        'startTime': Date.now(),
        'mode': 'DEFAULT',
        'attributes': [{ 'key': 'build', 'value': '0.1' }, { 'value': 'test' }]
    }
    const response = http.post(`${reportPortalUri}/launch`, JSON.stringify(payload), getHeader(reporterOptions.token));
    return JSON.parse(response.body).id;
}

/**
 * This will finish launch created by startLaunch
 * @param {string} launchId 
 * @param {*} reporterOptions 
 */
export function finishLaunch(launchId, reporterOptions) {
    const reportPortalUri = `${reporterOptions.endpoint}/${reporterOptions.project}`
    const payload = {
        'endTime': Date.now()
    }
    const response = http.put(`${reportPortalUri}/launch/${launchId}/finish`, JSON.stringify(payload), getHeader(reporterOptions.token));
    console.log(`[FinishLaunch] ${JSON.parse(response.body).message}`);
}

/**
 * This will create header with authorization token.
 * @param {token} token 
 * @returns 
 */
function getHeader(token) {
    return {
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
        },
    };
};

/**
 * 
 */
export default class RpClient {
    constructor(launchId, reporterOptions) {
        this.launchId = launchId
        this.reportPortalUri = `${reporterOptions.endpoint}/${reporterOptions.project}`
        this.token = reporterOptions.token
    }

/**
 * This will return the value of a log batch with a new log entry added.
 * 
 * @param {Array} jsonObject
 * @param {string} message
 * @param {string} level 
 * @returns 
 */
    addLogToBatch(jsonObject, message, level = 'error') {
        let newObject = jsonObject;
        newObject.push({
            message: message,
            time: Date.now(),
            launchUuid: this.launchId,
            level: level
        });
        return newObject;
    }

/**
 * This will upload the log batch to the launch.
 * 
 * @param {Array} jsonBody
 */
    saveLogBatch(jsonBody) {
        let payload = new FormData();
        payload.append('json_request_part', http.file(JSON.stringify(jsonBody), 'json_request_part', 'application/json'));
        const response = http.post(`${this.reportPortalUri}/log`, payload.body(),
            {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${payload.boundary}`,
                    'Authorization': `Bearer ${reporterOptions.token}`
                }
            });
        console.log(`Following logs uploaded: ${response.body}`)
    }

/**
 * This will upload a single log to the launch.
 * 
 * @param {string} message
 * @param {string} level 
 * @returns 
 */
    saveSingleLog(message, level = 'error') {
        const payload = {
            'message': message,
            'time': Date.now(),
            'launchUuid': this.launchId,
            'level': level
        }
        const response = http.post(`${this.reportPortalUri}/log`, JSON.stringify(payload), getHeader(this.token));
        return JSON.parse(response.body).id;
    }

    startSuite(suiteName, suiteDescription) {
        const payload = {
            'name': suiteName,
            'startTime': Date.now(),
            'type': 'suite',
            'launchUuid': this.launchId,
            'description': suiteDescription
        }
        const response = http.post(`${this.reportPortalUri}/item`, JSON.stringify(payload), getHeader(this.token));
        return JSON.parse(response.body).id;
    }

    startTest(suiteId, testcaseName, testDescription) {
        const payload = {
            'name': testcaseName,
            'startTime': Date.now(),
            'type': 'test',
            'launchUuid': this.launchId,
            'description': testDescription
        }
        const response = http.post(`${this.reportPortalUri}/item/${suiteId}`, JSON.stringify(payload), getHeader(this.token));
        return JSON.parse(response.body).id;
    }

    startTestStep(testId, name, description) {
        const payload = {
            'name': name,
            'startTime': Date.now(),
            'type': 'step',
            'hasStats': false,
            'launchUuid': this.launchId,
            'description': description
        }
        const response = http.post(`${this.reportPortalUri}/item/${testId}`, JSON.stringify(payload), getHeader(this.token));
        return JSON.parse(response.body).id;
    }

    finishTestStep(id, status, issueType = null, comment = 'no comments') {
        let payload = {
            'endTime': Date.now(),
            'status': status,
            'launchUuid': this.launchId
        }
        if (issueType !== null) {
            payload['issue'] =
            {
                'issueType': issueType,
                'comment': comment
            }
        }
        const response = http.put(`${this.reportPortalUri}/item/${id}`, JSON.stringify(payload), getHeader(this.token));
        console.log(`[FinishTestStep] ${JSON.parse(response.body).message}`);
    }

    finishTest(id, status) {
        const payload = {
            'status': status,
            'endTime': Date.now(),
            'launchUuid': this.launchId
        }
        const response = http.put(`${this.reportPortalUri}/item/${id}`, JSON.stringify(payload), getHeader(this.token));
        console.log(`[FinishTest]${JSON.parse(response.body).message}`);

    }

    finishSuite(id) {
        const payload = {
            'endTime': Date.now(),
            'launchUuid': this.launchId
        }
        const response = http.put(`${this.reportPortalUri}/item/${id}`, JSON.stringify(payload), getHeader(this.token));
        console.log(`[FinishTestSuite] ${JSON.parse(response.body).message}`);
    }
}
