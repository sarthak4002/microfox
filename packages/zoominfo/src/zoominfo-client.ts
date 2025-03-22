import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  throttleKy,
} from '@microfox/core';
import { KJUR } from 'jsrsasign';
import defaultKy, { type KyInstance } from 'ky';
import pThrottle from 'p-throttle';
import { z } from 'zod';

export namespace zoominfo {
  export const API_BASE_URL = 'https://api.zoominfo.com';

  // Access tokens expire after 60 minutes, so renew them every 57 minutes.
  export const ACCESS_TOKEN_EXPIRATION_MS = 57 * 60 * 1000;

  // Allow up to 1500 requests per minute by default.
  // https://api-docs.zoominfo.com/#rate-and-usage-limits
  export const throttle = pThrottle({
    limit: 1500,
    interval: 60_000,
  });

  export const EnrichContactOptionsSchema = z.object({
    personId: z.string().optional().describe('ZoomInfo identifier for a person'),
    emailAddress: z.string().optional().describe('Email address for contact lookup'),
    hashedEmail: z.string().optional().describe('Hashed email value for contact lookup'),
    phone: z.string().optional().describe('Phone number for contact lookup'),
    firstName: z.string().optional().describe('First name of the contact'),
    lastName: z.string().optional().describe('Last name of the contact'),
    companyId: z.string().optional().describe('ZoomInfo company identifier'),
    companyName: z.string().optional().describe('Company name for contact lookup'),
    fullName: z.string().optional().describe('Full name of the contact'),
    jobTitle: z.string().optional().describe('Contact job title'),
    externalURL: z.string().optional().describe('External URL for the contact'),
    lastUpdatedDateAfter: z.string().optional().describe('Filter for contacts updated after this date'),
    validDateAfter: z.string().optional().describe('Filter for contacts valid after this date'),
    contactAccuracyScoreMin: z.number().optional().describe('Minimum accuracy score for contact'),
    outputFields: z.array(z.string()).optional().describe('Specific fields to return in the response')
  });
  export type EnrichContactOptions = z.infer<typeof EnrichContactOptionsSchema>;

  export const EnrichCompanyOptionsSchema = z.object({
    companyId: z.string().optional().describe('Unique ZoomInfo identifier for a company'),
    companyName: z.string().optional().describe('Company name'),
    companyWebsite: z.string().optional().describe('Company website URL in http://www.example.com format'),
    companyTicker: z.string().optional().describe('Company stock ticker symbol'),
    companyPhone: z.string().optional().describe('Phone number of the company headquarters'),
    companyFax: z.string().optional().describe('Fax number of the company headquarters'),
    companyStreet: z.string().optional().describe('Street address for the company\'s primary address'),
    companyCity: z.string().optional().describe('City for the company\'s primary address'),
    companyState: z.string().optional().describe('Company state (U.S.) or province (Canada)'),
    companyZipCode: z.string().optional().describe('Zip Code or Postal Code for the company\'s primary address'),
    companyCountry: z.string().optional().describe('Country for the company\'s primary address'),
    ipAddress: z.string().optional().describe('IP address associated with the company'),
    outputFields: z.array(z.string()).optional().describe('List of fields to return in the response')
  });
  export type EnrichCompanyOptions = z.infer<typeof EnrichCompanyOptionsSchema>;

  export const MatchStatusSchema = z.enum([
    'NO_MATCH',
    'FULL_MATCH', 
    'CONTACT_ONLY_MATCH',
    'COMPANY_ONLY_MATCH', 
    'MULTI_MATCH',
    'IP_MATCH',
    'MULTI_CONTACT_MATCH',
    'MULTI_COMPANY_MATCH',
    'SERVICE_ERROR',
    'BAD_DATA'
  ]).describe('Status of the matching process');
  export type MatchStatus = z.infer<typeof MatchStatusSchema>;

  // Forward declare EnrichContactResultSchema to avoid circular reference
  export let EnrichContactResultSchema: z.ZodType<any>;
  // Forward declare EnrichCompanyResultSchema to avoid circular reference
  export let EnrichCompanyResultSchema: z.ZodType<any>;

  export const JobFunctionSchema = z.object({
    name: z.string().describe('Name of the job function'),
    department: z.string().describe('Department associated with the job function')
  });
  export type JobFunction = z.infer<typeof JobFunctionSchema>;

  export const EducationDegreeSchema = z.object({
    degree: z.string().describe('Degree earned'),
    areaOfStudy: z.string().describe('Area or field of study')
  });
  export type EducationDegree = z.infer<typeof EducationDegreeSchema>;

  export const EducationSchema = z.object({
    school: z.string().describe('Educational institution attended'),
    educationDegree: EducationDegreeSchema.describe('Degree information')
  });
  export type Education = z.infer<typeof EducationSchema>;

  export const ExternalUrlSchema = z.object({
    type: z.string().describe('Type of external URL (e.g., LinkedIn, Twitter)'),
    url: z.string().describe('URL to external profile')
  });
  export type ExternalUrl = z.infer<typeof ExternalUrlSchema>;

