# agent-k6-reportportal
Report portal agent

## k6ReportPortal.js 

Main library file is K6ReportPortal.js. 

We created K6 functions for reportportal REST API calls mentioned in the developer guide.
https://github.com/reportportal/documentation/blob/master/src/md/src/DevGuides/reporting.md

StartLaunch should be called in k6 setup function.
FinishLaunch should be called in k6 teardown function.

## reportconfig.json 

Report Config json has project name, token ,launch name and description. Fill it according to your project.

## demo_k6_rp_agent.js

This is K6 test script with setup ,teardown and default function.
As K6 setup doesn't allow object creation startLaunch is a function instead of method.

This demo is based on the example given in developer guide.

