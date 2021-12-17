# agent-k6-reportportal
Report portal agent

## k6ReportPortal.js 

Main library file is K6ReportPortal.js. 

We created K6 functions for reportportal REST API calls mentioned in the developer guide.
https://github.com/reportportal/documentation/blob/master/src/md/src/DevGuides/reporting.md

StartLaunch should be called in k6 setup function.
FinishLaunch should be called in k6 teardown function.