  export const EmploymentHistoryCompanySchema = z.object({
    companyId: z.number().describe('ZoomInfo identifier for the company'),
    companyName: z.string().describe('Name of the company'),
    companyPhone: z.string().optional().describe('Phone number of the company'),
    companyWebsite: z.string().optional().describe('Website of the company')
  });

  export const EmploymentHistorySchema = z.object({
    jobTitle: z.string().describe('Job title at the company'),
    managementLevel: z.array(z.string()).describe('Management level(s) at the company'),
    fromDate: z.string().describe('Start date of employment'),
    toDate: z.string().describe('End date of employment'),
    company: EmploymentHistoryCompanySchema.describe('Company information')
  });
  export type EmploymentHistory = z.infer<typeof EmploymentHistorySchema>;

  export const DescriptionListSchema = z.object({
    description: z.string().describe('Company description text')
  });
  export type DescriptionList = z.infer<typeof DescriptionListSchema>;

  export const CodeSchema = z.object({
    id: z.string().describe('Code identifier'),
    name: z.string().describe('Code name or description')
  });
  export type Code = z.infer<typeof CodeSchema>;

  export const CompanySchema = z.object({
    id: z.number().describe('ZoomInfo unique identifier for the company'),
    name: z.string().describe('Name of the company'),
    type: z.string().describe('Type of company'),
    division: z.string().describe('Division of the company'),
    descriptionList: z.array(DescriptionListSchema).describe('List of company descriptions'),
    phone: z.string().describe('Phone number of the company headquarters'),
    fax: z.string().describe('Fax number of the company headquarters'),
    street: z.string().describe('Street of the company primary address'),
    city: z.string().describe('City of the company primary address'),
    state: z.string().describe('State or province of the company'),
    zipCode: z.string().describe('Zip or postal code of the company primary address'),
    country: z.string().describe('Country of the company primary address'),
    logo: z.string().describe('URL to company logo'),
    sicCodes: z.array(CodeSchema).describe('SIC (Standard Industrial Classification) codes'),
    naicsCodes: z.array(CodeSchema).describe('NAICS (North American Industry Classification System) codes'),
    website: z.string().describe('Website URL of the company'),
    revenue: z.string().describe('Annual revenue of the company'),
    revenueNumeric: z.number().describe('Annual revenue as a numeric value'),
    employeeCount: z.number().describe('Number of employees at the company'),
    ticker: z.string().describe('Stock ticker symbol of the company'),
    ranking: z.array(z.string()).describe('Company rankings'),
    socialMediaUrls: z.array(z.any()).describe('Social media URLs for the company'),
    primaryIndustry: z.array(z.string()).describe('Primary industry classifications'),
    industries: z.array(z.string()).describe('Industries the company operates in'),
    revenueRange: z.string().describe('Range of the company revenue'),
    employeeRange: z.string().describe('Range of the company employee count')
  });
  export type Company = z.infer<typeof CompanySchema>;

  export const EnrichedContactSchema = z.object({
    id: z.number().describe('ZoomInfo unique identifier for the contact'),
    firstName: z.string().describe('First name of the contact'),
    middleName: z.string().describe('Middle name of the contact'),
    lastName: z.string().describe('Last name of the contact'),
    email: z.string().describe('Email address of the contact'),
    hasCanadianEmail: z.string().describe('Whether the contact has a Canadian email address'),
    phone: z.string().describe('Phone number of the contact'),
    directPhoneDoNotCall: z.boolean().describe('Indicates if direct phone is on a do-not-call list'),
    street: z.string().describe('Street address of the contact'),
    city: z.string().describe('City of the contact'),
    region: z.string().describe('Region where the contact is located'),
    metroArea: z.string().describe('Metropolitan area of the contact'),
    zipCode: z.string().describe('Zip or postal code of the contact'),
    state: z.string().describe('State or province of the contact'),
    country: z.string().describe('Country of the contact'),
    personHasMoved: z.string().describe('Indicates if the person has recently moved'),
    withinEu: z.boolean().describe('Whether the contact is within the European Union'),
    withinCalifornia: z.boolean().describe('Whether the contact is within California'),
    withinCanada: z.boolean().describe('Whether the contact is within Canada'),
    lastUpdatedDate: z.string().describe('Date the contact information was last updated'),
    noticeProvidedDate: z.string().describe('Date notice was provided to the contact'),
    salutation: z.string().describe('Formal greeting/title of the contact'),
    suffix: z.string().describe('Name suffix of the contact'),
    jobTitle: z.string().describe('Job title of the contact'),
    jobFunction: z.array(JobFunctionSchema).describe('Job functions of the contact'),
    education: z.array(EducationSchema).describe('Educational background of the contact'),
    hashedEmails: z.array(z.string()).describe('Hashed email addresses for the contact'),
    picture: z.string().describe('URL to a picture of the contact'),
    mobilePhoneDoNotCall: z.boolean().describe('Indicates if mobile phone is on a do-not-call list'),
    externalUrls: z.array(ExternalUrlSchema).describe('URLs to external profiles'),
    contactAccuracyScore: z.number().describe('Accuracy score for the contact data'),
    isDefunct: z.boolean().describe('Whether the contact is defunct'),
    employmentHistory: z.array(EmploymentHistorySchema).describe('Employment history of the contact'),
    managementLevel: z.array(z.string()).describe('Management level(s) of the contact'),
    locationCompanyId: z.number().describe('ID of the company location'),
    company: CompanySchema.describe('Current company information')
  });
  export type EnrichedContact = z.infer<typeof EnrichedContactSchema>;

