const defaultLocalizer = (text: string) => text;
const isNodeJs = typeof window === "undefined";

interface LinkedAccount {
  username: string;
  strategy: string;
}

interface RoleState {
  name: string;
  occupants: OccupantState[];
}

interface OccupantState {
  id: string;
  name: string;
}

interface RoomState {
  id: string;
  owner: string;
  name: string;
  roles: { [id: string]: RoleState };
  collaborators: string[];
  version: number;
}

export default class Cloud {
  url: string;
  clientId: string;
  username: string;
  projectId: string | null;
  roleId: string | null;
  newProjectRequest: Promise<any> | undefined;
  localize: (text: string) => string;
  token: string | null;

  constructor(url, clientId, username, localize = defaultLocalizer) {
    this.clientId = clientId;
    this.username = username;
    this.projectId = null;
    this.roleId = null;
    this.url = url;
    this.token = null; // only needed in NodeJs
    this.localize = localize;
  }

  clear() {
    this.username = null;
    this.token = null;
  }

  async resetPassword(username: string) {
    const response = await this.fetch(`/users/${username}/password`, {
      method: "POST",
    });
    return await response.text();
  }

  async login(
    username,
    password,
    remember, // TODO: use this...
    strategy = "NetsBlox",
  ) {
    const credentials = {};
    credentials[strategy] = { username, password };
    const body = {
      credentials,
      clientId: this.clientId,
    };
    const response = await this.post("/users/login", body);
    this.username = await response.text();
    if (isNodeJs) {
      const cookie = response.headers.get("set-cookie");
      if (!cookie) throw new CloudError("No cookie received");

      this.token = cookie.split("=")[1].split(";").shift();
    }
    return this.username;
  }

  async getProjectList() {
    const response = await this.fetch(`/projects/user/${this.username}`);
    return await response.json();
  }

  async getSharedProjectList() {
    const response = await this.fetch(`/projects/shared/${this.username}`);
    return await response.json();
  }

  async changePassword(
    oldPW,
    newPW,
  ) {
    const body = JSON.stringify(newPW);
    const response = await this.fetch(
      `/users/${this.username}/password`,
      { method: "PATCH", body },
    );
    return await response.text();
  }

  parseResponse(src) {
    var ans = [],
      lines;
    if (!src) return ans;
    lines = src.split(" ");
    lines.forEach(function (service) {
      var entries = service.split("&"),
        dict = {};
      entries.forEach(function (entry) {
        var pair = entry.split("="),
          key = decodeURIComponent(pair[0]),
          val = decodeURIComponent(pair[1]);
        dict[key] = val;
      });
      ans.push(dict);
    });
    return ans;
  }

  parseDict(src) {
    var dict = {};
    if (!src) return dict;
    src.split("&").forEach(function (entry) {
      var pair = entry.split("="),
        key = decodeURIComponent(pair[0]),
        val = decodeURIComponent(pair[1]);
      dict[key] = val;
    });
    return dict;
  }

  encodeDict(dict) {
    var str = "",
      pair,
      key;
    if (!dict) return null;
    for (key in dict) {
      if (dict.hasOwnProperty(key)) {
        pair = encodeURIComponent(key) +
          "=" +
          encodeURIComponent(dict[key]);
        if (str.length > 0) {
          str += "&";
        }
        str += pair;
      }
    }
    return str;
  }

  async getUserData() {
    const response = await this.fetch(`/users/${this.username}`);
    return await response.json();
  }

  async addRole(name) {
    const response = await this.post(`/projects/id/${this.projectId}/`, {
      name,
    });
    // TODO: should I request the new project state, too?
    // I shouldn't have to since we should be subscribed to changes...
    //return await response.json();
  }

  async saveRole(roleData) {
    const url = `/projects/id/${this.projectId}/${this.roleId}`;
    const options = {
      method: "POST",
      body: JSON.stringify(roleData),
    };
    await this.fetch(url, options);
  }

