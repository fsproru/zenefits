"use strict";
exports.__esModule = true;
var _ = require("lodash");
var chai = require("chai");
var index_1 = require("../index");
var expect = chai.expect;
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
var isCompany = function (c) {
    expect(c).to.contain.any.keys([
        "name",
        "people",
        "url",
        "object",
        "logo_url",
        "id"
    ]);
};
var isPerson = function (p) {
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
        "object",
    ]);
};
var isEmployment = function (p) {
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
        "object",
    ]);
};
var isCompanyBankAccount = function (p) {
    expect(p).to.contain.any.keys([
        "company",
        "account_type",
        "account_number",
        "routing_number",
        "bank_name",
        "id",
        "object",
    ]);
};
var isEmployeeBankAccount = function (p) {
    expect(p).to.contain.any.keys([
        "person",
        "account_type",
        "account_number",
        "routing_number",
        "bank_name",
        "id",
        "object",
    ]);
};
var isDepartment = function (p) {
    expect(p).to.contain.any.keys([
        "people",
        "id",
        "company",
        "name",
        "object",
    ]);
};
var isLocation = function (p) {
    expect(p).to.contain.any.keys([
        "id",
        "city",
        "company",
        "country",
        "name",
        "object",
        "people",
        "state",
        "street1",
        "street2",
        "zip"
    ]);
};
var isAuthedUser = function (p) {
    expect(p).to.contain.any.keys([
        "id",
        "object",
        "company",
        "person",
        "scopes",
        "expires",
        "uninstalled",
    ]);
};
describe("Core API", function () {
    this.timeout(6000);
    before(hookBefore);
    after(hookAfter);
    describe("#Companies", function () {
        it("should get a list of companies", function (done) {
            nockBack("CompaniesFixture.json", function (nockDone) {
                client.companies(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isCompany(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single company", function (done) {
            nockBack("CompaniesFixture.json", function (nockDone1) {
                client.companies(function (err, companies) {
                    nockBack("CompanyFixture.json", function (nockDone2) {
                        client.company(_.head(companies.data).id, function (err, resp) {
                            console.log(resp);
                            expect(err).not.exist;
                            isCompany(resp.data);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#People", function () {
        it("should get a list of people", function (done) {
            nockBack("PeopleFixture.json", function (nockDone) {
                client.people(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isPerson(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single person", function (done) {
            nockBack("PeopleFixture.json", function (nockDone1) {
                client.people(function (err, people) {
                    nockBack("PersonFixture.json", function (nockDone2) {
                        client.person(_.head(people.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isPerson(resp.data);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#Employments", function () {
        it("should get a list of employments", function (done) {
            nockBack("EmploymentsFixture.json", function (nockDone) {
                client.employments(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isEmployment(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single employment", function (done) {
            nockBack("EmploymentsFixture.json", function (nockDone1) {
                client.employments(function (err, employments) {
                    nockDone1();
                    nockBack("EmploymentFixture.json", function (nockDone2) {
                        expect(err).not.exist;
                        client.employment(_.head(employments.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isEmployment(resp.data);
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#Company Bank Accounts", function () {
        it("should get a list of company bank accounts", function (done) {
            nockBack("CompanyBankAccountsFixture.json", function (nockDone) {
                client.companyBankAccounts(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isCompanyBankAccount(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single company bank account", function (done) {
            nockBack("CompanyBankAccountsFixture.json", function (nockDone1) {
                client.companyBankAccounts(function (err, accounts) {
                    nockBack("CompanyBankAccountFixture.json", function (nockDone2) {
                        client.companyBankAccount(_.head(accounts.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isCompanyBankAccount(resp.data);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#Employee Bank Accounts", function () {
        it("should get a list of employee bank accounts", function (done) {
            nockBack("EmployeeBankAccountsFixture.json", function (nockDone) {
                client.employeeBankAccounts(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isEmployeeBankAccount(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single employee bank account", function (done) {
            nockBack("EmployeeBankAccountsFixture.json", function (nockDone1) {
                client.employeeBankAccounts(function (err, accounts) {
                    nockBack("EmployeeBankAccountFixture.json", function (nockDone2) {
                        client.employeeBankAccount(_.head(accounts.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isEmployeeBankAccount(resp.data);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#Departments", function () {
        it("should get a list of departments", function (done) {
            nockBack("DepartmentsFixture.json", function (nockDone) {
                client.departments(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isDepartment(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single department", function (done) {
            nockBack("DepartmentsFixture.json", function (nockDone1) {
                client.departments(function (err, departments) {
                    nockBack("DepartmentFixture.json", function (nockDone2) {
                        client.department(_.head(departments.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isDepartment(resp.data);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#Locations", function () {
        it("should get a list of locations", function (done) {
            nockBack("LocationsFixture.json", function (nockDone) {
                client.locations(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp.data).to.be["instanceof"](Array);
                    _.forEach(resp.data, function (r) {
                        isLocation(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single location", function (done) {
            nockBack("LocationsFixture.json", function (nockDone1) {
                client.locations(function (err, locations) {
                    nockBack("LocationFixture.json", function (nockDone2) {
                        client.location(_.head(locations.data).id, function (err, resp) {
                            expect(err).not.exist;
                            isLocation(resp.data);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#Me", function () {
        it("should get information about the currently authorized user", function (done) {
            nockBack("MeFixture.json", function (nockDone) {
                client.currentAuthorizedUser(function (err, resp) {
                    expect(err).not.exist;
                    isAuthedUser(resp.data);
                    nockDone();
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=core.js.map