  export const EnrichContactResponseSchema = z.object({
    success: z.boolean().describe('Indicates if the request was successful'),
    data: z.object({
      outputFields: z.array(z.array(z.string())).describe('Output fields returned in the response'),
      result: z.array(z.lazy(() => EnrichContactResultSchema)).describe('Results of the contact enrichment')
    }).describe('Response data')
  });
  export type EnrichContactResponse = z.infer<typeof EnrichContactResponseSchema>;

  // Define EnrichContactResultSchema after EnrichedContactSchema
  EnrichContactResultSchema = z.object({
    input: z.record(z.any()).optional().describe('Input parameters used for the enrichment request'),
    data: z.array(EnrichedContactSchema).describe('Array of enriched contact data'),
    matchStatus: MatchStatusSchema.optional()
  });
  export type EnrichContactResult = z.infer<typeof EnrichContactResultSchema>;

  // Use a type definition rather than Zod schema for EnrichedCompany due to its complexity
  export interface EnrichedCompany {
    id: number;
    ticker: string;
    name: string;
    website: string;
    // ... other fields
  }

  export const EnrichCompanyResponseSchema = z.object({
    success: z.boolean().describe('Indicates if the request was successful'),
    data: z.object({
      outputFields: z.array(z.array(z.string())).describe('Output fields returned in the response'),
      result: z.array(z.lazy(() => EnrichCompanyResultSchema)).describe('Results of the company enrichment')
    }).describe('Response data')
  });
  export type EnrichCompanyResponse = z.infer<typeof EnrichCompanyResponseSchema>;

  // Define EnrichCompanyResultSchema after EnrichedCompany
  EnrichCompanyResultSchema = z.object({
    input: z.record(z.any()).optional().describe('Input parameters used for the enrichment request'),
    data: z.array(z.any()).describe('Array of enriched company data'),
    matchStatus: MatchStatusSchema.optional().describe('Status of the matching process')
  });
  export type EnrichCompanyResult = z.infer<typeof EnrichCompanyResultSchema>;

