# YouTube Analytics API Summary for TypeScript SDK

This document summarizes the YouTube Analytics API for generating a TypeScript SDK.  It covers report retrieval and group management functionalities.

## Authentication

All API requests require OAuth 2.0 authorization.  The following scopes are relevant:

* `https://www.googleapis.com/auth/yt-analytics.readonly`: View YouTube Analytics reports (user activity metrics).
* `https://www.googleapis.com/auth/yt-analytics-monetary.readonly`: View YouTube Analytics monetary reports (revenue and ad performance).
* `https://www.googleapis.com/auth/youtube`: Manage YouTube account (manage Analytics groups and items for channel owners).
* `https://www.googleapis.com/auth/youtubepartner`: Manage YouTube assets and content (manage Analytics groups and items for content owners).

The access token obtained during OAuth 2.0 flow should be included in the requests as the `access_token` query parameter.

## 1. Reports: query

**Description:** Retrieves YouTube Analytics data.  Specify channel, date range, and metrics.  Optionally add dimensions, filters, and sorting.

**Endpoint:** `GET https://youtubeanalytics.googleapis.com/v2/reports`

**Request Parameters:**

* **Required:**
    * `ids`: `string` (Channel or content owner ID.  `channel==MINE`, `channel==CHANNEL_ID`, or `contentOwner==OWNER_NAME`)
    * `startDate`: `string` (Start date in `YYYY-MM-DD` format)
    * `endDate`: `string` (End date in `YYYY-MM-DD` format)
    * `metrics`: `string` (Comma-separated list of metrics, e.g., `views,likes,dislikes`)

* **Optional:**
    * `currency`: `string` (Three-letter ISO 4217 currency code, e.g., `USD`. Default is `USD`)
    * `dimensions`: `string` (Comma-separated list of dimensions, e.g., `day,country`)
    * `filters`: `string` (Filtering criteria, e.g., `video==VIDEO_ID;country==US`. Multiple values for a filter can be specified using commas, e.g. `video==VIDEO_ID_1,VIDEO_ID_2`)
    * `includeHistoricalChannelData`: `boolean` (Include data prior to channel linking for content owner reports. Default is `false`)
    * `maxResults`: `integer` (Maximum number of rows to return)
    * `sort`: `string` (Comma-separated list of dimensions or metrics for sorting, prefix with `-` for descending order)
    * `startIndex`: `integer` (1-based index of the first row to retrieve)
    * `access_token`: `string` (OAuth 2.0 access token)
    * `prettyPrint`: `boolean` (Default is `true`. Format response for readability)
    * `quotaUser`: `string` (Deprecated)
    * `userIp`: `string` (Deprecated)


**Request Body:** None

**Response:**

```typescript
interface ResultTable {
  kind: "youtubeAnalytics#resultTable";
  columnHeaders: Array<{
    name: string;
    dataType: string;
    columnType: string;
  }>;
  rows?: Array<Array<string | number>>; // Optional if no data is available
}
```

**Edge Cases:**

* The `endDate` in the response reflects the last day *complete* data is available for *all* requested metrics.
* The `rows` array will be omitted if no data is available for the given query.
* Responses for queries with the `day` dimension will not contain rows for the most recent days.
* Handle potential API errors as documented in the general error message documentation.


## 2. Groups

**Description:** Manage YouTube Analytics groups (collections of channels, videos, playlists, or assets).

**Base URL:** `https://youtubeanalytics.googleapis.com/v2/groups`

### 2.1 Groups: list

**Description:** Retrieves a list of groups owned by the authenticated user or specific groups by ID.

**Endpoint:** `GET /groups`

**Request Parameters:**

* **Filters (one of):**
    * `id`: `string` (Comma-separated list of group IDs)
    * `mine`: `boolean` (Set to `true` to retrieve all groups owned by the authenticated user)

* **Optional:**
    * `onBehalfOfContentOwner`: `string` (Content owner ID for requests on behalf of a content owner)
    * `pageToken`: `string` (Pagination token for retrieving next page of results)


**Request Body:** None

**Response:**

```typescript
interface GroupListResponse {
  kind: "youtube#groupListResponse";
  etag: string;
  items: Array<Group>;
  nextPageToken?: string;
}

interface Group {
  kind: "youtube#group";
  etag: string;
  id: string;
  snippet: {
    publishedAt: string; // Datetime in ISO 8601 format
    title: string;
  };
  contentDetails: {
    itemCount: number;
    itemType: "youtube#channel" | "youtube#playlist" | "youtube#video" | "youtubePartner#asset";
  };
}
```

### 2.2 Groups: insert

**Description:** Creates a new YouTube Analytics group.

**Endpoint:** `POST /groups`

**Request Parameters:**

* **Optional:**
    * `onBehalfOfContentOwner`: `string` (Content owner ID)

**Request Body:**  `Group` (Must specify `snippet.title` and `contentDetails.itemType`)

**Response:** `Group`

### 2.3 Groups: update

**Description:** Modifies a group's metadata (currently only the title).

**Endpoint:** `PUT /groups`

**Request Parameters:**

* **Optional:**
    * `onBehalfOfContentOwner`: `string` (Content owner ID)


**Request Body:** `Group` (Must specify `id` and `snippet.title`)

**Response:** `Group`

### 2.4 Groups: delete

**Description:** Deletes a group.

**Endpoint:** `DELETE /groups`

**Request Parameters:**

* **Required:**
    * `id`: `string` (Group ID)

* **Optional:**
    * `onBehalfOfContentOwner`: `string` (Content owner ID)


**Request Body:** None

**Response:**  HTTP 204 (No Content)


## 3. GroupItems

**Description:** Manage items within YouTube Analytics groups.

**Base URL:** `https://youtubeanalytics.googleapis.com/v2/groupItems`

### 3.1 GroupItems: list

**Description:** Lists items within a specific group.

**Endpoint:** `GET /groupItems`

**Request Parameters:**

* **Required:**
    * `groupId`: `string` (Group ID)

* **Optional:**
    * `onBehalfOfContentOwner`: `string` (Content owner ID)

**Request Body:** None

**Response:**

```typescript
interface GroupItemListResponse {
  kind: "youtube#groupItemListResponse";
  etag: string;
  items: Array<GroupItem>;
}

interface GroupItem {
  kind: "youtube#groupItem";
  etag: string;
  id: string; // Group item ID
  groupId: string;
  resource: {
    kind: "youtube#channel" | "youtube#playlist" | "youtube#video" | "youtubePartner#asset";
    id: string; // Resource ID
  };
}
```

### 3.2 GroupItems: insert

**Description:** Adds an item to a group.

**Endpoint:** `POST /groupItems`

**Request Parameters:**

* **Optional:**
    * `onBehalfOfContentOwner`: `string` (Content owner ID)

**Request Body:** `GroupItem` (Must specify `groupId` and `resource.id`)

**Response:** `GroupItem` or HTTP 204 (if item already exists in the group)

### 3.3 GroupItems: delete

**Description:** Removes an item from a group.

**Endpoint:** `DELETE /groupItems`

**Request Parameters:**

* **Required:**
    * `id`: `string` (Group item ID)

* **Optional:**
    * `onBehalfOfContentOwner`: `string` (Content owner ID)

**Request Body:** None

**Response:** HTTP 204 (No Content)


This comprehensive summary provides the necessary information for building a robust TypeScript SDK for the YouTube Analytics API, covering both report retrieval and group management functionalities.  Remember to handle errors appropriately based on the HTTP status codes and error messages returned by the API.  Refer to the official YouTube Analytics API documentation for the most up-to-date information and details.
