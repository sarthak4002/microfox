## YouTube Analytics API Summary for TypeScript SDK Generation

This summary outlines the YouTube Analytics API details for generating a TypeScript SDK.  It includes endpoints, methods, authentication, parameters, responses, and other relevant information.

**Base URL:** `https://youtubeanalytics.googleapis.com/v2`

**Authentication:** OAuth 2.0 is required for all API requests.  The following scopes are available:

* `https://www.googleapis.com/auth/yt-analytics.readonly`: View YouTube Analytics reports (view counts, ratings).
* `https://www.googleapis.com/auth/yt-analytics-monetary.readonly`: View YouTube Analytics monetary reports (revenue, ad performance).
* `https://www.googleapis.com/auth/youtube`: Manage your YouTube account (manage groups and group items for channel owners).
* `https://www.googleapis.com/auth/youtubepartner`: Manage YouTube assets and content (manage groups and group items for content owners).


---

### 1. reports.query

**Description:** Retrieves a YouTube Analytics report.  Requires specifying a channel ID or content owner, start and end dates, and at least one metric.

**Endpoint:** `/reports`
**Method:** `GET`
**Authentication:**  OAuth 2.0 (yt-analytics.readonly or yt-analytics-monetary.readonly)

**Request Parameters:**

* `ids`: (string, **required**) Identifies the channel or content owner. Format: `channel==CHANNEL_ID` or `contentOwner==CONTENT_OWNER_ID`.
* `startDate`: (string, **required**) Start date for the report (YYYY-MM-DD).
* `endDate`: (string, **required**) End date for the report (YYYY-MM-DD).
* `metrics`: (string, **required**) Comma-separated list of metrics.  (See YouTube Analytics documentation for available metrics).
* `dimensions`: (string, optional) Comma-separated list of dimensions. (See YouTube Analytics documentation for available dimensions).
* `filters`: (string, optional)  Filtering criteria.  Format: `DIMENSION==VALUE`. Multiple filters can be combined with a semicolon.
* `sort`: (string, optional) Comma-separated list of dimensions or metrics to sort by. Prepend with `-` for descending order.
* `maxResults`: (integer, optional) Maximum number of rows to return.
* `startIndex`: (integer, optional) Index of the first row to return.
* `currency`: (string, optional) Currency for monetary reports (ISO 4217 currency code).
* `includeHistoricalChannelData`: (boolean, optional) Include historical data for channel.


**Response:**

```typescript
interface ReportResponse {
  kind: string; // "youtubeAnalytics#report"
  columnHeaders: {
    name: string;
    columnType: string; // "STRING", "INTEGER", etc.
    dataType: string; // "STRING", "INTEGER", etc.
  }[];
  rows: any[][]; // Two-dimensional array of data
}
```

**Edge Cases:**

* Handle invalid parameter combinations (e.g., incompatible dimensions and metrics).
* Implement proper pagination using `startIndex` and `maxResults`.
* Handle potential rate limiting.


---


### 2. Groups

**Description:**  Manages YouTube Analytics groups (collections of channels, videos, playlists, or assets).

**Base Endpoint:** `/groups`
**Authentication:** OAuth 2.0 (youtube or youtubepartner for management operations)

**2.1 list**

**Description:** Returns a list of groups.

**Endpoint:** `/groups`
**Method:** `GET`

**Request Parameters:**

* `mine`: (boolean, optional) Retrieve groups owned by the authenticated user.
* `id`: (string, optional) Comma-separated list of group IDs to retrieve.
* `onBehalfOfContentOwner`: (string, optional) Content owner ID.


**Response:**

```typescript
interface GroupListResponse {
  kind: string; // "youtubeAnalytics#groupListResponse"
  items: Group[];
  nextPageToken?: string; // For pagination
}

interface Group {
  kind: string; // "youtubeAnalytics#group"
  id: string;
  snippet: {
    title: string;
    description?: string;
  };
  contentDetails: {
    itemType: string; // "youtube#video", "youtube#channel", etc.
    itemCount?: number; 
  };
}
```


**2.2 insert**

**Description:** Creates a new group.

**Endpoint:** `/groups`
**Method:** `POST`

**Request Body:** (Group resource, see Group interface above)

**Response:** (Group resource)


**2.3 update**

**Description:** Updates a group's metadata (currently only the title).

**Endpoint:** `/groups`
**Method:** `PUT`

**Request Body:** (Group resource)

**Response:** (Group resource)


**2.4 delete**

**Description:** Deletes a group.

**Endpoint:** `/groups/{id}`
**Method:** `DELETE`

**Request Parameters:**

* `id`: (string, **required**) The ID of the group to delete.
* `onBehalfOfContentOwner`: (string, optional) Content owner ID.

**Response:** (Empty response)



---

### 3. GroupItems


**Description:** Manages items within a group.

**Base Endpoint:** `/groupItems`
**Authentication:** OAuth 2.0 (youtube or youtubepartner)


**3.1 list**

**Description:** Lists items in a group.

**Endpoint:** `/groupItems`
**Method:** `GET`

**Request Parameters:**

* `groupId`: (string, **required**) The ID of the group.
* `onBehalfOfContentOwner`: (string, optional) Content owner ID.


**Response:**

```typescript
interface GroupItemListResponse {
  kind: string; // "youtubeAnalytics#groupItemListResponse"
  items: GroupItem[];
  nextPageToken?: string; // For pagination
}

interface GroupItem {
  kind: string; // "youtubeAnalytics#groupItem"
  id: string;
  groupId: string; // ID of the parent group
  resource: {
    kind: string; // "youtube#video", "youtube#channel", etc.
    id: string; // ID of the resource
  };
}
```


**3.2 insert**

**Description:** Adds an item to a group.

**Endpoint:** `/groupItems`
**Method:** `POST`

**Request Body:** (GroupItem resource)

**Response:** (GroupItem resource)


**3.3 delete**

**Description:** Removes an item from a group.

**Endpoint:** `/groupItems`
**Method:** `DELETE`

**Request Parameters:**

* `id`: (string, **required**) The ID of the group item to delete.
* `onBehalfOfContentOwner`: (string, optional) Content owner ID.


**Response:** (Empty response)



---



This detailed summary provides the necessary information to generate a robust TypeScript SDK for the YouTube Analytics API.  Remember to consult the full YouTube Analytics API documentation for the most up-to-date information on available metrics, dimensions, filters, and any specific requirements for different report types.  Thorough error handling and type safety should be implemented in the SDK to ensure reliability and ease of use.
