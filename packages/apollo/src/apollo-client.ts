import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  throttleKy,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import pThrottle from 'p-throttle';
import { z } from 'zod';

export namespace apollo {
  export const API_BASE_URL = 'https://api.apollo.io';

  // Allow up to 5 requests per second by default.
  // https://docs.apollo.io/reference/rate-limits
  export const throttle = pThrottle({
    limit: 5,
    interval: 1000,
  });

  export const enrichPersonSchema = z.object({
    first_name: z.string().optional().describe('First name of the person'),
    last_name: z.string().optional().describe('Last name of the person'),
    name: z.string().optional().describe('Full name of the person'),
    email: z.string().optional().describe('Email address of the person'),
    hashed_email: z
      .string()
      .optional()
      .describe('MD5 hash of the email address'),
    organization_name: z
      .string()
      .optional()
      .describe('Name of the organization the person belongs to'),
    domain: z.string().optional().describe('Domain of the organization'),
    id: z.string().optional().describe('Apollo ID of the person'),
    linkedin_url: z.string().optional().describe('LinkedIn URL of the person'),
    reveal_personal_emails: z
      .boolean()
      .optional()
      .describe('Whether to reveal personal emails'),
    reveal_phone_number: z
      .boolean()
      .optional()
      .describe('Whether to reveal phone numbers'),
    webhook_url: z
      .string()
      .optional()
      .describe('Webhook URL to receive the enrichment result'),
  });

  export type EnrichPersonOptions = z.infer<typeof enrichPersonSchema>;

  export const typedCustomFieldsSchema = z
    .object({})
    .describe('Custom fields for the contact');
  export type TypedCustomFields = z.infer<typeof typedCustomFieldsSchema>;

  export const contactEmailSchema = z.object({
    email: z.string().describe('Email address'),
    email_md5: z.string().describe('MD5 hash of the email'),
    email_sha256: z.string().describe('SHA256 hash of the email'),
    email_status: z
      .string()
      .describe('Status of the email (e.g., valid, invalid)'),
    email_source: z.any().describe('Source of the email information'),
    extrapolated_email_confidence: z
      .any()
      .describe('Confidence level for extrapolated emails'),
    position: z.number().describe('Position/order of this email in the list'),
    email_from_customer: z
      .any()
      .describe('Whether the email was provided by a customer'),
    free_domain: z
      .boolean()
      .describe('Whether the email is from a free domain'),
  });
  export type ContactEmail = z.infer<typeof contactEmailSchema>;

  export const dialerFlagsSchema = z.object({
    country_name: z.string().describe('Name of the country'),
    country_enabled: z
      .boolean()
      .describe('Whether calling is enabled for this country'),
    high_risk_calling_enabled: z
      .boolean()
      .describe('Whether high-risk calling is enabled'),
    potential_high_risk_number: z
      .boolean()
      .describe('Whether this number is potentially high risk'),
  });
  export type DialerFlags = z.infer<typeof dialerFlagsSchema>;

  export const phoneNumberSchema = z.object({
    raw_number: z.string().describe('Raw phone number as entered'),
    sanitized_number: z.string().describe('Sanitized/formatted phone number'),
    type: z.any().describe('Type of phone number (e.g., mobile, work)'),
    position: z
      .number()
      .describe('Position/order of this phone number in the list'),
    status: z.string().describe('Status of the phone number'),
    dnc_status: z.any().describe('Do Not Call status'),
    dnc_other_info: z.any().describe('Additional Do Not Call information'),
    dialer_flags: dialerFlagsSchema
      .optional()
      .describe('Flags related to dialing this number'),
  });
  export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

  export const primaryPhoneSchema = z
    .object({})
    .describe('Primary phone information');
  export type PrimaryPhone = z.infer<typeof primaryPhoneSchema>;

  export const industryTagHashSchema = z
    .record(z.string())
    .describe('Industry tags with their IDs');
  export type IndustryTagHash = z.infer<typeof industryTagHashSchema>;

