"use strict";
exports.__esModule = true;
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
    client.client_secret = require("./sampleData/testEventCreds.json").client_secret;
};
var hookAfter = function () {
};
describe("Events", function () {
    this.timeout(6000);
    before(hookBefore);
    after(hookAfter);
    describe("authentication", function () {
        it("should authenticate an incoming Zenefits event", function (done) {
            var payload = require("./sampleData/testEventPayload.json");
            var headers = require("./sampleData/testEventHeaders.json");
            client.authenticateEvent(payload, headers, function (err, p) {
                expect(err).not.exist;
                expect(p).to.equal(payload);
                done();
            });
        });
        it("should reject an incoming Zenefits event with no signature", function (done) {
            var payload = require("./sampleData/testEventPayload.json");
            var headers = {};
            client.authenticateEvent(payload, headers, function (err, p) {
                expect(err.error).to.equal("UNAUTHORIZED EVENT");
                expect(p).to.not.exist;
                expect(err.event).to.equal(payload);
                done();
            });
        });
    });
});
//# sourceMappingURL=events.js.map