  export const SearchContactsOptionsSchema = z.object({
    rpp: z.number().optional().describe('Limits the results returned to the given number of results per page. Default is 25.'),
    page: z.number().optional().describe('Provides the results for the given page, used in conjunction with rpp.'),
    sortOrder: z.string().optional().describe('Provide sortBy if specifying sortOrder. Valid values are asc, ascending, desc, and descending. By default, results are sorted in descending order.'),
    sortBy: z.string().optional().describe('Sort results by valid output fields: firstName, lastName, title, companyName, email, personId, dateCreated, lastUpdatedDate.'),
    personId: z.string().optional().describe('ZoomInfo unique identifier for the contact.'),
    emailAddress: z.string().optional().describe('Complete email address of the contact in the format username@domain.'),
    hashedEmail: z.string().optional().describe('SHA-256 hashed email.'),
    fullName: z.string().optional().describe('First and last name of the contact in the format: First Last.'),
    firstName: z.string().optional().describe('First name of the contact.'),
    lastName: z.string().optional().describe('Last name of the contact.'),
    jobTitle: z.string().optional().describe('Title of the contact.'),
    jobFunction: z.string().optional().describe('Function that the contact performs at the company.'),
    managementLevel: z.string().optional().describe('Management level of the contact within their company.'),
    personDepartment: z.string().optional().describe('Department that the contact belongs to.'),
    phone: z.string().optional().describe('Direct phone number of the contact.'),
    mobilePhone: z.string().optional().describe('Mobile phone number of the contact.'),
    externalUrl: z.string().optional().describe('External URL associated with the contact.'),
    lastUpdatedDateAfter: z.string().optional().describe('The date after which the contact\'s profile was last updated in YYYY-MM-DD format.'),
    validDateAfter: z.string().optional().describe('The date after which the contact\'s profile was last validated in YYYY-MM-DD format.'),
    lastUpdatedInMonths: z.number().optional().describe('Number of months within which the contact\'s profile was last updated.'),
    hasBeenNotified: z.string().optional().describe('Contacts who have been notified of inclusion in ZoomInfo\'s database. Values are exclude, include, and only.'),
    companyPastOrPresent: z.string().optional().describe('Returns companies based on a contact\'s work history. Values are present (default), past, and pastAndPresent.'),
    school: z.string().optional().describe('Contact educational institution.'),
    degree: z.string().optional().describe('Contact education degree.'),
    locationCompanyId: z.array(z.string()).optional().describe('Searches by contact\'s location IDs.'),
    companyId: z.string().optional().describe('ZoomInfo unique identifier for the company. Will accept a comma-separated list.'),
    companyName: z.string().optional().describe('Company name. Can use OR and NOT operators to include or exclude companies by name.'),
    companyWebsite: z.string().optional().describe('URL to the company website in http://www.example.com format.'),
    companyTicker: z.array(z.string()).optional().describe('Company stock ticker symbol.'),
    companyDescription: z.string().optional().describe('Text description unique to the company you want to use as search criteria.'),
    parentId: z.string().optional().describe('ZoomInfo Company ID for parent company.'),
    ultimateParentId: z.string().optional().describe('ZoomInfo Company ID for ultimate parent company.'),
    companyType: z.string().optional().describe('Company type (private, public, and so on).'),
    address: z.string().optional().describe('Company address.'),
    street: z.string().optional().describe('Company street.'),
    state: z.string().optional().describe('Company state (U.S.) or province (Canada).'),
    zipCode: z.string().optional().describe('Zip Code of the company\'s primary address.'),
    country: z.string().optional().describe('Country for the company\'s primary address.'),
    continent: z.string().optional().describe('Continent for the company\'s primary address.'),
    zipCodeRadiusMiles: z.string().optional().describe('Used in conjunction with zipCode, designates a geographical radius (in miles) from the zipCode provided.'),
    hashTagString: z.string().optional().describe('Hash tags for a company. Can include a comma-separated list.'),
    techAttributeTagList: z.string().optional().describe('Specify technology product tags.'),
    subUnitTypes: z.string().optional().describe('Company sub types (e.g., division, subsidiary and so on).'),
    primaryIndustriesOnly: z.boolean().optional().describe('Used in conjunction with the industryCodes input parameter. When set to true, any result returned must have one of the specified industries as a primary industry.'),
    industryCodes: z.string().optional().describe('Top-level industry that the contact works in.'),
    industryKeywords: z.string().optional().describe('Industry keywords associated with a company.'),
    sicCodes: z.string().optional().describe('The Standard Industrial Classification is a system for classifying industries by a four-digit code.'),
    naicsCodes: z.string().optional().describe('The North American Industry Classification System (NAICS) code.'),
    revenueMin: z.number().optional().describe('Minimum annual revenue for a company in U.S. dollars.'),
    revenueMax: z.number().optional().describe('Maximum annual revenue for a company in U.S. dollars.'),
    revenue: z.string().optional().describe('Annual revenue range in U.S. dollars.'),
    employeeRangeMin: z.string().optional().describe('Minimum employee count for a company.'),
    employeeRangeMax: z.string().optional().describe('Maximum employee count for a company.'),
    employeeCount: z.string().optional().describe('Employee count range.'),
    companyRanking: z.string().optional().describe('Company ranking list (e.g., Fortune 500 and so on).'),
    metroRegion: z.string().optional().describe('Company metro area.'),
    locationSearchType: z.string().optional().describe('Location criteria for search. Values are PersonOrHQ, PersonAndHQ, Person, HQ, PersonThenHQ.'),
    fundingAmountMin: z.number().optional().describe('Minimum funding amount in thousands.'),
    fundingAmountMax: z.number().optional().describe('Maximum funding amount in thousands.'),
    fundingStartDate: z.string().optional().describe('Start date of the funding in YYYY-MM-DD format.'),
    fundingEndDate: z.string().optional().describe('End date of the funding in YYYY-MM-DD format.'),
    excludedRegions: z.string().optional().describe('Exclude a company metro area.'),
    zoominfoContactsMin: z.string().optional().describe('Minimum number of ZoomInfo contacts associated with company.'),
    zoominfoContactsMax: z.string().optional().describe('Maximum number of ZoomInfo contacts associated with company.'),
    companyStructureIncludedSubUnitTypes: z.string().optional().describe('Company hierarchical structure.'),
    oneYearEmployeeGrowthRateMin: z.string().optional().describe('Minimum one year employee growth rate for a company.'),
    oneYearEmployeeGrowthRateMax: z.string().optional().describe('Maximum one year employee growth rate for a company.'),
    twoYearEmployeeGrowthRateMin: z.string().optional().describe('Minimum two year employee growth rate for a company.'),
    twoYearEmployeeGrowthRateMax: z.string().optional().describe('Maximum two year employee growth rate for a company.'),
    positionStartDateMin: z.string().optional().describe('Minimum date for when a contact began current employment.'),
    positionStartDateMax: z.string().optional().describe('Maximum date for when a contact began current employment.'),
    webReferences: z.array(z.string()).optional().describe('List of web references for a contact.'),
    filterByBuyingCommittee: z.boolean().optional().describe('Boolean flag for Buying Committee.'),
    techSkills: z.array(z.string()).optional().describe('List of technology skills for a contact.'),
    yearsOfExperience: z.string().optional().describe('Years of overall experience.'),
    engagementStartDate: z.string().optional().describe('Engagement start date in YYYY-MM-DD format.'),
    engagementEndDate: z.string().optional().describe('Engagement end date in YYYY-MM-DD format.'),
    engagementType: z.array(z.string()).optional().describe('List of engagement types to search for.'),
  }).strict();
  export type SearchContactsOptions = z.infer<typeof SearchContactsOptionsSchema>;