  async renameRole(roleId, name) {
    const body = {
      name,
      clientId: this.clientId,
    };
    const response = await this.patch(
      `/projects/id/${this.projectId}/${roleId}`,
      body,
    );
    // TODO: error handling
    //return await response.json();
  }

  async renameProject(name) {
    const body = {
      name,
      clientId: this.clientId,
    };
    const response = await this.patch(`/projects/id/${this.projectId}`, body);
  }

  async reportLatestRole(id, data) {
    const clientId = this.clientId;
    const options = {
      method: "POST",
      body: JSON.stringify({ id, data }),
    };
    await this.fetch(
      `/projects/id/${this.projectId}/${this.roleId}/latest?clientId=${clientId}`,
      options,
    );
  }

  async cloneRole(roleId) {
    const projectId = this.projectId;
    const fetchRoleResponse = await this.fetch(
      `/projects/id/${projectId}/${roleId}/latest`,
    );
    const { name, code, media } = await fetchRoleResponse.json();
    const response = await this.post(`/projects/id/${projectId}/`, {
      name,
      code,
      media,
    });
  }

  async getRoomState(): Promise<RoomState> {
    await this.get(`/network/id/${this.projectId}`);
  }

  async sendOccupantInvite(username, roleId) {
    const body = { username, roleId };
    await this.post(`/network/id/${this.projectId}/occupants/invite`, body);
  }

  async evictOccupant(clientID) {
    const method = "DELETE";
    await this.fetch(`/network/id/${this.projectId}/occupants/${clientID}`, {
      method,
    });
  }

  async getCollaboratorList() {
    const response = await this.get(
      `/projects/id/${this.projectId}/collaborators/`,
    );
    return await response.json();
  }

  async getCollaboratorRequestList() {
    const response = await this.get(
      `/collaboration-invites/user/${this.username}/`,
    );
    return await response.json();
  }

  async sendCollaborateRequest(username) {
    await this.post(
      `/collaboration-invites/${this.projectId}/invite/${username}`,
    );
  }

  async respondToCollaborateRequest(id, accepted) {
    const newState = accepted ? "ACCEPTED" : "REJECTED";
    await this.post(`/collaboration-invites/id/${id}`, newState);
  }

  async removeCollaborator(username, projectId) {
    await this.delete(`/projects/id/${projectId}/collaborators/${username}`);
  }

  async getOnlineFriendList() {
    const response = await this.get(`/friends/${this.username}/online`);
    return await response.json();
  }

  async getFriendList() {
    const response = await this.get(`/friends/${this.username}/`);
    return await response.json();
  }

  async getRole(projectId, roleId) {
    const qs = this.clientId ? `clientId=${this.clientId}` : "";
    const response = await this.fetch(
      `/projects/id/${projectId}/${roleId}/latest?${qs}`,
    );
    const project = await response.json();
    // TODO: Set the state here?
    this.setLocalState(projectId, roleId);
    return project;
  }

  async getProjectMetadata(projectId) {
    const response = await this.fetch(`/projects/id/${projectId}/metadata`);
    const project = await response.json();
    return project;
  }

  async getProjectByName(owner, name) {
    const response = await this.fetch(`/projects/user/${owner}/${name}`);
    return await response.json();
  }

  async getProjectMetadataByName(owner, name) {
    const response = await this.fetch(
      `/projects/user/${owner}/${name}/metadata`,
    );
    return await response.json();
  }

  async startNetworkTrace(projectId) {
    const response = await this.post(`/network/id/${projectId}/trace/`);
    return await response.text();
  }

  async stopNetworkTrace(projectId, traceId) {
    const response = await this.post(
      `/network/id/${projectId}/trace/${traceId}/stop`,
    );
    return await response.text();
  }

  async getNetworkTrace(projectId, traceId) {
    const response = await this.fetch(
      `/network/id/${projectId}/trace/${traceId}`,
    );
    return await response.json();
  }

  async getFriendRequestList() {
    const response = await this.get(`/friends/${this.username}/invites/`);
    return response.json();
  }