  export const fundingEventSchema = z.object({
    id: z.string().describe('ID of the funding event'),
    date: z.string().describe('Date of the funding event'),
    news_url: z
      .string()
      .optional()
      .describe('URL to news about the funding event'),
    type: z.string().describe('Type of funding (e.g., Series A, Seed)'),
    investors: z.string().describe('Investors participating in the funding'),
    amount: z.string().describe('Amount raised in the funding round'),
    currency: z.string().describe('Currency of the funding amount'),
  });
  export type FundingEvent = z.infer<typeof fundingEventSchema>;

  export const currentTechnologySchema = z.object({
    uid: z.string().describe('Unique identifier for the technology'),
    name: z.string().describe('Name of the technology'),
    category: z.string().describe('Category of the technology'),
  });
  export type CurrentTechnology = z.infer<typeof currentTechnologySchema>;

  export const employmentHistorySchema = z.object({
    _id: z.string().describe('Internal ID of the employment history entry'),
    id: z.string().describe('Public ID of the employment history entry'),
    created_at: z
      .string()
      .nullable()
      .describe('Date when the entry was created'),
    updated_at: z
      .string()
      .nullable()
      .describe('Date when the entry was last updated'),
    title: z.string().describe('Job title'),
    key: z.string().describe('Unique key for the employment history entry'),
    current: z.boolean().describe('Whether this is the current employment'),
    degree: z.string().nullable().describe('Educational degree if applicable'),
    description: z
      .string()
      .nullable()
      .describe('Description of the role or education'),
    emails: z.any().describe('Email addresses associated with this employment'),
    end_date: z.string().optional().describe('End date of the employment'),
    grade_level: z
      .string()
      .nullable()
      .describe('Academic grade level if applicable'),
    kind: z
      .string()
      .nullable()
      .describe('Kind of history entry (employment, education)'),
    major: z.string().nullable().describe('Academic major if applicable'),
    organization_id: z
      .string()
      .nullable()
      .optional()
      .describe('ID of the organization'),
    organization_name: z
      .string()
      .nullable()
      .describe('Name of the organization'),
    raw_address: z
      .string()
      .nullable()
      .describe('Raw address of the organization'),
    start_date: z.string().describe('Start date of the employment'),
  });
  export type EmploymentHistory = z.infer<typeof employmentHistorySchema>;