  export const SearchCompaniesOptionsSchema = z.object({
    rpp: z.number().optional().describe('Limits the results returned to the given number of results per page. Default is 25.'),
    page: z.number().optional().describe('Provides the results for the given page, used in conjunction with rpp'),
    sortOrder: z.string().optional().describe('Provide sortBy if specifying sortOrder. Valid values are asc, ascending, desc, and descending. By default, results are sorted in descending order.'),
    sortBy: z.string().optional().describe('Sort results by valid output fields: name, employeeCount, revenue'),
    companyId: z.string().optional().describe('ZoomInfo unique identifier for the company. Will accept-comma-separated list.'),
    companyName: z.string().optional().describe('Company name'),
    companyWebsite: z.string().optional().describe('URL to the company website in http://www.example.com format'),
    companyDescription: z.string().optional().describe('Text description unique to the company you want to use as search criteria'),
    parentId: z.string().optional().describe('ZoomInfo Company ID for parent company'),
    ultimateParentId: z.string().optional().describe('ZoomInfo Company ID for ultimate parent company'),
    companyTicker: z.array(z.string()).optional().describe('Company stock ticker symbol'),
    companyType: z.string().optional().describe('Company type (private, public, and so on). See the Company Type lookup endpoint for values.'),
    businessModel: z.array(z.string()).optional().describe('Search using Business Model (B2C, B2B, B2G) for a company. Default is All'),
    address: z.string().optional().describe('Company address'),
    street: z.string().optional().describe('Company street'),
    state: z.string().optional().describe('Company state (U.S.) or province (Canada)'),
    zipCode: z.string().optional().describe('Zip Code of the company\'s primary address.'),
    country: z.string().optional().describe('Country for the company\'s primary address'),
    continent: z.string().optional().describe('Continent for the company\'s primary address'),
    zipCodeRadiusMiles: z.string().optional().describe('Used in conjunction with zipCode, designates a geographical radius (in miles) from the zipCode provided.'),
    hashTagString: z.string().optional().describe('Hash tags for a company. Can include a comma-separated list.'),
    techAttributeTagList: z.string().optional().describe('Specify technology product tags'),
    subUnitTypes: z.string().optional().describe('Company sub types (e.g., division, subsidiary and so on)'),
    primaryIndustriesOnly: z.boolean().optional().describe('Used in conjunction with the industryCodes input parameter. When set to true, any result returned must have one of the specified industries as a primary industry.'),
    industryCodes: z.string().optional().describe('Top-level Industry that the contact works in'),
    industryKeywords: z.string().optional().describe('Industry keywords associated with a company'),
    sicCodes: z.string().optional().describe('The Standard Industrial Classification is a system for classifying industries by a four-digit code'),
    naicsCodes: z.string().optional().describe('The North American Industry Classification System (NAICS) code'),
    revenueMin: z.number().optional().describe('Minimum annual revenue for a company in U.S. dollars'),
    revenueMax: z.number().optional().describe('Maximum annual revenue for a company in U.S. dollars'),
    revenue: z.string().optional().describe('Annual revenue range in U.S. dollars'),
    employeeRangeMin: z.string().optional().describe('Minimum employee count for a company'),
    employeeRangeMax: z.string().optional().describe('Maximum employee count for a company'),
    employeeCount: z.string().optional().describe('Employee count range'),
    companyRanking: z.string().optional().describe('Company ranking list (e.g., Fortune 500 and so on)'),
    metroRegion: z.string().optional().describe('Company metro area'),
    locationSearchType: z.string().optional().describe('Location criteria for search. Values are PersonOrHQ, PersonAndHQ, Person, HQ, PersonThenHQ.'),
    fundingAmountMin: z.number().optional().describe('Minimum funding amount in thousands'),
    fundingAmountMax: z.number().optional().describe('Maximum funding amount in thousands'),
    fundingStartDate: z.string().optional().describe('Start date of the funding in YYYY-MM-DD format'),
    fundingEndDate: z.string().optional().describe('End date of the funding in YYYY-MM-DD format'),
    excludedRegions: z.string().optional().describe('Exclude a company metro area'),
    zoominfoContactsMin: z.string().optional().describe('Minimum number of ZoomInfo contacts associated with company'),
    zoominfoContactsMax: z.string().optional().describe('Maximum number of ZoomInfo contacts associated with company'),
    companyStructureIncludedSubUnitTypes: z.string().optional().describe('Company hierarchical structure'),
    certified: z.number().optional().describe('Denotes if ZoomInfo\'s research and data team has confirmed activity within the past 12 months'),
    excludeDefunctCompanies: z.boolean().optional().describe('Include or exclude defunct companies. The default value is false.'),
    oneYearEmployeeGrowthRateMin: z.string().optional().describe('Minimum one year employee growth rate for a company'),
    oneYearEmployeeGrowthRateMax: z.string().optional().describe('Maximum one year employee growth rate for a company'),
    twoYearEmployeeGrowthRateMin: z.string().optional().describe('Minimum two year employee growth rate for a company'),
    twoYearEmployeeGrowthRateMax: z.string().optional().describe('Maximum two year employee growth rate for a company'),
    engagementStartDate: z.string().optional().describe('Engagement start date in YYYY-MM-DD format'),
    engagementEndDate: z.string().optional().describe('Engagement end date in YYYY-MM-DD format'),
    engagementType: z.array(z.string()).optional().describe('List of engagement types to search for'),
  }).strict();
  export type SearchCompaniesOptions = z.infer<typeof SearchCompaniesOptionsSchema>;
  
