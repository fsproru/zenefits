"use strict";
exports.__esModule = true;
var _ = require("lodash");
var needle = require("needle");
var crypto = require("crypto");
var interfaces_1 = require("./interfaces");
var Zenefits = (function () {
    function Zenefits(opts) {
        this.access_token = opts.access_token;
        this.refresh_token = opts.refresh_token;
        this.client_id = opts.client_id;
        this.client_secret = opts.client_secret;
        this.credentialsRefreshed = false;
        this.runCollector = opts.runCollector ? opts.runCollector : true;
        this.autoPagination = opts.autoPagination ? opts.autoPagination : false;
        this.platformBaseUrl = opts.platformBaseUrl || "https://api.zenefits.com/platform";
        this.coreBaseUrl = opts.coreBaseUrl || "https://api.zenefits.com/core";
        this.secureBaseUrl = opts.secureBaseUrl || "https://secure.zenefits.com";
    }
    Zenefits.prototype._request = function (method, url, data, singleton, cb, pageCB) {
        var _this = this;
        var options = {
            headers: {
                Authorization: "Bearer " + this.access_token,
                "Content-Type": "application/json"
            },
            json: method === "post" ? true : false
        };
        if (method === "post") {
        }
        else {
            delete options.headers["Content-Type"];
        }
        var handleError = function (err, resp, body, cb) {
            err = {
                code: resp && resp.statusCode,
                message: resp && resp.statusMessage,
                url: url,
                error: err || (body && body.error)
            };
            cb(err);
        };
        var renewToken = function () {
            needle.post("https://secure.zenefits.com/oauth2/token/", "grant_type=" + interfaces_1.ZenefitsCore.GrantType.refresh_token.toString() + "&refresh_token=" + _this.refresh_token + "&client_id=" + _this.client_id + "&client_secret=" + _this.client_secret, {}, function (err, resp, body) {
                if (err || body.error) {
                    cb(err || body.error);
                }
                else {
                    _this.access_token = body.access_token;
                    _this.refresh_token = body.refresh_token;
                    _this.credentialsRefreshed = true;
                    _this._request(method, url, data, singleton, cb, pageCB);
                }
            });
        };
        var handleData = function (body, cb) {
            var data = _this.runCollector ? collector : (body.data.data ? body.data.data : body.data);
            var ret = {
                credentials: {
                    access_token: _this.access_token,
                    refresh_token: _this.refresh_token,
                    credentialsRefreshed: _this.credentialsRefreshed
                },
                data: singleton ? _.head(data) : data,
                next_url: body.data.next_url
            };
            cb(undefined, ret);
        };
        var handlePage = function (body, cb) {
            var ret = {
                credentials: {
                    access_token: _this.access_token,
                    refresh_token: _this.refresh_token,
                    credentialsRefreshed: _this.credentialsRefreshed
                },
                data: singleton ? _.head(body.data.data ? body.data.data : body.data) : body.data.data ? body.data.data : body.data,
                next_url: body.data.next_url
            };
            cb(undefined, ret);
        };
        var _req = function () {
            needle.request(method, url, data, options, function (err, resp, body) {
                if (resp && resp.statusCode === 401) {
                    renewToken();
                }
                else if (resp && resp.statusCode >= 400) {
                    handleError(err, resp, body, cb);
                }
                else if (body && body.data) {
                    if (_this.runCollector) {
                        collector = _.concat(collector, body.data.data ? body.data.data : body.data);
                    }
                    if (pageCB) {
                        handlePage(body, pageCB);
                    }
                    if (_this.autoPagination && body.data.next_url) {
                        url = body.data.next_url;
                        _req();
                    }
                    else {
                        handleData(body, cb);
                    }
                }
                else if (resp && resp.statusCode === 204) {
                    handleData({ data: {} }, cb);
                }
                else {
                    handleError(err, resp, body, cb);
                }
            });
        };
        var collector = [];
        _req();
    };
    Zenefits.prototype.fetchAccessToken = function (code, redirectUri, cb) {
        var body = {
            client_id: this.client_id,
            client_secret: this.client_secret,
            code: code,
            grant_type: interfaces_1.ZenefitsCore.GrantType.authorization_code.toString(),
            redirect_uri: redirectUri
        };
        needle.post(this.secureBaseUrl + "/oauth2/token/", body, {}, cb);
    };
    Zenefits.prototype.fetchResourceUrl = function (url, method, data, singleton, cb, pageCB) {
        if (method === void 0) { method = "get"; }
        if (data === void 0) { data = undefined; }
        if (singleton === void 0) { singleton = true; }
        return this._request(method, url, data, singleton, cb, pageCB);
    };
    Zenefits.prototype.core = function (type, id, singleton, cb, pageCB) {
        var url = this.coreBaseUrl + "/" + type + "/";
        if (!_.isUndefined(id)) {
            url += id;
        }
        ;
        this._request("get", url, undefined, singleton, cb, pageCB);
    };
    Zenefits.prototype.platform = function (method, type, id, data, singleton, cb, pageCB) {
        var url = this.platformBaseUrl + "/" + type + "/";
        switch (type) {
            case "company_field_changes":
                url = this.platformBaseUrl + "/company_installs/" + id + "/fields_changes/";
                break;
            case "installationStatus":
                url = this.platformBaseUrl + "/company_installs/" + id + "/status_changes/";
                break;
            case "flows":
                if (id) {
                    url = this.platformBaseUrl + "/person_subscriptions/" + id + "/flows/";
                }
                break;
            default:
                if (!_.isUndefined(id)) {
                    url += id;
                }
                ;
                break;
        }
        this._request(method, url, data, singleton, cb, pageCB);
    };
    Zenefits.prototype.companies = function (cb, pageCB) {
        this.core("companies", undefined, false, cb, pageCB);
    };
    Zenefits.prototype.company = function (companyId, cb, pageCB) {
        this.core("companies", companyId, true, cb, pageCB);
    };
    Zenefits.prototype.people = function (cb, pageCB) {
        this.core("people", undefined, false, cb, pageCB);
    };
    Zenefits.prototype.person = function (personId, cb, pageCB) {
        this.core("people", personId, true, cb, pageCB);
    };
    Zenefits.prototype.employments = function (cb, pageCB) {
        this.core("employments", undefined, false, cb, pageCB);
    };
    Zenefits.prototype.employment = function (employmentId, cb, pageCB) {
        this.core("employments", employmentId, true, cb, pageCB);
    };
    Zenefits.prototype.companyBankAccounts = function (cb, pageCB) {
        this.core("company_banks", undefined, false, cb, pageCB);
    };
    Zenefits.prototype.companyBankAccount = function (accountId, cb, pageCB) {
        this.core("company_banks", accountId, true, cb, pageCB);
    };
    Zenefits.prototype.employeeBankAccounts = function (cb, pageCB) {
        this.core("banks", undefined, false, cb, pageCB);
    };
    Zenefits.prototype.employeeBankAccount = function (accountId, cb, pageCB) {
        this.core("banks", accountId, true, cb, pageCB);
    };
    Zenefits.prototype.departments = function (cb, pageCB) {
        this.core("departments", undefined, false, cb, pageCB);
    };
    Zenefits.prototype.department = function (deptId, cb, pageCB) {
        this.core("departments", deptId, true, cb, pageCB);
    };
    Zenefits.prototype.locations = function (cb, pageCB) {
        this.core("locations", undefined, false, cb, pageCB);
    };
    Zenefits.prototype.location = function (locId, cb, pageCB) {
        this.core("locations", locId, true, cb, pageCB);
    };
    Zenefits.prototype.currentAuthorizedUser = function (cb, pageCB) {
        this.core("me", undefined, true, cb, pageCB);
    };
    Zenefits.prototype.applications = function (cb, pageCB) {
        this.platform("get", "applications", undefined, undefined, false, cb, pageCB);
    };
    Zenefits.prototype.application = function (applicationId, cb, pageCB) {
        this.platform("get", "applications", applicationId, undefined, true, cb, pageCB);
    };
    Zenefits.prototype.setInstallationCustomFields = function (fields, cb, pageCB) {
        var _this = this;
        console.log(this.installId);
        if (this.installId) {
            this.platform("post", "company_field_changes", this.installId, fields, false, cb, pageCB);
        }
        else {
            this.installations(function (err, installations) {
                if (err) {
                    cb(err);
                }
                else {
                    console.log(installations);
                    _this.installId = _.head(installations.data).id;
                    _this.platform("post", "company_field_changes", _this.installId, fields, false, cb, pageCB);
                }
            });
        }
    };
    Zenefits.prototype.installations = function (cb, pageCB) {
        this.platform("get", "company_installs", undefined, undefined, false, cb, pageCB);
    };
    Zenefits.prototype.installation = function (installId, cb, pageCB) {
        this.platform("get", "company_installs", installId, undefined, true, cb, pageCB);
    };
    Zenefits.prototype.personSubscriptions = function (cb, pageCB) {
        this.platform("get", "person_subscriptions", undefined, undefined, false, cb, pageCB);
    };
    Zenefits.prototype.personSubscription = function (subscriptionId, cb, pageCB) {
        this.platform("get", "person_subscriptions", subscriptionId, undefined, true, cb, pageCB);
    };
    Zenefits.prototype.setInstallationStatusOk = function (cb, pageCB) {
        var _this = this;
        if (this.installId) {
            this.platform("post", "installationStatus", this.installId, { status: "ok" }, false, cb, pageCB);
        }
        else {
            this.installations(function (err, installations) {
                if (err) {
                    cb(err);
                }
                else {
                    _this.installId = _.head(installations.data).id;
                    _this.platform("post", "installationStatus", _this.installId, { status: "ok" }, false, cb, pageCB);
                }
            });
        }
    };
    Zenefits.prototype.setInstallationStatusNotEnrolled = function (cb, pageCB) {
        var _this = this;
        if (this.installId) {
            this.platform("post", "installationStatus", this.installId, { status: "not_enrolled" }, false, cb, pageCB);
        }
        else {
            this.installations(function (err, installations) {
                if (err) {
                    cb(err);
                }
                else {
                    _this.installId = _.head(installations.data).id;
                    _this.platform("post", "installationStatus", _this.installId, { status: "not_enrolled" }, false, cb, pageCB);
                }
            });
        }
    };
    Zenefits.prototype.allFlows = function (cb, pageCB) {
        this.platform("get", "flows", undefined, undefined, false, cb, pageCB);
    };
    Zenefits.prototype.individualFlows = function (personSubscriptionId, cb, pageCB) {
        this.platform("get", "flows", personSubscriptionId, undefined, false, cb, pageCB);
    };
    Zenefits.prototype.authenticateEvent = function (payload, headers, cb, pageCB) {
        var hmac = crypto.createHmac("sha256", this.client_secret);
        hmac.update(JSON.stringify(payload));
        var result = hmac.digest("hex");
        if (result === headers.signature) {
            cb(undefined, payload);
        }
        else {
            cb({
                code: 301,
                signature: headers.signature,
                event: payload,
                error: "UNAUTHORIZED EVENT"
            });
        }
    };
    return Zenefits;
}());
exports.Zenefits = Zenefits;
//# sourceMappingURL=zenefits.js.map