  export const organizationSchema = z.object({
    id: z.string().describe('ID of the organization'),
    name: z.string().describe('Name of the organization'),
    website_url: z.string().describe("URL of the organization's website"),
    blog_url: z.any().describe("URL of the organization's blog"),
    angellist_url: z.any().describe('AngelList URL of the organization'),
    linkedin_url: z.string().describe('LinkedIn URL of the organization'),
    twitter_url: z.string().describe('Twitter URL of the organization'),
    facebook_url: z.string().describe('Facebook URL of the organization'),
    primary_phone: primaryPhoneSchema.describe(
      'Primary phone of the organization',
    ),
    languages: z.array(z.any()).describe('Languages used by the organization'),
    alexa_ranking: z.number().describe('Alexa website ranking'),
    phone: z.any().describe('Phone number of the organization'),
    linkedin_uid: z.string().describe('LinkedIn unique identifier'),
    founded_year: z.number().describe('Year the organization was founded'),
    publicly_traded_symbol: z.any().describe('Stock symbol if publicly traded'),
    publicly_traded_exchange: z
      .any()
      .describe('Stock exchange if publicly traded'),
    logo_url: z.string().describe("URL to the organization's logo"),
    crunchbase_url: z.any().describe('Crunchbase URL of the organization'),
    primary_domain: z.string().describe('Primary domain of the organization'),
    industry: z.string().describe('Primary industry of the organization'),
    keywords: z
      .array(z.string())
      .describe('Keywords associated with the organization'),
    estimated_num_employees: z
      .number()
      .describe('Estimated number of employees'),
    industries: z
      .array(z.string())
      .describe('Industries the organization operates in'),
    secondary_industries: z.array(z.any()).describe('Secondary industries'),
    snippets_loaded: z
      .boolean()
      .describe('Whether snippets about the organization are loaded'),
    industry_tag_id: z.string().describe('ID of the primary industry tag'),
    industry_tag_hash: industryTagHashSchema.describe(
      'Industry tags with their IDs',
    ),
    retail_location_count: z.number().describe('Number of retail locations'),
    raw_address: z.string().describe('Raw address of the organization'),
    street_address: z.string().describe('Street address of the organization'),
    city: z.string().describe('City where the organization is located'),
    state: z
      .string()
      .describe('State/province where the organization is located'),
    postal_code: z.string().describe('Postal code of the organization'),
    country: z.string().describe('Country where the organization is located'),
    owned_by_organization_id: z
      .any()
      .describe('ID of the parent organization if applicable'),
    seo_description: z.string().describe('SEO description of the organization'),
    short_description: z
      .string()
      .describe('Short description of the organization'),
    suborganizations: z
      .array(z.any())
      .describe('Suborganizations or divisions'),
    num_suborganizations: z.number().describe('Number of suborganizations'),
    annual_revenue_printed: z
      .string()
      .describe('Annual revenue in human-readable format'),
    annual_revenue: z.number().describe('Annual revenue as a number'),
    total_funding: z.number().describe('Total funding received'),
    total_funding_printed: z
      .string()
      .describe('Total funding in human-readable format'),
    latest_funding_round_date: z
      .string()
      .describe('Date of the latest funding round'),
    latest_funding_stage: z
      .string()
      .describe('Stage of the latest funding round'),
    funding_events: z
      .array(fundingEventSchema)
      .describe('List of funding events'),
    technology_names: z
      .array(z.string())
      .describe('Names of technologies used'),
    current_technologies: z
      .array(currentTechnologySchema)
      .describe('Current technologies in use'),
    org_chart_root_people_ids: z
      .array(z.string())
      .describe('IDs of people at the top of the org chart'),
    org_chart_sector: z.string().describe('Sector in the organizational chart'),
    org_chart_removed: z
      .boolean()
      .describe('Whether the org chart has been removed'),
    org_chart_show_department_filter: z
      .boolean()
      .describe('Whether to show department filter in org chart'),
  });
  export type Organization = z.infer<typeof organizationSchema>;

