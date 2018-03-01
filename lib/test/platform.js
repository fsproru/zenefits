"use strict";
exports.__esModule = true;
var _ = require("lodash");
var async = require("async");
var chai = require("chai");
var expect = chai.expect;
var index_1 = require("../index");
var client;
var nockBack = require("nock").back;
var hookBefore = function () {
    if (process.env.CIRCLECI) {
        client = new index_1.Zenefits({
            access_token: "",
            refresh_token: "",
            client_id: "",
            client_secret: ""
        });
    }
    else {
        client = new index_1.Zenefits(require("./testCreds.json"));
    }
    nockBack.fixtures = __dirname + "/nockFixtures";
    nockBack.setMode("record");
};
var hookAfter = function () {
};
var isInstallation = function (p) {
    expect(p).to.contain.any.keys(["status",
        "url",
        "fields",
        "company",
        "object",
        "application",
        "person_subscriptions",
        "id"
    ]);
    expect(p.object).to.equal("/platform/company_installs");
};
var isApplication = function (p) {
    expect(p).to.contain.any.keys([
        "url",
        "fields",
        "object",
        "id"
    ]);
    expect(p.object).to.equal("/platform/applications");
};
var isPersonSubscription = function (p) {
    expect(p).to.contain.any.keys([
        "fields",
        "company_install",
        "person",
        "flows",
        "status",
        "object",
        "id"
    ]);
    expect(p.object).to.equal("/platform/person_subscriptions");
};
var isFlow = function (p) {
    expect(p).to.contain.any.keys([
        "fields",
        "company",
        "company_install",
        "application",
        "person",
        "person_subscriptions",
        "type",
        "object",
        "id"
    ]);
    expect(p.object).to.equal("/platform/flows");
};
describe("Platform API", function () {
    this.timeout(6000);
    before(hookBefore);
    after(hookAfter);
    describe("#Error Recovery", function () {
        it.skip("should recover from a bad access token", function (done) {
            client.access_token = "foo";
            client.installations(function (err, resp) {
                expect(err).not.exist;
                expect(resp.data).to.be["instanceof"](Array);
                _.forEach(resp.data, function (r) {
                    isInstallation(r);
                });
                done();
            });
        });
    });
    describe("#Pagination", function () {
        it("should return next_url and 1 page of data if autoPagination is off", function (done) {
            client.autoPagination = false;
            nockBack("PeopleFixture.json", function (nockDone) {
                client.people(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    expect(resp.data).to.have.lengthOf(20);
                    expect(resp.next_url).to.be.a("string");
                    nockDone();
                    done();
                });
            });
        });
        it("should auto paginate for the full list if configured to", function (done) {
            client.autoPagination = true;
            nockBack("PeopleFixturePagination.json", function (nockDone) {
                client.people(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.have.length.above(20);
                    expect(resp.data).to.be["instanceof"](Array);
                    nockDone();
                    done();
                });
            });
        });
        it("should accept a second callback to run for each page.", function (done) {
            client.autoPagination = true;
            var totalRuns = 0;
            var runDone = function () {
                expect(totalRuns).to.equal(2);
                done();
            };
            nockBack("PeopleFixturePagination.json", function (nockDone) {
                client.people(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.have.length.above(20);
                    expect(resp.data).to.be["instanceof"](Array);
                    nockDone();
                    runDone();
                }, function (err, resp) {
                    totalRuns++;
                    expect(err).not.exist;
                    expect(resp.data).to.have.length.below(21);
                    expect(resp.data).to.be["instanceof"](Array);
                });
            });
        });
    });
    describe("#Get Applications", function () {
        it("should get information about the applications", function (done) {
            nockBack("ApplicationsFixture.json", function (nockDone) {
                client.applications(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isApplication(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single application", function (done) {
            nockBack("ApplicationsFixture.json", function (nockDone1) {
                client.applications(function (err, applications) {
                    nockDone1();
                    nockBack("ApplicationFixture.json", function (nockDone2) {
                        client.application(_.head(applications.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isApplication(resp.data);
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe.skip("#Set Application Custom Fields", function () {
        it("should set Installation Custom Fields", function (done) {
            async.auto({
                setField: function (autoCallback) {
                    nockBack("SetInstallationCustomFieldsFixture.json", function (nockDone) {
                        client.setInstallationCustomFields({ foo: "bar" }, function (err, resp) {
                            console.log(err);
                            expect(err).to.not.exist;
                            expect(resp.data).to.be.empty;
                            nockDone();
                            autoCallback(err);
                        });
                    });
                },
                checkField: ["setField", function (results, autoCallback) {
                        nockBack("PostApplicationCustomFieldsFixture.json", function (nockDone) {
                            client.applications(function (err, resp) {
                                expect(err).not.exist;
                                expect(resp.data).to.be["instanceof"](Array);
                                console.log(resp);
                                _.forEach(resp.data, function (r) {
                                    expect(r.status).to.be.equal("ok");
                                });
                                nockDone();
                                autoCallback(err);
                            });
                        });
                    }]
            }, Infinity, done);
        });
    });
    describe("#Get Company Installations", function () {
        it("should get information about the installations for companies who have added your application", function (done) {
            nockBack("CompanyInstallationsFixture.json", function (nockDone) {
                client.installations(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isInstallation(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single Company Installation", function (done) {
            nockBack("CompanyInstallationsFixture.json", function (nockDone1) {
                client.installations(function (err, installations) {
                    nockDone1();
                    nockBack("CompanyInstallationFixture.json", function (nockDone2) {
                        client.installation(_.head(installations.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isInstallation(resp.data);
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#Set Installation Status", function () {
        it("should set installation status to 'ok'", function (done) {
            async.auto({
                setToOk: function (autoCallback) {
                    nockBack("SetCompanyInstallationStatusOkFixture.json", function (nockDone) {
                        client.setInstallationStatusOk(function (err, resp) {
                            expect(err).to.not.exist;
                            expect(resp.data).to.be.empty;
                            nockDone();
                            autoCallback(err);
                        });
                    });
                },
                checkOk: ["setToOk", function (results, autoCallback) {
                        nockBack("PostSetCompanyInstallationStatusOkFixture.json", function (nockDone) {
                            client.installations(function (err, resp) {
                                expect(err).not.exist;
                                expect(resp.data).to.be["instanceof"](Array);
                                _.forEach(resp.data, function (r) {
                                    expect(r.status).to.be.equal("ok");
                                });
                                nockDone();
                                autoCallback(err);
                            });
                        });
                    }]
            }, Infinity, done);
        });
        it("should set installation status to 'not_enrolled'", function (done) {
            this.timeout(6000);
            async.auto({
                setToNotEnrolled: function (autoCallback) {
                    nockBack("SetCompanyInstallationStatusNotEnrolledFixture.json", function (nockDone) {
                        client.setInstallationStatusNotEnrolled(function (err, resp) {
                            expect(err).to.not.exist;
                            expect(resp.data).to.be.empty;
                            nockDone();
                            autoCallback(err);
                        });
                    });
                },
                checkNotEnrolled: ["setToNotEnrolled", function (results, autoCallback) {
                        nockBack("PostSetCompanyInstallationStatusNotEnrolledFixture.json", function (nockDone) {
                            client.installations(function (err, resp) {
                                expect(err).not.exist;
                                expect(resp.data).to.be["instanceof"](Array);
                                _.forEach(resp.data, function (r) {
                                    expect(r.status).to.be.equal("not_enrolled");
                                });
                                nockDone();
                                autoCallback(err);
                            });
                        });
                    }]
            }, Infinity, done);
        });
    });
    describe("Get Person Subscriptions", function () {
        it("should get information about the subscriptions for people in the company where your integration was added", function (done) {
            nockBack("PersonSubscriptionsFixture.json", function (nockDone) {
                client.personSubscriptions(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isPersonSubscription(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single subscription", function (done) {
            nockBack("PersonSubscriptionsFixture.json", function (nockDone1) {
                client.personSubscriptions(function (err, subscriptions) {
                    nockDone1();
                    nockBack("PersonSubscriptionFixture.json", function (nockDone2) {
                        client.personSubscription(_.head(subscriptions.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isPersonSubscription(resp.data);
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("Get Flows", function () {
        it("should get information about the flows (e.g. hiring) completed by people who have added your application", function (done) {
            nockBack("AllFlowsFixture.json", function (nockDone) {
                client.allFlows(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isFlow(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single subscription's flows", function (done) {
            nockBack("PersonSubscriptionsFixture.json", function (nockDone1) {
                client.personSubscriptions(function (err, subscriptions) {
                    nockDone1();
                    nockBack("IndividualFlowsFixture.json", function (nockDone2) {
                        client.individualFlows(_.head(subscriptions.data).id, function (err, resp) {
                            expect(err).not.exist;
                            _.forEach(resp.data, function (r) {
                                isFlow(r);
                            });
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=platform.js.map