  export const SearchResultSchema = z.object({
    maxResults: z.number().describe('Maximum number of results available'),
    totalResults: z.number().describe('Total number of results found'),
    currentPage: z.number().describe('Current page number'),
    data: z.array(z.any()).describe('Array of search result data'),
  });
  export type SearchResult<T> = z.infer<typeof SearchResultSchema> & { data: T[] };

  export const defaultEnrichContactOutputFields = [
    'id',
    'firstName',
    'middleName',
    'lastName',
    'email',
    'hasCanadianEmail',
    'phone',
    'directPhoneDoNotCall',
    'street',
    'city',
    'region',
    'metroArea',
    'zipCode',
    'state',
    'country',
    'personHasMoved',
    'withinEu',
    'withinCalifornia',
    'withinCanada',
    'lastUpdatedDate',
    'noticeProvidedDate',
    'salutation',
    'suffix',
    'jobTitle',
    'jobFunction',
    'companyDivision',
    'education',
    'hashedEmails',
    'picture',
    'mobilePhoneDoNotCall',
    'externalUrls',
    'companyId',
    'companyName',
    'companyDescriptionList',
    'companyPhone',
    'companyFax',
    'companyStreet',
    'companyCity',
    'companyState',
    'companyZipCode',
    'companyCountry',
    'companyLogo',
    'companySicCodes',
    'companyNaicsCodes',
    'contactAccuracyScore',
    'companyWebsite',
    'companyRevenue',
    'companyRevenueNumeric',
    'companyEmployeeCount',
    'companyType',
    'companyTicker',
    'companyRanking',
    'isDefunct',
    'companySocialMediaUrls',
    'companyPrimaryIndustry',
    'companyIndustries',
    'companyRevenueRange',
    'companyEmployeeRange',
    'employmentHistory',
    'managementLevel',
    'locationCompanyId',
  ] as const;

  export const defaultEnrichCompanyOutputFields = [
    'id',
    'name',
    'website',
    'domainList',
    'logo',
    'ticker',
    'revenue',
    'socialMediaUrls',
    'employeeCount',
    'numberOfContactsInZoomInfo',
    'phone',
    'fax',
    'street',
    'city',
    'state',
    'zipCode',
    'country',
    'continent',
    'companyStatus',
    'companyStatusDate',
    'descriptionList',
    'sicCodes',
    'naicsCodes',
    'competitors',
    'ultimateParentId',
    'ultimateParentName',
    'ultimateParentRevenue',
    'ultimateParentEmployees',
    'subUnitCodes',
    'subUnitType',
    'subUnitIndustries',
    'primaryIndustry',
    'industries',
    'parentId',
    'parentName',
    'locationCount',
    'metroArea',
    'lastUpdatedDate',
    'createdDate',
    'certificationDate',
    'certified',
    'hashtags',
    'products',
    'techAttributes',
    'revenueRange',
    'employeeRange',
    'companyFunding',
    'recentFundingAmount',
    'recentFundingDate',
    'totalFundingAmount',
    'employeeGrowth',
  ] as const;

  export const UsageSchema = z.object({
    limitType: z.string().describe('Type of limit being tracked'),
    description: z.string().describe('Description of the usage limit'),
    limit: z.number().describe('Maximum allowed usage'),
    currentUsage: z.number().describe('Current amount used'),
    usageRemaining: z.number().describe('Remaining amount available')
  });
  export type Usage = z.infer<typeof UsageSchema>;

  export const UsageResponseSchema = z.object({
    usage: z.array(UsageSchema).describe('Array of usage information')
  });
  export type UsageResponse = z.infer<typeof UsageResponseSchema>;