  export const contactSchema = z.object({
    contact_roles: z.array(z.any()).describe('Roles of the contact'),
    id: z.string().describe('ID of the contact'),
    first_name: z.string().describe('First name of the contact'),
    last_name: z.string().describe('Last name of the contact'),
    name: z.string().describe('Full name of the contact'),
    linkedin_url: z.string().describe('LinkedIn URL of the contact'),
    title: z.string().describe('Job title of the contact'),
    contact_stage_id: z.string().describe("ID of the contact's stage"),
    owner_id: z.any().describe('ID of the contact owner'),
    creator_id: z.string().describe('ID of who created the contact'),
    person_id: z.string().describe('ID of the person this contact represents'),
    email_needs_tickling: z.any().describe('Whether email needs tickling'),
    organization_name: z.string().describe('Name of the organization'),
    source: z.string().describe('Source of the contact information'),
    original_source: z.string().describe('Original source of the contact'),
    organization_id: z.string().describe('ID of the organization'),
    headline: z.string().describe('Headline or short description'),
    photo_url: z.any().describe("URL to the contact's photo"),
    present_raw_address: z.string().describe('Raw current address'),
    linkedin_uid: z.any().describe('LinkedIn unique identifier'),
    extrapolated_email_confidence: z
      .any()
      .describe('Confidence level for extrapolated emails'),
    salesforce_id: z.any().describe('Salesforce ID if integrated'),
    salesforce_lead_id: z.any().describe('Salesforce lead ID if integrated'),
    salesforce_contact_id: z
      .any()
      .describe('Salesforce contact ID if integrated'),
    salesforce_account_id: z
      .any()
      .describe('Salesforce account ID if integrated'),
    crm_owner_id: z.any().describe('ID of the owner in CRM'),
    created_at: z.string().describe('Date when the contact was created'),
    emailer_campaign_ids: z
      .array(z.any())
      .describe('IDs of email campaigns this contact is part of'),
    direct_dial_status: z.any().describe('Status of direct dial'),
    direct_dial_enrichment_failed_at: z
      .any()
      .describe('When direct dial enrichment failed'),
    email_status: z.string().describe('Status of the email address'),
    email_source: z.any().describe('Source of the email information'),
    account_id: z.string().describe('ID of the account'),
    last_activity_date: z.any().describe('Date of the last activity'),
    hubspot_vid: z.any().describe('HubSpot visitor ID if integrated'),
    hubspot_company_id: z.any().describe('HubSpot company ID if integrated'),
    crm_id: z.any().describe('ID in the CRM system'),
    sanitized_phone: z.string().describe('Sanitized phone number'),
    merged_crm_ids: z.any().describe('Merged CRM IDs'),
    updated_at: z.string().describe('Date when the contact was last updated'),
    queued_for_crm_push: z.any().describe('Whether queued for CRM push'),
    suggested_from_rule_engine_config_id: z
      .any()
      .describe('ID of rule engine config that suggested this contact'),
    email_unsubscribed: z
      .any()
      .describe('Whether the contact unsubscribed from emails'),
    label_ids: z
      .array(z.any())
      .describe('IDs of labels applied to the contact'),
    has_pending_email_arcgate_request: z
      .boolean()
      .describe("Whether there's a pending email validation request"),
    has_email_arcgate_request: z
      .boolean()
      .describe("Whether there's an email validation request"),
    existence_level: z.string().describe('Level of existence confirmation'),
    email: z.string().describe('Email address'),
    email_from_customer: z
      .boolean()
      .describe('Whether the email was provided by a customer'),
    typed_custom_fields: typedCustomFieldsSchema.describe(
      'Custom fields with typed values',
    ),
    custom_field_errors: z.any().describe('Errors in custom fields'),
    crm_record_url: z.any().describe('URL to the CRM record'),
    email_status_unavailable_reason: z
      .any()
      .describe('Reason email status is unavailable'),
    email_true_status: z.string().describe('True status of the email'),
    updated_email_true_status: z
      .boolean()
      .describe('Whether email true status was updated'),
    contact_rule_config_statuses: z
      .array(z.any())
      .describe('Statuses of contact rule configs'),
    source_display_name: z
      .string()
      .describe('Display name of the contact source'),
    contact_emails: z
      .array(contactEmailSchema)
      .describe('Email addresses associated with the contact'),
    time_zone: z.string().describe('Time zone of the contact'),
    phone_numbers: z
      .array(phoneNumberSchema)
      .describe('Phone numbers of the contact'),
    account_phone_note: z.any().describe('Notes about account phone'),
    free_domain: z
      .boolean()
      .describe('Whether the email is from a free domain'),
    is_likely_to_engage: z
      .boolean()
      .describe('Whether the contact is likely to engage'),
  });
  export type Contact = z.infer<typeof contactSchema>;

