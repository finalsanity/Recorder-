export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
};
export type GraphItem = {
  id: string;
  name: string;
  webUrl: string;
  size: number;
};

export interface GraphProvider {
  getCurrentUser(): Promise<{ id: string; name: string; email: string }>;
  ensureRootFolder(): Promise<Folder>;
  listFolders(parentId: string): Promise<Folder[]>;
  createFolder(name: string, parentId: string): Promise<Folder>;
  createUploadSession(
    folderId: string,
    filename: string,
  ): Promise<{ uploadUrl: string; expiresAt: string }>;
  uploadFile(
    sessionUrl: string,
    file: Blob,
    onProgress?: (progress: number) => void,
  ): Promise<GraphItem>;
  createShareLink(itemId: string): Promise<string>;
}

export class MockGraphProvider implements GraphProvider {
  async getCurrentUser() {
    return {
      id: "mock-jordan",
      name: "Jordan Davis",
      email: "jordan.davis@northstar.dev",
    };
  }
  async ensureRootFolder() {
    return {
      id: "root",
      name: "Default Recording Tool",
      parentId: null,
      path: "Default Recording Tool",
    };
  }
  async listFolders(parentId: string) {
    return parentId === "root"
      ? ["Bugs", "Regression", "E2E", "Production"].map((name) => ({
          id: name.toLowerCase(),
          name,
          parentId,
          path: `Default Recording Tool / ${name}`,
        }))
      : [];
  }
  async createFolder(name: string, parentId: string) {
    return {
      id: crypto.randomUUID(),
      name,
      parentId,
      path: `Default Recording Tool / ${name}`,
    };
  }
  async createUploadSession() {
    return {
      uploadUrl: "mock://upload-session",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  }
  async uploadFile(
    _sessionUrl: string,
    file: Blob,
    onProgress?: (progress: number) => void,
  ) {
    for (const progress of [20, 45, 78, 100]) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      onProgress?.(progress);
    }
    return {
      id: crypto.randomUUID(),
      name: "recording.mp4",
      webUrl: "https://onedrive.live.com/",
      size: file.size,
    };
  }
  async createShareLink() {
    return "https://onedrive.live.com/";
  }
}

export class MicrosoftGraphProvider implements GraphProvider {
  constructor(private readonly accessToken: string) {}
  private async request(path: string, init?: RequestInit) {
    const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (!response.ok)
      throw new Error(
        `Microsoft Graph request failed with status ${response.status}`,
      );
    return response.json() as Promise<Record<string, unknown>>;
  }
  async getCurrentUser() {
    const user = await this.request("/me");
    return {
      id: String(user.id),
      name: String(user.displayName),
      email: String(user.mail ?? user.userPrincipalName),
    };
  }
  async ensureRootFolder() {
    const result = await this.request(
      "/me/drive/root/children?$filter=name%20eq%20'Default%20Recording%20Tool'%20and%20folder%20ne%20null",
    );
    const existing = (result.value as Array<Record<string, unknown>>)[0];
    if (existing)
      return {
        id: String(existing.id),
        name: String(existing.name),
        parentId: null,
        path: "Default Recording Tool",
      };
    return this.createFolder("Default Recording Tool", "root");
  }
  async listFolders(parentId: string) {
    const result = await this.request(
      parentId === "root"
        ? "/me/drive/root/children"
        : `/me/drive/items/${encodeURIComponent(parentId)}/children`,
    );
    return (result.value as Array<Record<string, unknown>>)
      .filter((item) => item.folder)
      .map((item) => ({
        id: String(item.id),
        name: String(item.name),
        parentId,
        path: String(item.name),
      }));
  }
  async createFolder(name: string, parentId: string) {
    const target =
      parentId === "root"
        ? "/me/drive/root/children"
        : `/me/drive/items/${encodeURIComponent(parentId)}/children`;
    const item = await this.request(target, {
      method: "POST",
      body: JSON.stringify({
        name,
        folder: {},
        "@microsoft.graph.conflictBehavior": "fail",
      }),
    });
    return {
      id: String(item.id),
      name: String(item.name),
      parentId,
      path: String(item.name),
    };
  }
  async createUploadSession(folderId: string, filename: string) {
    return this.request(
      `/me/drive/items/${encodeURIComponent(folderId)}:/${encodeURIComponent(filename)}:/createUploadSession`,
      {
        method: "POST",
        body: JSON.stringify({
          item: { "@microsoft.graph.conflictBehavior": "rename" },
        }),
      },
    ) as Promise<{ uploadUrl: string; expiresAt: string }>;
  }
  async uploadFile(
    sessionUrl: string,
    file: Blob,
    onProgress?: (progress: number) => void,
  ) {
    const response = await fetch(sessionUrl, { method: "PUT", body: file });
    if (!response.ok)
      throw new Error(`Upload failed with status ${response.status}`);
    onProgress?.(100);
    const item = (await response.json()) as Record<string, unknown>;
    return {
      id: String(item.id),
      name: String(item.name),
      webUrl: String(item.webUrl),
      size: Number(item.size),
    };
  }
  async createShareLink(itemId: string) {
    const result = await this.request(
      `/me/drive/items/${encodeURIComponent(itemId)}/createLink`,
      {
        method: "POST",
        body: JSON.stringify({ type: "view", scope: "organization" }),
      },
    );
    return String((result.link as Record<string, unknown>).webUrl);
  }
}