  export const ContactSearchResultSchema = z.object({
    id: z.number().describe('ZoomInfo unique identifier for the contact'),
    firstName: z.string().describe('First name of the contact'),
    middleName: z.string().describe('Middle name of the contact'),
    lastName: z.string().describe('Last name of the contact'),
    validDate: z.string().describe('Date when the contact information was last validated'),
    lastUpdatedDate: z.string().describe('Date when the contact information was last updated'),
    jobTitle: z.string().describe('Job title of the contact'),
    contactAccuracyScore: z.number().describe('Accuracy score for the contact data'),
    hasEmail: z.boolean().describe('Whether the contact has an email address'),
    hasSupplementalEmail: z.boolean().describe('Whether the contact has a supplemental email address'),
    hasDirectPhone: z.boolean().describe('Whether the contact has a direct phone number'),
    hasMobilePhone: z.boolean().describe('Whether the contact has a mobile phone number'),
    hasCompanyIndustry: z.boolean().describe('Whether company industry information is available'),
    hasCompanyPhone: z.boolean().describe('Whether company phone information is available'),
    hasCompanyStreet: z.boolean().describe('Whether company street address is available'),
    hasCompanyState: z.boolean().describe('Whether company state information is available'),
    hasCompanyZipCode: z.boolean().describe('Whether company zip code information is available'),
    hasCompanyCountry: z.boolean().describe('Whether company country information is available'),
    hasCompanyRevenue: z.boolean().describe('Whether company revenue information is available'),
    hasCompanyEmployeeCount: z.boolean().describe('Whether company employee count information is available'),
    company: z.lazy(() => CompanySearchResultSchema).describe('Company information for the contact')
  });
  export type ContactSearchResult = z.infer<typeof ContactSearchResultSchema>;

  export const CompanySearchResultSchema = z.object({
    id: z.number().describe('ZoomInfo unique identifier for the company'),
    name: z.string().describe('Name of the company')
  });
  export type CompanySearchResult = z.infer<typeof CompanySearchResultSchema>;

  export type SearchContactsResponse = SearchResult<ContactSearchResult>;
  export type SearchCompaniesResponse = SearchResult<CompanySearchResult>;
}

/**
 * ZoomInfo is a robust B2B enrichment and search API for people and companies.
 *
 * @see https://api-docs.zoominfo.com
 * @see https://tech-docs.zoominfo.com/enterprise-api-getting-started-guide.pdf
 */