  export const personSchema = z.object({
    id: z.string().describe('ID of the person'),
    first_name: z.string().describe('First name of the person'),
    last_name: z.string().describe('Last name of the person'),
    name: z.string().describe('Full name of the person'),
    linkedin_url: z.string().describe('LinkedIn URL of the person'),
    title: z.string().describe('Job title of the person'),
    email_status: z.string().describe('Status of the email address'),
    photo_url: z.string().describe("URL to the person's photo"),
    twitter_url: z.any().describe('Twitter URL of the person'),
    github_url: z.any().describe('GitHub URL of the person'),
    facebook_url: z.any().describe('Facebook URL of the person'),
    extrapolated_email_confidence: z
      .any()
      .describe('Confidence level for extrapolated emails'),
    headline: z.string().describe('Headline or short description'),
    email: z.string().describe('Email address'),
    organization_id: z.string().describe('ID of the organization'),
    employment_history: z
      .array(employmentHistorySchema)
      .describe('Employment history of the person'),
    state: z.string().describe('State/province where the person is located'),
    city: z.string().describe('City where the person is located'),
    country: z.string().describe('Country where the person is located'),
    contact_id: z.string().describe('ID of the associated contact'),
    contact: contactSchema.describe('Contact information of the person'),
    revealed_for_current_team: z
      .boolean()
      .describe('Whether revealed for current team'),
    organization: organizationSchema.describe(
      'Organization the person belongs to',
    ),
    is_likely_to_engage: z
      .boolean()
      .describe('Whether the person is likely to engage'),
    intent_strength: z.any().describe('Strength of intent signals'),
    show_intent: z.boolean().describe('Whether to show intent data'),
    departments: z
      .array(z.string())
      .describe('Departments the person belongs to'),
    subdepartments: z
      .array(z.string())
      .describe('Subdepartments the person belongs to'),
    functions: z.array(z.string()).describe('Functions or roles of the person'),
    seniority: z.string().describe('Seniority level of the person'),
  });
  export type Person = z.infer<typeof personSchema>;

  export const enrichPersonResponseSchema = z.object({
    person: personSchema.describe('Enriched person data'),
  });
  export type EnrichPersonResponse = z.infer<typeof enrichPersonResponseSchema>;
}

/**
 * Apollo.io is a B2B person and company enrichment API.
 *
 * @see https://docs.apollo.io
 */
export class ApolloClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiKey: string;
  protected readonly apiBaseUrl: string;

  constructor({
    apiKey = getEnv('APOLLO_API_KEY'),
    apiBaseUrl = apollo.API_BASE_URL,
    timeoutMs = 60_000,
    throttle = true,
    ky = defaultKy,
  }: {
    apiKey?: string;
    apiBaseUrl?: string;
    timeoutMs?: number;
    throttle?: boolean;
    ky?: KyInstance;
  } = {}) {
    assert(
      apiKey,
      `ApolloClient missing required "username" (defaults to "APOLLO_API_KEY")`,
    );
    super();

    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl;

    const throttledKy = throttle ? throttleKy(ky, apollo.throttle) : ky;

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        'x-api-key': apiKey,
      },
    });
  }

  /**
   * Attempts to enrich a person with Apollo data.
   *
   * Apollo relies on the information you pass via the endpoint's parameters to identify the correct person to enrich. If you provide more information about a person, Apollo is more likely to find a match within its database. If you only provide general information, such as a name without a domain or email address, you might receive a 200 response, but the response will indicate that no records have been enriched.
   *
   * By default, this endpoint does not return personal emails or phone numbers. Use the reveal_personal_emails and reveal_phone_number parameters to retrieve emails and phone numbers.
   */
  @aiFunction({
    name: 'apollo_enrich_person',
    description: `Attempts to enrich a person with Apollo data.

Apollo relies on the information you pass via the endpoint's parameters to identify the correct person to enrich. If you provide more information about a person, Apollo is more likely to find a match within its database. If you only provide general information, such as a name without a domain or email address, you might receive a 200 response, but the response will indicate that no records have been enriched.

By default, this endpoint does not return personal emails or phone numbers. Use the reveal_personal_emails and reveal_phone_number parameters to retrieve emails and phone numbers.`,
    inputSchema: apollo.enrichPersonSchema,
  })
  async enrichPerson(opts: apollo.EnrichPersonOptions) {
    return this.ky
      .post('api/v1/people/match', { json: opts })
      .json<apollo.EnrichPersonResponse>();
  }
}
