export namespace ZenefitsCore {
  export interface Company {
    name: string;
    object: string;
    id: string;
    people: Reference[];
    url: string;
    logo_url: string;
  }
  export interface AccessToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }
  export interface AccessTokenRequestBody {
    client_id: string;
    client_secret: string;
    code: string;
    grant_type: string;
    redirect_uri: string;
  }
  export enum GrantType {
    refresh_token = "refresh_token",
    authorization_code = "authorization_code",
  }
  export interface Person {
    banks: Reference;
    city: string;
    company: Reference;
    country: string;
    date_of_birth: string;
    department: Reference;
    employments: Reference;
    first_name: string;
    preferred_name: string;
    object: string;
    id: string;
    last_name: string;
    location: Reference;
    manager: Reference;
    postal_code: string;
    state: string;
    status: string;
    street1: string;
    street2: string;
    subordinates: Reference;
    title: string;
    work_email: string;
    personal_email: string;
    work_phone: string;
    personal_phone: string;
    gender: string;
    social_security_number: string;
  }
  // enum Status {
  //   active,
  //   terminated,
  //   leave_of_absence,
  //   requested,
  //   setup,
  //   deleted
  // }
  // enum Gender {
  //   F,
  //   M
  // }
  export interface Employment {
    person: Reference;
    hire_date: string;
    object: string;
    id: string;
    termination_date: string;
    termination_type: string;
    employment_type: string;
    comp_type: string;
    annual_salary: number;
    pay_rate: number;
    working_hours_per_week: number;
  }
  // enum TerminationType {
  //   involuntary,
  //   regretted,
  //   non_regretted,
  //   unclassified,
  //   never_started
  // }
  // enum EmploymentType {
  //   full_time,
  //   part_time,
  //   temporary,
  //   casual,
  //   contract,
  //   labor_hire
  // }
  // enum CompType {
  //   salary,
  //   hourly
  // }
  export interface CompanyBankAccount {
    company: Reference;
    account_type: string;
    account_number: number;
    routing_number: number;
    bank_name: string;
    object: string;
    id: string;
  }
  // enum AccountType {
  //   checking,
  //   savings
  // }
  export interface Reference {
    url: string;
    object: string;
    ref_object: string;
  }
  export interface EmployeeBankAccount {
    person: Reference;
    account_type: string;
    account_number: number;
    routing_number: number;
    bank_name: string;
    object: string;
    id: string;
  }
  export interface Department {
    id: string;
    name: string;
    people: Reference;
    company: Reference;
    object: string;
  }
  export interface Location {
    id: string;
    object: string;
    city: string;
    company: Reference;
    country: string;
    name: string;
    people: Reference;
    state: string;
    street1: string;
    street2: string;
    zip: string;
  }
  export interface AuthorizedUser {
    id: string;
    object: string;
    company: Reference;
    person: Reference;
    scopes: string[],
    expires: string;
    uninstalled: string;

  }

  // enum Scope {
  //   platform,
  //   companies,
  //   companies.legal_name,
  //   companies.ein,
  //   companies.legal_address,
  //   locations,
  //   departments,
  //   people,
  //   people.work_email,
  //   people.personal_email,
  //   people.work_phone,
  //   people.personal_phone,
  //   people.date_of_birth,
  //   people.home_address,
  //   people.status,
  //   people.location,
  //   people.department,
  //   people.manager,
  //   people.social_security_number,
  //   people.gender,
  //   employments,
  //   employments.employment_type,
  //   employments.termination_type,
  //   employments.compensation,
  //   banks,
  //   company_banks
  // }
}

export interface Response {
  credentials: any;
  data: any;
}

export declare namespace ZenefitsPlatform {
  export interface Installation {
    url: string,
    fields: any,
    company: ZenefitsCore.Reference,
    object: string,
    application: ZenefitsCore.Reference,
    person_subscriptions: ZenefitsCore.Reference,
    id: string
  }
  export interface Application {
    url: string,
    fields: any,
    object: string,
    id: string
  }
  export interface PersonSubscription {
    fields: any,
    company_install: ZenefitsCore.Reference,
    person: ZenefitsCore.Reference,
    flows: ZenefitsCore.Reference,
    status: ZenefitsCore.Reference,
    object: string,
    id: string
  }
  export interface Flow {
    fields: any,
    company: ZenefitsCore.Reference,
    company_install: ZenefitsCore.Reference,
    application: ZenefitsCore.Reference,
    person: ZenefitsCore.Reference,
    person_subscriptions: ZenefitsCore.Reference,
    type: string,
    object: string,
    id: string
  }
}