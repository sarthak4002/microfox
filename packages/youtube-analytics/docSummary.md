# YouTube Analytics API Summary for TypeScript SDK

This document summarizes the YouTube Analytics API for generating a TypeScript SDK.  It covers report retrieval and group management functionalities.

## Authentication

All API requests require OAuth 2.0 authorization. The following scopes are used:

* `https://www.googleapis.com/auth/yt-analytics.readonly`: View YouTube Analytics reports (user activity metrics).
* `https://www.googleapis.com/auth/yt-analytics-monetary.readonly`: View YouTube Analytics monetary reports (revenue and ad performance).
* `https://www.googleapis.com/auth/youtube`: Manage YouTube account (manage groups and group items for channel owners).
* `https://www.googleapis.com/auth/youtubepartner`: Manage YouTube assets and content (manage groups and group items for content owners).


## 1. Reports: query

**Description:** Retrieves YouTube Analytics data.  Each request specifies criteria like channel/content owner, date range, and metrics.

**Endpoint:** `GET https://youtubeanalytics.googleapis.com/v2/reports`

**Request Headers:**

* `Authorization`: OAuth 2.0 token

**Request Parameters:**

| Parameter | Type | Description | Required |
|---|---|---|---|
| `endDate` | `string` | End date for data retrieval (YYYY-MM-DD). | Yes |
| `ids` | `string` | Identifies channel/content owner (`channel==MINE`, `channel==CHANNEL_ID`, `contentOwner==OWNER_NAME`). | Yes |
| `metrics` | `string` | Comma-separated list of metrics (e.g., `views`, `likes,dislikes`). | Yes |
| `startDate` | `string` | Start date for data retrieval (YYYY-MM-DD). | Yes |
| `currency` | `string` | Three-letter ISO 4217 currency code (default: USD). | No |
| `dimensions` | `string` | Comma-separated list of dimensions (e.g., `video`, `ageGroup,gender`). | No |
| `filters` | `string` | Filters data based on dimension values (e.g., `video==VIDEO_ID;country==US`).  Multiple values for `video`, `playlist`, and `channel` are supported (e.g., `video==VIDEO_ID1,VIDEO_ID2`). | No |
| `includeHistoricalChannelData` | `boolean` | Include data from before channel linking (content owner reports only). | No |
| `maxResults` | `integer` | Maximum number of rows in response. | No |
| `sort` | `string` | Comma-separated list of dimensions/metrics for sorting (prefix `-` for descending). | No |
| `startIndex` | `integer` | 1-based index of the first entity to retrieve (for pagination). | No |


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
  rows: Array<Array<string | number | boolean>>; // Data rows
}

interface ReportsQueryResponse {
  result: ResultTable;
}
```

**Edge Cases:**

* The `rows` array will be omitted if no data is available.
* Responses for queries with the `day` dimension will not include the most recent days.
* When using multiple values for the same filter and adding that filter to the dimensions, the API groups results by those filter values.


## 2. Groups

### 2.1 Groups: list

**Description:** Returns a list of groups owned by the authenticated user.

**Endpoint:** `GET https://youtubeanalytics.googleapis.com/v2/groups`

**Authentication:** As described above (includes read-only scopes).

**Request Parameters:**

| Parameter | Type | Description | Required |
|---|---|---|---|
| `id` | `string` | Comma-separated list of group IDs. | No (Either `id` or `mine` is required) |
| `mine` | `boolean` | Set to `true` to retrieve all groups owned by the user. | No (Either `id` or `mine` is required) |
| `onBehalfOfContentOwner` | `string` | Content owner ID (for content owners managing multiple channels). | No |
| `pageToken` | `string` | Token for pagination. | No |

**Request Body:** None

**Response:**

```typescript
interface Group {
  kind: "youtube#group";
  etag: string;
  id: string;
  snippet: {
    publishedAt: string; // datetime
    title: string;
  };
  contentDetails: {
    itemCount: number;
    itemType: "youtube#channel" | "youtube#playlist" | "youtube#video" | "youtubePartner#asset";
  };
}

interface GroupListResponse {
  kind: "youtube#groupListResponse";
  etag: string;
  items: Group[];
  nextPageToken: string | undefined;
}
```


