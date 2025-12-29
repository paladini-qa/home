// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
          hasGrantedAllScopes: (
            tokenResponse: TokenResponse,
            ...scopes: string[]
          ) => boolean;
          revoke: (accessToken: string, callback?: () => void) => void;
        };
      };
    };
  }
}

export interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: TokenError) => void;
  prompt?: string;
}

export interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface TokenError {
  type: string;
  message: string;
}

// Google User Info
export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

// Google Tasks API types
export interface TaskList {
  kind: string;
  id: string;
  etag: string;
  title: string;
  updated: string;
  selfLink: string;
}

export interface TaskListsResponse {
  kind: string;
  etag: string;
  items: TaskList[];
}

export interface Task {
  kind: string;
  id: string;
  etag: string;
  title: string;
  updated: string;
  selfLink: string;
  parent?: string;
  position: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
  links?: { type: string; description: string; link: string }[];
}

export interface TasksResponse {
  kind: string;
  etag: string;
  items?: Task[];
}

// Google Calendar API types
export interface CalendarEvent {
  kind: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  description?: string;
  location?: string;
  colorId?: string;
  creator: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  organizer: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus: string;
  }[];
}

export interface CalendarEventsResponse {
  kind: string;
  etag: string;
  summary: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  items: CalendarEvent[];
}

export interface Calendar {
  kind: string;
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  primary?: boolean;
}

export interface CalendarListResponse {
  kind: string;
  etag: string;
  items: Calendar[];
}

// Google Drive API types
export interface DriveFile {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
  starred: boolean;
  trashed: boolean;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  owners?: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }[];
}

export interface DriveFilesResponse {
  kind: string;
  incompleteSearch: boolean;
  files: DriveFile[];
  nextPageToken?: string;
}

