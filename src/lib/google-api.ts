import type {
  TaskListsResponse,
  TasksResponse,
  Task,
  CalendarEventsResponse,
  DriveFilesResponse,
  GoogleUserInfo,
} from '@/types/google';

const TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const USERINFO_API = 'https://www.googleapis.com/oauth2/v2/userinfo';

async function fetchWithAuth<T>(url: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// User Info
export async function getUserInfo(token: string): Promise<GoogleUserInfo> {
  return fetchWithAuth<GoogleUserInfo>(USERINFO_API, token);
}

// Tasks API
export async function getTaskLists(token: string): Promise<TaskListsResponse> {
  return fetchWithAuth<TaskListsResponse>(`${TASKS_API_BASE}/users/@me/lists`, token);
}

export async function getTasks(token: string, taskListId: string): Promise<TasksResponse> {
  const params = new URLSearchParams({
    showCompleted: 'false',
    showHidden: 'false',
    maxResults: '100',
  });
  return fetchWithAuth<TasksResponse>(
    `${TASKS_API_BASE}/lists/${taskListId}/tasks?${params}`,
    token
  );
}

export async function updateTask(
  token: string,
  taskListId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<Task> {
  return fetchWithAuth<Task>(
    `${TASKS_API_BASE}/lists/${taskListId}/tasks/${taskId}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }
  );
}

export async function createTask(
  token: string,
  taskListId: string,
  task: { title: string; notes?: string; due?: string }
): Promise<Task> {
  return fetchWithAuth<Task>(
    `${TASKS_API_BASE}/lists/${taskListId}/tasks`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(task),
    }
  );
}

// Calendar API
export async function getCalendarEvents(
  token: string,
  calendarId: string = 'primary',
  days: number = 7
): Promise<CalendarEventsResponse> {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  return fetchWithAuth<CalendarEventsResponse>(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    token
  );
}

// Drive API
export async function getStarredFiles(token: string): Promise<DriveFilesResponse> {
  const params = new URLSearchParams({
    q: 'starred = true and trashed = false',
    fields: 'files(id,name,mimeType,starred,webViewLink,iconLink,thumbnailLink,modifiedTime,owners)',
    orderBy: 'modifiedTime desc',
    pageSize: '20',
  });

  return fetchWithAuth<DriveFilesResponse>(
    `${DRIVE_API_BASE}/files?${params}`,
    token
  );
}

