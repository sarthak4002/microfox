## YouTube Reporting API v1 - Summary for TypeScript SDK Generation

This document summarizes the YouTube Reporting API v1 for the purpose of generating a TypeScript SDK. It details the available endpoints, request/response formats, authentication, and other important considerations.

**Authentication:** All API requests require authorization via OAuth 2.0.  The necessary scopes are:

* `https://www.googleapis.com/auth/yt-analytics.readonly` (View YouTube Analytics reports)
* `https://www.googleapis.com/auth/yt-analytics-monetary.readonly` (View YouTube Analytics monetary reports)


**Response Format:** All responses are in JSON format unless otherwise specified. Report downloads are CSV files.

**Important Notes:**

* Daily/backfill reports are available for 60 days, historical reports for 30 days.
* System-managed reports are automatically generated for content owners.
* Reports are versioned and can have multiple versions with different IDs.
* Reports are not filtered (except for deleted resources older than 30 days).
* Data anonymization applies to certain dimensions below thresholds.


---

### 1. `reportTypes.list` - List Report Types

* **Endpoint:** `/v1/reportTypes`
* **Method:** `GET`
* **Description:** Retrieves a list of available report types.
* **Authentication:** OAuth 2.0 (yt-analytics.readonly or yt-analytics-monetary.readonly)
* **Request Parameters:**
    * `includeSystemManaged` (boolean, optional): Whether to include system-managed report types.
    * `onBehalfOfContentOwner` (string, optional): Content owner ID.
    * `pageToken` (string, optional): Pagination token.
* **Response:**
    ```typescript
    interface ReportType {
        id: string;
        name: string;
        systemManaged?: boolean;  // For system-managed reports
    }

    interface ListReportTypesResponse {
        reportTypes: ReportType[];
        nextPageToken?: string;
    }
    ```

### 2. `jobs.create` - Create a Reporting Job

* **Endpoint:** `/v1/jobs`
* **Method:** `POST`
* **Description:** Creates a reporting job to generate a specific report type.
* **Authentication:** OAuth 2.0 (yt-analytics.readonly or yt-analytics-monetary.readonly)
* **Request Body:**
    ```typescript
    interface Job {
        name: string;        // Job name
        reportTypeId: string; // Report type ID
    }
    ```
* **Response:**
    ```typescript
    interface Job {
        id: string;          // Job ID
        name: string;
        reportTypeId: string;
        createTime: string; // ISO 8601 timestamp
    }
    ```

### 3. `jobs.list` - List Reporting Jobs

* **Endpoint:** `/v1/jobs`
* **Method:** `GET`
* **Description:** Lists reporting jobs.
* **Authentication:** OAuth 2.0 (yt-analytics.readonly or yt-analytics-monetary.readonly)
* **Request Parameters:**
    * `includeSystemManaged` (boolean, optional): Whether to include system-managed jobs.
    * `onBehalfOfContentOwner` (string, optional): Content owner ID.
    * `pageToken` (string, optional): Pagination token.
* **Response:**
    ```typescript
    // Job interface (same as jobs.create response)
    interface ListJobsResponse {
        jobs: Job[];
        nextPageToken?: string;
    }
    ```

### 4. `jobs.reports.list` - List Reports for a Job

* **Endpoint:** `/v1/jobs/{jobId}/reports`
* **Method:** `GET`
* **Description:** Lists reports created for a specific job.
* **Authentication:** OAuth 2.0 (yt-analytics.readonly or yt-analytics-monetary.readonly)
* **Request Parameters:**
    * `jobId` (string, required): Job ID.
    * `createdAfter` (string, optional): ISO 8601 timestamp.
    * `startTimeAtOrAfter` (string, optional): ISO 8601 timestamp for report data start time.
    * `startTimeBefore` (string, optional): ISO 8601 timestamp for report data start time.
    * `onBehalfOfContentOwner` (string, optional): Content owner ID.
    * `pageToken` (string, optional): Pagination token.
* **Response:**
    ```typescript
    interface Report {
        id: string;            // Report ID
        jobId: string;
        startTime: string;     // ISO 8601 timestamp
        endTime: string;       // ISO 8601 timestamp
        createTime: string;     // ISO 8601 timestamp
        downloadUrl?: string;  // URL to download the report (CSV)
    }

    interface ListReportsResponse {
        reports: Report[];
        nextPageToken?: string;
    }
    ```

### 5. `media.download` - Download a Report

* **Endpoint:** URL provided in the `downloadUrl` field of a `Report` object.
* **Method:** `GET`
* **Description:** Downloads the report CSV file.
* **Authentication:**  Not explicitly required, but the `downloadUrl` itself is likely time-limited and tied to the authorized session.
* **Request Headers:**
    * `Accept-Encoding: gzip` (recommended for compression)
* **Response:** CSV file (content type: `text/csv`).


---


### Data Structures (Dimensions and Metrics)

The specific dimensions and metrics available vary by report type.  Refer to the original documentation for the comprehensive list and their definitions:

* **Dimensions:** [https://developers.google.com/youtube/reporting/v1/reports/dimensions](https://developers.google.com/youtube/reporting/v1/reports/dimensions)
* **Metrics:** [https://developers.google.com/youtube/reporting/v1/reports/metrics](https://developers.google.com/youtube/reporting/v1/reports/metrics)
* **Channel Reports:** [https://developers.google.com/youtube/reporting/v1/reports/channel_reports](https://developers.google.com/youtube/reporting/v1/reports/channel_reports)
* **Content Owner Reports:** [https://developers.google.com/youtube/reporting/v1/reports/content_owner_reports](https://developers.google.com/youtube/reporting/v1/reports/content_owner_reports)
* **System-Managed Reports:** [https://developers.google.com/youtube/reporting/v1/reports/system_managed/reports](https://developers.google.com/youtube/reporting/v1/reports/system_managed/reports)  (and sub-pages for fields, financial summaries, etc.)


**TypeScript SDK Considerations:**

* **Enums:** Create enums for dimensions and metrics to improve type safety.
* **Data Models:** Define TypeScript interfaces for all response objects.
* **Error Handling:** Implement robust error handling for API responses and network issues.
* **Rate Limiting:**  Be aware of and handle potential rate limits. The documentation doesn't specify exact limits, so testing and adaptive strategies are recommended.
* **CSV Parsing:** Include a CSV parsing utility in the SDK to process downloaded reports.


This comprehensive summary provides the necessary information to generate a robust and type-safe TypeScript SDK for the YouTube Reporting API v1. Remember to consult the original documentation for the most up-to-date information and details.