  async sendFriendRequest(username) {
    await this.post(`/friends/${this.username}/invite/`, username.trim());
  }

  async unfriend(username) {
    username = encodeURIComponent(username.trim());
    await this.post(`/friends/${this.username}/unfriend/${username}`);
  }

  async respondToFriendRequest(sender, newState) {
    sender = encodeURIComponent(sender);
    await this.post(`/friends/${this.username}/invites/${sender}`, newState);
  }

  async deleteRole(roleId) {
    const method = "DELETE";
    await this.fetch(`/projects/id/${this.projectId}/${roleId}`, { method });
  }

  async deleteProject(projectId) {
    const method = "DELETE";
    await this.fetch(`/projects/id/${projectId}`, { method });
  }

  async publishProject(projectId) {
    const method = "POST";
    await this.fetch(`/projects/id/${projectId}/publish`, { method });
  }

  async unpublishProject(projectId) {
    const method = "POST";
    await this.fetch(`/projects/id/${projectId}/unpublish`, { method });
  }

  reconnect(callback, errorCall) {
    if (!this.username) {
      this.message("You are not logged in");
      return;
    }

    // need to set 'api' from setClientState
    let promise = this.setClientState();
    if (callback && errorCall) {
      promise = promise.then(callback)
        .catch(errorCall);
    }
    return promise;
  }

  async logout() {
    const method = "POST";
    await this.fetch("/users/logout", { method });
    this.clear();
    return true;
  }

  async signup(
    username: string,
    password: string,
    email: string,
  ) {
    const body = {
      username,
      password,
      email,
    };
    const response = await this.post("/users/create", body);
    return await response.text();
  }

  async saveProjectCopy() {
    const response = await this.fetch(`/projects/${this.projectId}/latest`);
    const xml = await response.text();
    const options = {
      method: "POST",
      body: xml, // TODO: add options for allow rename?
    };
    const saveResponse = await this.fetch(`/projects/`, options);

    // TODO: set the state with the network overlay
    //this.setLocalState(response.projectId, this.roleId);

    return saveResponse.status == 200;
  }