### 2.2 Groups: insert

**Description:** Creates a new YouTube Analytics group.

**Endpoint:** `POST https://youtubeanalytics.googleapis.com/v2/groups`

**Authentication:** As described above (requires write access).


**Request Parameters:**

| Parameter | Type | Description | Required |
|---|---|---|---|
| `onBehalfOfContentOwner` | `string` | Content owner ID. | No |

**Request Body:**  `Group` object (see above).  `snippet.title` and `contentDetails.itemType` are required.

**Response:** `Group` object.


### 2.3 Groups: update

**Description:** Modifies a group's metadata (currently only the title).

**Endpoint:** `PUT https://youtubeanalytics.googleapis.com/v2/groups`

**Authentication:** As described above (requires write access).


**Request Parameters:**

| Parameter | Type | Description | Required |
|---|---|---|---|
| `onBehalfOfContentOwner` | `string` | Content owner ID. | No |

**Request Body:** `Group` object. `id` and `snippet.title` are required.

**Response:** `Group` object.


### 2.4 Groups: delete

**Description:** Deletes a group.

**Endpoint:** `DELETE https://youtubeanalytics.googleapis.com/v2/groups`

**Authentication:** As described above (requires write access).


**Request Parameters:**

| Parameter | Type | Description | Required |
|---|---|---|---|
| `id` | `string` | Group ID. | Yes |
| `onBehalfOfContentOwner` | `string` | Content owner ID. | No |

**Request Body:** None

**Response:**  HTTP 204 (No Content).



## 3. GroupItems

### 3.1 GroupItems: list

**Description:** Lists items within a specific group.

**Endpoint:** `GET https://youtubeanalytics.googleapis.com/v2/groupItems`

**Authentication:** As described above (includes read-only scopes).  Requires either the `youtube` scope or both the `youtube.readonly` and `yt-analytics.readonly` scopes.


**Request Parameters:**

| Parameter | Type | Description | Required |
|---|---|---|---|
| `groupId` | `string` | Group ID. | Yes |
| `onBehalfOfContentOwner` | `string` | Content owner ID. | No |

**Request Body:** None

**Response:**

```typescript
interface GroupItem {
  kind: "youtube#groupItem";
  etag: string;
  id: string; // Group item ID
  groupId: string;
  resource: {
    kind: string;
    id: string; // Resource ID (channel, video, playlist, or asset)
  };
}

interface GroupItemListResponse {
  kind: "youtube#groupItemListResponse";
  etag: string;
  items: GroupItem[];
}

```



### 3.2 GroupItems: insert

**Description:** Adds an item to a group.

**Endpoint:** `POST https://youtubeanalytics.googleapis.com/v2/groupItems`

**Authentication:** As described above (requires write access).


**Request Parameters:**

| Parameter | Type | Description | Required |
|---|---|---|---|
| `onBehalfOfContentOwner` | `string` | Content owner ID. | No |

**Request Body:** `GroupItem` object (see above).  `groupId` and `resource.id` are required.

**Response:**  `GroupItem` object.  If the item already exists in the group, returns HTTP 204 (No Content).



### 3.3 GroupItems: delete

**Description:** Removes an item from a group.


**Endpoint:** `DELETE https://youtubeanalytics.googleapis.com/v2/groupItems`

**Authentication:** As described above (requires write access).


**Request Parameters:**

| Parameter | Type | Description | Required |
|---|---|---|---|
| `id` | `string` | Group item ID (not the resource ID). | Yes |
| `onBehalfOfContentOwner` | `string` | Content owner ID. | No |


**Request Body:** None

**Response:** HTTP 204 (No Content).


This summary provides the necessary information for generating a robust TypeScript SDK for the YouTube Analytics API, covering authentication, report retrieval, group management, and group item manipulation. Remember to handle potential edge cases and error conditions for a complete implementation.  Refer to the official documentation for the most up-to-date information and details on specific reports, dimensions, and metrics.