export class ZoomInfoClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiBaseUrl: string;

  protected readonly username: string;
  protected readonly password: string | undefined;
  protected readonly clientId: string | undefined;
  protected readonly privateKey: string | undefined;

  protected accessToken: string | undefined;
  protected accessTokenDateMS: number | undefined;

  constructor({
    username = getEnv('ZOOMINFO_USERNAME'),
    password = getEnv('ZOOMINFO_PASSWORD'),
    clientId = getEnv('ZOOMINFO_CLIENT_ID'),
    privateKey = getEnv('ZOOMINFO_PRIVATE_KEY'),
    apiBaseUrl = zoominfo.API_BASE_URL,
    timeoutMs = 60_000,
    throttle = true,
    ky = defaultKy,
  }: {
    username?: string;
    password?: string;
    clientId?: string;
    privateKey?: string;
    apiBaseUrl?: string;
    apiKnowledgeGraphBaseUrl?: string;
    timeoutMs?: number;
    throttle?: boolean;
    ky?: KyInstance;
  } = {}) {
    assert(
      username,
      `ZoomInfoClient missing required "username" (defaults to "ZOOMINFO_USERNAME")`,
    );
    assert(
      password || (clientId && privateKey),
      `ZoomInfoClient missing required "password" for basic auth or "clientId" and "privateKey" for PKI auth (defaults to "ZOOMINFO_PASSWORD", "ZOOMINFO_CLIENT_ID", and "ZOOMINFO_PRIVATE_KEY")`,
    );
    super();

    this.username = username;
    this.password = password;
    this.clientId = clientId;
    this.privateKey = privateKey;

    this.apiBaseUrl = apiBaseUrl;

    const throttledKy = throttle ? throttleKy(ky, zoominfo.throttle) : ky;

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
    });
  }

  /**
   * Attempts to authenticate with ZoomInfo using the provided credentials
   * (either basic auth or PKI auth). If there's already a valid access token,
   * then it will be reused unless `force` is set to `true`.
   *
   * NOTE: All API methods call this internally, so there is no reason to call
   * this yourself unless you need to force a re-authentication.
   */
  async authenticate({
    force = false,
  }: { force?: boolean } = {}): Promise<void> {
    if (
      !force &&
      this.accessToken &&
      this.accessTokenDateMS! + zoominfo.ACCESS_TOKEN_EXPIRATION_MS > Date.now()
    ) {
      // Access token is still valid.
      return;
    }

    if (this.username && this.password) {
      this.accessTokenDateMS = Date.now();
      this.accessToken = await this.getAccessTokenViaBasicAuth({
        username: this.username,
        password: this.password,
      });

      assert(
        this.accessToken,
        'ZoomInfo failed to get access token via basic auth',
      );
      return;
    }

    if (this.username && this.clientId && this.privateKey) {
      this.accessTokenDateMS = Date.now();
      this.accessToken = await this.getAccessTokenViaPKI({
        username: this.username,
        clientId: this.clientId,
        privateKey: this.privateKey,
      });

      assert(
        this.accessToken,
        'ZoomInfo failed to get access token via PKI auth',
      );
      return;
    }

    throw new Error(
      'ZoomInfoClient missing required authentication credentials',
    );
  }

  /**
   * This method is used internally and should not be called directly except
   * for advanced use cases.
   */
  async getAccessTokenViaBasicAuth({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<string> {
    const res = await this.ky
      .post('authenticate', {
        json: {
          username,
          password,
        },
        headers: {
          'cache-control': 'no-cache',
        },
      })
      .json<{ jwt: string }>();

    return res.jwt;
  }

  /**
   * This method is used internally and should not be called directly except
   * for advanced use cases.
   */
  async getAccessTokenViaPKI({
    username,
    clientId,
    privateKey,
  }: {
    username: string;
    clientId: string;
    privateKey: string;
  }): Promise<string> {
    const dtNow = Date.now();
    const header = {
      typ: 'JWT',
      alg: 'RS256',
    };
    const data = {
      aud: 'enterprise_api',
      iss: 'api-client@zoominfo.com',
      username,
      client_id: clientId,
      iat: getIAT(dtNow),
      exp: getEXP(dtNow),
    };
    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(data);

    const clientJWT = KJUR.jws.JWS.sign(
      header.alg,
      sHeader,
      sPayload,
      privateKey,
    );

    const res = await this.ky
      .post('authenticate', {
        json: {},
        headers: {
          Authorization: `Bearer ${clientJWT}`,
          'cache-control': 'no-cache',
        },
      })
      .json<{ jwt: string }>();

    return res.jwt;
  }

  /**
   * Attempts to enrich a person contact with ZoomInfo data
   */
  @aiFunction({
    name: 'zoominfo_enrich_contact',
    description: `Attempts to enrich a person contact with ZoomInfo data. To match a contact, you must use one of the following combinations of parameters to construct your input:

personId OR emailAddress OR hashedEmail OR phone. Because these values are unique to a single person, you can use any one of these values to search without providing any additional parameters. You can optionally combine one of these values with a companyId/companyName.

firstName AND lastName AND companyId/companyName. Combining these values effectively results in a unique person.

fullName AND companyId/companyName. Combining these values effectively results in a unique person.`,
    inputSchema: zoominfo.EnrichContactOptionsSchema,
  })
  async enrichContact(opts: zoominfo.EnrichContactOptions) {
    await this.authenticate();

    const {
      outputFields = zoominfo.defaultEnrichContactOutputFields,
      ...matchPersonInput
    } = opts;

    return this.ky
      .post('enrich/contact', {
        json: {
          matchPersonInput: [matchPersonInput],
          outputFields,
        },
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
      .json<zoominfo.EnrichContactResponse>();
  }

  /**
   * Attempts to enrich a company with ZoomInfo data.
   */
  @aiFunction({
    name: 'enrichCompany',
    description:
      'Attempts to enrich a company with ZoomInfo data. To match a company, you should ideally provide the `companyName` and `companyWebsite`.',
    inputSchema: zoominfo.EnrichCompanyOptionsSchema,
  })
  async enrichCompany(opts: zoominfo.EnrichCompanyOptions) {
    await this.authenticate();

    const {
      outputFields = zoominfo.defaultEnrichCompanyOutputFields,
      ...matchCompanyInput
    } = opts;

    return this.ky
      .post('enrich/company', {
        json: {
          matchCompanyInput: [matchCompanyInput],
          outputFields,
        },
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
      .json<zoominfo.EnrichCompanyResponse>();
  }

  /**
   * Returns a list of Contacts from ZoomInfo's data that meet the specified
   * search criteria.
   */
  @aiFunction({
    name: 'searchContacts',
    description:
      "Returns a list of Contacts from ZoomInfo's data that meet the specified search criteria.",
    inputSchema: zoominfo.SearchContactsOptionsSchema,
  })
  async searchContacts(opts: zoominfo.SearchContactsOptions) {
    await this.authenticate();

    return this.ky
      .post('search/contact', {
        json: opts,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
      .json<zoominfo.SearchContactsResponse>();
  }

  /**
   * Returns a list of Companies from ZoomInfo's data which meet the specified
   * search criteria.
   */
  @aiFunction({
    name: 'searchCompanies',
    description:
      "Returns a list of Companies from ZoomInfo's data that meet the specified search criteria.",
    inputSchema: zoominfo.SearchCompaniesOptionsSchema,
  })
  async searchCompanies(opts: zoominfo.SearchCompaniesOptions) {
    await this.authenticate();

    return this.ky
      .post('search/company', {
        json: opts,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
      .json<zoominfo.SearchCompaniesResponse>();
  }

  /**
   * Retrieve current usage stats and available data depending on your
   * ZoomInfo plan.
   */
  @aiFunction({
    name: 'zoominfo_get_usage',
    description:
      'Retrieves current usage stats for available data depending on your ZoomInfo plan.',
    inputSchema: z.object({}),
  })
  async getUsage() {
    await this.authenticate();

    return this.ky
      .get('lookup/usage', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'cache-control': 'no-cache',
        },
      })
      .json<zoominfo.UsageResponse>();
  }
}

function getIAT(dtNow: number) {
  const iat = Math.floor(dtNow / 1000);
  return iat - 60;
}

function getEXP(dtNow: number) {
  const exp = Math.floor(dtNow / 1000) + 5 * 60;
  return exp - 60;
}
