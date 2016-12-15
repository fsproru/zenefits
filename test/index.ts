/// <reference types="nock" />
/// <reference types="chai" />
/// <reference types="mocha" />
/// <reference types="lodash" />
/// <reference path="../index.d.ts" />

import _ = require("lodash");
import fs = require("fs");
import path = require("path");
import chai = require("chai");
const expect = chai.expect;
import Zenefits from "../index";

let client = new Zenefits();

if (process.env.CIRCLECI) {
} else {
  client.bearerKey = require("./testCreds.json").bearerKey;
}

import nock = require("nock");

// nock.recorder.rec({
//   dont_print: true,
//   enable_reqheaders_recording: true,
//   output_objects: true
// });

let nockBack = require("nock").back;

nockBack.fixtures = __dirname + "/nockFixtures";
nockBack.setMode("record");

const hookAfter = function() {
  // console.log("HOOKS - AFTER");
  // console.log(__dirname + "/nockFixtures/fixtures.js");
  // fs.appendFileSync(__dirname + "/nockFixtures/fixtures.js", nock.recorder.play());
};

const isCompany = function(c: Zenefits.Company) {
  expect(c).to.contain.any.keys([
    "name",
    "people",
    "url",
    "object",
    "logo_url",
    "id"
  ]);
};

const isPerson = function(p: Zenefits.Person) {
  expect(p).to.contain.any.keys([
    "company",
    "employments",
    "date_of_birth",
    "department",
    "first_name",
    "last_name",
    "preferred_name",
    "status",
    "location",
    "manager",
    "work_phone",
    "personal_phone",
    "subordinates",
    "banks",
    "work_email",
    "personal_email",
    "street1",
    "street2",
    "city",
    "state",
    "country",
    "postal_code",
    "social_security_number",
    "gender",
    "title",
    "id",
  ]);
};

const isEmployment = function(p: Zenefits.Employment) {
  expect(p).to.contain.any.keys([
    "person",
    "hire_date",
    "termination_date",
    "termination_type",
    "employment_type",
    "comp_type",
    "annual_salary",
    "pay_rate",
    "working_hours_per_week",
    "id",
  ]);
};

const isCompanyBankAccount = function(p: Zenefits.Employment) {
  expect(p).to.contain.any.keys([
    "company",
    "account_type",
    "account_number",
    "routing_number",
    "bank_name",
    "id",
  ]);
};

describe("Core API", function() {
  after(hookAfter);

  describe("#Companies", function() {
    it("should get a list of companies", function(done: any) {
      nockBack("CompaniesFixture.json", function(nockDone: any) {
        client.companies(function(err: any, resp: Zenefits.Company[]) {
          expect(err).not.exist;
          expect(resp).to.be.instanceof(Array);

          _.forEach(resp, function(r) {
            isCompany(r);
          });

          nockDone();
          done();
        });
      });
    });

    it("should get a single company", function(done: any) {
      nockBack("CompaniesFixture.json", function(nockDone1: any) {
        client.companies((err: any, companies: Zenefits.Company[]) => {
          nockBack("CompanyFixture.json", function(nockDone2: any) {
            client.company(_.head(companies).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isCompany(resp);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#People", function() {
    it("should get a list of people", function(done: any) {
      nockBack("PeopleFixture.json", function(nockDone: any) {
        client.people(function(err: any, resp: Zenefits.Person[]) {
          expect(err).not.exist;
          expect(resp).to.be.instanceof(Array);

          _.forEach(resp, function(r) {
            isPerson(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single person", function(done: any) {
      nockBack("PeopleFixture.json", function(nockDone1: any) {
        client.people((err: any, people: Zenefits.Person[]) => {
          nockBack("PersonFixture.json", function(nockDone2: any) {
            client.person(_.head(people).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isPerson(resp);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Employments", function() {
    it("should get a list of employments", function(done: any) {
      nockBack("EmploymentsFixture.json", function(nockDone: any) {
        client.employments(function(err: any, resp: Zenefits.Employment[]) {
          expect(err).not.exist;
          expect(resp).to.be.instanceof(Array);

          _.forEach(resp, function(r) {
            isEmployment(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single employment", function(done: any) {
      nockBack("EmploymentsFixture.json", function(nockDone1: any) {
        client.employments((err: any, employments: Zenefits.Employment[]) => {
          nockBack("EmploymentFixture.json", function(nockDone2: any) {
            client.employment(_.head(employments).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isEmployment(resp);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Company Bank Accounts", function() {
    it("should get a list of company bank accounts", function(done: any) {
      nockBack("CompanyBankAccountsFixture.json", function(nockDone: any) {
        client.companyBankAccounts(function(err: any, resp: Zenefits.CompanyBankAccount[]) {
          expect(err).not.exist;
          expect(resp).to.be.instanceof(Array);

          _.forEach(resp, function(r) {
            isCompanyBankAccount(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single company bank account", function(done: any) {
      nockBack("CompanyBankAccountsFixture.json", function(nockDone1: any) {
        client.companyBankAccounts((err: any, accounts: Zenefits.CompanyBankAccount[]) => {
          nockBack("CompanyBankAccountFixture.json", function(nockDone2: any) {
            client.companyBankAccount(_.head(accounts).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isCompanyBankAccount(resp);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });
});