  async patch(url: string, body = undefined) {
    const opts: RequestInit = {
      method: "PATCH",
    };
    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }
    return await this.fetch(url, opts);
  }

  async post(url, body = undefined) {
    const opts: RequestInit = {
      method: "POST",
    };
    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }
    return await this.fetch(url, opts);
  }

  async delete(url) {
    const opts = {
      method: "DELETE",
    };
    return await this.fetch(url, opts);
  }

  async get(url) {
    const opts = {
      method: "GET",
    };
    return await this.fetch(url, opts);
  }

  async fetch(url, opts?: RequestInit) {
    opts = opts || {};
    url = this.url + url;
    opts.credentials = opts.credentials || "include";
    opts.headers = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      opts.headers["cookie"] = `netsblox=${this.token}`;
    }
    const response = await fetch(url, opts);
    if (response.status > 399) {
      const text = (await response.text()) ||
        `Could not connect to ${this.url}`;
      const error = new CloudError(text);
      await this.onerror(error);
      throw error;
    }
    return response;
  }

  async onerror(error: Error) {
    throw error;
  }

  setLocalState(projectId, roleId) {
    this.projectId = projectId;
    this.roleId = roleId;
  }

  resetLocalState() {
    this.setLocalState(null, null);
  }

  newProject(name = this.localize("untitled")) {
    var myself = this;

    if (!this.newProjectRequest) {
      const saveResponse = this.post(`/projects/`, {
        name,
        clientId: this.clientId,
      });
      this.newProjectRequest = saveResponse
        .then((response) => response.json())
        .then(async (metadata) => {
          const [roleId] = Object.keys(metadata.roles);
          this.setClientState(metadata.id, roleId);
          myself.newProjectRequest = null;
          return metadata;
        })
        .catch(function (req) {
          myself.resetLocalState();
          myself.newProjectRequest = null;
          throw new Error(req.responseText);
        });
    }

    return this.newProjectRequest;
  }

  getClientState() {
    return {
      username: this.username,
      clientId: this.clientId,
      projectId: this.projectId,
      roleId: this.roleId,
    };
  }

  async setClientState(projectId = this.projectId, roleId = this.roleId) {
    var myself = this,
      newProjectRequest = this.newProjectRequest || Promise.resolve();

    this.projectId = projectId;
    this.roleId = roleId;
    return newProjectRequest
      .then(async () => {
        const body = {
          state: {
            browser: {
              projectId: this.projectId,
              roleId: this.roleId,
            },
          },
        };
        await this.post(`/network/${this.clientId}/state`, body);
        // Only change the project ID if no other moves/newProjects/etc have occurred
      });
  }

  setProjectName(name) {
    const newProjectRequest = this.newProjectRequest || Promise.resolve();

    return newProjectRequest
      .then(async () => {
        await this.patch(`/projects/id/${this.projectId}`, {
          name,
          clientId: this.clientId,
        });
      });
  }

  async importProject(projectData) {
    projectData.clientId = this.clientId;

    const response = await this.post("/projects/", projectData);
    return await response.json();
  }

  async linkAccount(username, password, type) {
    await this.post(`/users/${this.username}/link/`, {
      Snap: { username, password },
    });
  }

  async unlinkAccount(account: LinkedAccount) {
    await this.post(`/users/${this.username}/unlink/`, account);
  }

  async getProjectData(projectId = this.projectId) {
    const response = await this.fetch(
      `/projects/id/${projectId}/latest?clientId=${this.clientId}`,
    );
    return await response.json();
  }

  async exportRole(projectId = this.projectId, roleId = this.roleId) {
    const response = await this.fetch(
      `/projects/id/${projectId}/${roleId}/latest?clientId=${this.clientId}`,
    );
    return await response.text();
  }

  async viewUser(username = this.username) {
    const response = await this.fetch(`/users/${username}`);
    return await response.json();
  }

  async whoAmI() {
    const response = await this.get("/users/whoami");
    return await response.text();
  }

  async getCommunityLibraryList() {
    const response = await this.get("/libraries/community/");
    return await response.json();
  }

  async getLibraryList() {
    const response = await this.get(`/libraries/user/${this.username}/`);
    return await response.json();
  }

  async saveLibrary(name, blocks, notes) {
    const library = {
      name,
      notes,
      blocks,
    };
    const response = await this.post(
      `/libraries/user/${this.username}/`,
      library,
    );
    return await response.json();
  }

  async getLibrary(username, name) {
    name = encodeURIComponent(name);
    const response = await this.get(`/libraries/user/${username}/${name}`);
    return await response.text();
  }

  async deleteLibrary(name) {
    name = encodeURIComponent(name);
    return await this.delete(`/libraries/user/${this.username}/${name}`);
  }

  async publishLibrary(name) {
    name = encodeURIComponent(name);
    const response = await this.post(
      `/libraries/user/${this.username}/${name}/publish`,
    );
    return await response.json();
  }

  async unpublishLibrary(name) {
    name = encodeURIComponent(name);
    await this.post(`/libraries/user/${this.username}/${name}/unpublish`);
  }

  // Cloud: user messages (to be overridden)

  message(string) {
    alert(string);
  }

  // legacy api used by other sites using NetsBlox authentication
  async register(
    username: string,
    email: string,
  ) {
    return this.signup(
      username,
      undefined,
      email,
    );
  }

  async checkLogin() {
    try {
      await this.whoAmI();
      return true;
    } catch (err) {
      return false;
    }
  }

  async getProfile() {
    const profile = await this.viewUser();
    return profile;
  }

  static async connect(
    url: string,
    localize: (txt: string) => string,
  ): Promise<Cloud> {
    const opts = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(`${url}/configuration`, opts);
    const { clientId, username } = await response.json();
    return new Cloud(url, clientId, username, localize);
  }
}

class CloudError extends Error {
  label: string;

  constructor(label, message = undefined) {
    super(message || label);
    this.label = label;
  }
}
