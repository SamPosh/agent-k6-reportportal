# agent-k6-reportportal
Report portal agent

## k6ReportPortal.js 

Main library file is K6ReportPortal.js. It contains StartLaunch and FinishLaunch functions.
Class which contains methods for pushing result to Reportportal under Suite -> Test case -> Test step.
Also method to add log messages in report portal is available

We created K6 functions for reportportal REST API calls mentioned in the developer guide.
https://github.com/reportportal/documentation/blob/master/src/md/src/DevGuides/reporting.md

StartLaunch should be called in k6 setup function.
FinishLaunch should be called in k6 teardown function.

refer demo_k6_rp_agent.js file to see the sample usage..

## reportconfig.json 

Report Config json has project name, token ,launch name,description and publishResult.
Results will be pushed to report portal only if "publishResult" is set as true.If it is false,results will not be pushed to report portal.
Fill it according to your project.
```
      "reporterOptions": {
        "endpoint": "http://<your report portal ip>:8080/api/v1",
        "token": "00000000-0000-0000-0000-000000000000",
        "launch": "K6 Performance Test Launch",
        "project": "PERFTEST",
        "description": "K6 Performance Test for my tests",
        "publishResult": true
      }
```
Note: publishResult: false will be useful when you are running for some debugging purpose and you do not want to push 
  the result to report portal.
  
## demo_k6_rp_agent.js

This is K6 test script with setup ,teardown and default function.
As K6 doesn't allow object creation in setup() function, startLaunch is a function instead of method.

StartLaunch should be called in k6 setup function. FinishLaunch should be called in k6 teardown function.
StartSuite can be added at the starting of default function.
FinishSuite can be added at the closing of default function.

This demo is based on the example given in developer guide.


