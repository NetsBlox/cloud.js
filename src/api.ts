/**
 * A simple (stateless) TS API wrapper for the NetsBlox cloud.
 */

import { NetsBloxAuth, TokenAuth } from "./auth";
import { ConnectionRefusedError, RequestError } from "./error";
import { AuthorizedServiceHost } from "./types/AuthorizedServiceHost";
import { BannedAccount } from "./types/BannedAccount";
import { ClientId } from "./types/ClientId";
import { ClientInfo } from "./types/ClientInfo";
import { ClientStateData } from "./types/ClientStateData";
import { CollaborationInvite } from "./types/CollaborationInvite";
import { CreateGroupData } from "./types/CreateGroupData";
import { CreateLibraryData } from "./types/CreateLibraryData";
import { CreateProjectData } from "./types/CreateProjectData";
import { ExternalClient } from "./types/ExternalClient";
import { FriendInvite } from "./types/FriendInvite";
import { FriendLink } from "./types/FriendLink";
import { FriendLinkState } from "./types/FriendLinkState";
import { Group } from "./types/Group";
import { GroupId } from "./types/GroupId";
import { InvitationState } from "./types/InvitationState";
import { LibraryMetadata } from "./types/LibraryMetadata";
import { LinkedAccount } from "./types/LinkedAccount";
import { LoginRequest } from "./types/LoginRequest";
import { NetworkTraceMetadata } from "./types/NetworkTraceMetadata";
import { NewUser } from "./types/NewUser";
import { OccupantInvite } from "./types/OccupantInvite";
import { OccupantInviteData } from "./types/OccupantInviteData";
import { Project } from "./types/Project";
import { ProjectId } from "./types/ProjectId";
import { ProjectMetadata } from "./types/ProjectMetadata";
import { PublishState } from "./types/PublishState";
import { RoleData } from "./types/RoleData";
import { RoleId } from "./types/RoleId";
import { RoomState } from "./types/RoomState";
import { SendMessage } from "./types/SendMessage";
import { ServiceHost } from "./types/ServiceHost";
import { ServiceSettings } from "./types/ServiceSettings";
import { UpdateGroupData } from "./types/UpdateGroupData";
import { UpdateProjectData } from "./types/UpdateProjectData";
import { UpdateRoleData } from "./types/UpdateRoleData";
import { User } from "./types/User";

export default class NetsBloxApi {
  private baseUrl: string;
  private auth?: NetsBloxAuth;

  constructor(baseUrl: string, auth?: NetsBloxAuth) {
    this.baseUrl = baseUrl;
    this.auth = auth;
  }

  ////////////////////////////// Users //////////////////////////////
  async listUsers(): Promise<User[]> {
    return await this.fetchJson(`/users/`);
  }

  async createUser(userData: NewUser): Promise<User> {
    return await this.post(`/users/create`, userData);
  }

  async login(loginData: LoginRequest): Promise<User> {
    return await this.post(`/users/login`, loginData);
  }

  async logout(clientId?: ClientId): Promise<void> {
    let url = `/users/logout`;
    if (clientId) {
      url += `?clientId=${encodeURIComponent(clientId)}`;
    }
    return await this.post(url);
  }

  async whoami(): Promise<string> {
    return await this.fetchText("/users/whoami");
  }

  async banUser(username: string): Promise<BannedAccount> {
    return await this.post(`/users/${encodeURIComponent(username)}/ban`);
  }

  async unbanUser(username: string): Promise<BannedAccount> {
    return await this.post(`/users/${encodeURIComponent(username)}/unban`);
  }

  async deleteUser(username: string): Promise<User> {
    return await this.post(`/users/${encodeURIComponent(username)}/delete`);
  }

  async resetPassword(username: string): Promise<void> {
    const opts = { method: "post" };
    await this.fetch(`/users/${encodeURIComponent(username)}/password`, opts);
  }

  async setPassword(username: string, password: string): Promise<User> {
    const opts = { method: "patch", body: JSON.stringify(password) };
    return await this.fetchJson(
      `/users/${encodeURIComponent(username)}/password`,
      opts,
    );
  }

  async viewUser(username: string): Promise<User> {
    return await this.fetchJson(`/users/${encodeURIComponent(username)}`);
  }

  async linkAccount(username: string, account: LinkedAccount): Promise<User> {
    return await this.post(
      `/users/${encodeURIComponent(username)}/link`,
      account,
    );
  }

  async unlinkAccount(username: string, account: LinkedAccount): Promise<User> {
    return await this.post(
      `/users/${encodeURIComponent(username)}/unlink`,
      account,
    );
  }

  ////////////////////////////// Friends //////////////////////////////
  async listFriends(username: string): Promise<string[]> {
    return await this.fetchJson(`/friends/${encodeURIComponent(username)}/`);
  }

  async listOnlineFriends(username: string): Promise<string[]> {
    return await this.fetchJson(
      `/friends/${encodeURIComponent(username)}/online`,
    );
  }

  async unfriend(username: string, friend: string): Promise<boolean> {
    return await this.post(
      `/friends/${encodeURIComponent(username)}/unfriend/${
        encodeURIComponent(friend)
      }`,
    );
  }

  async block(username: string, friend: string): Promise<FriendLink> {
    return await this.post(
      `/friends/${encodeURIComponent(username)}/block/${
        encodeURIComponent(friend)
      }`,
    );
  }

  async unblock(username: string, friend: string): Promise<boolean> {
    return await this.post(
      `/friends/${encodeURIComponent(username)}/unblock/${
        encodeURIComponent(friend)
      }`,
    );
  }

  async listFriendInvites(username: string): Promise<FriendInvite[]> {
    return await this.fetchJson(
      `/friends/${encodeURIComponent(username)}/invites/`,
    );
  }

  async sendFriendInvite(
    username: string,
    recipient: string,
  ): Promise<FriendLinkState> {
    return await this.post(
      `/friends/${encodeURIComponent(username)}/invite`,
      recipient,
    );
  }

  async respondToFriendInvite(
    username: string,
    sender: string,
    state: FriendLinkState,
  ): Promise<FriendLink> {
    return await this.post(
      `/friends/${encodeURIComponent(username)}/invites/${
        encodeURIComponent(sender)
      }`,
      state,
    );
  }

  ////////////////////////////// Groups (Classes) //////////////////////////////
  async listGroups(owner: string): Promise<Group[]> {
    return await this.fetchJson(`/groups/user/${encodeURIComponent(owner)}`);
  }

  async createGroup(owner: string, data: CreateGroupData): Promise<Group> {
    return await this.post(`/groups/user/${encodeURIComponent(owner)}`, data);
  }

  async updateGroup(id: GroupId, data: UpdateGroupData): Promise<Group> {
    const opts = {
      method: "patch",
      body: JSON.stringify(data),
    };
    return await this.fetchJson(
      `/groups/id/${encodeURIComponent(id)}`,
      opts,
    );
  }

  async viewGroup(id: GroupId): Promise<Group> {
    return await this.fetchJson(`/groups/id/${encodeURIComponent(id)}`);
  }

  async deleteGroup(id: GroupId): Promise<Group> {
    const opts = { method: "delete" };
    return await this.fetchJson(`/groups/id/${encodeURIComponent(id)}`, opts);
  }

  async listMembers(id: GroupId): Promise<User[]> {
    return await this.fetchJson(`/groups/id/${encodeURIComponent(id)}/members`);
  }

  ////////////////////////////// Projects //////////////////////////////
  async createProject(data: CreateProjectData): Promise<ProjectMetadata> {
    const opts = {
      method: "post",
      body: JSON.stringify(data),
    };
    return await this.fetchJson(`/projects/`, opts);
  }

  async listSharedProjects(username: string): Promise<ProjectMetadata[]> {
    return await this.fetchJson(`/projects/shared/${username}`);
  }

  async listUserProjects(username: string): Promise<ProjectMetadata[]> {
    return await this.fetchJson(
      `/projects/user/${username}`,
    ) as ProjectMetadata[];
  }

  async listPublicProjects(): Promise<ProjectMetadata[]> {
    return await this.fetchJson(`/projects/public/`);
  }

  async getProjectNamed(owner: string, name: string): Promise<Project> {
    return await this.fetchJson(`/projects/user/${owner}/${name}`);
  }

  async getProjectNamedXml(owner: string, name: string): Promise<string> {
    return await this.fetchText(`/projects/user/${owner}/${name}/xml`);
  }

  async getProjectNamedMetadata(
    owner: string,
    name: string,
  ): Promise<ProjectMetadata> {
    return await this.fetchJson(`/projects/user/${owner}/${name}/metadata`);
  }

  async updateProject(
    id: ProjectId,
    updateData: UpdateProjectData,
  ): Promise<ProjectMetadata> {
    const opts = { method: "patch", body: JSON.stringify(updateData) };
    return await this.fetchJson(`/projects/id/${id}`, opts);
  }

  async deleteProject(
    id: ProjectId,
  ): Promise<ProjectMetadata> {
    const opts = { method: "delete" };
    return await this.fetchJson(`/projects/id/${id}`, opts);
  }

  async getProject(
    id: ProjectId,
  ): Promise<Project> {
    return await this.fetchJson(`/projects/id/${id}`);
  }

  async getLatestProject(
    id: ProjectId,
  ): Promise<Project> {
    return await this.fetchJson(`/projects/id/${id}/latest`);
  }

  async getProjectMetadata(
    id: ProjectId,
  ): Promise<ProjectMetadata> {
    return await this.fetchJson(`/projects/id/${id}/metadata`);
  }

  async getProjectXml(
    id: ProjectId,
  ): Promise<string> {
    return await this.fetchText(`/projects/id/${id}/xml`);
  }

  async publishProject(
    id: ProjectId,
  ): Promise<PublishState> {
    return await this.post(`/projects/id/${id}/publish`);
  }

  async unpublishProject(
    id: ProjectId,
  ): Promise<PublishState> {
    return await this.post(`/projects/id/${id}/unpublish`);
  }

  async listPendingProjects(): Promise<ProjectMetadata[]> {
    return await this.fetchJson(`/projects/mod/pending/`);
  }

  async setProjectState(
    id: ProjectId,
    state: PublishState,
  ): Promise<ProjectMetadata> {
    const opts = { method: "post", body: JSON.stringify(state) };
    return await this.fetchJson(`/projects/mod/id/${id}`, opts);
  }

  async createRole(
    projectId: ProjectId,
    roleData: CreateProjectData,
  ): Promise<ProjectMetadata> {
    const opts = { method: "post", body: JSON.stringify(roleData) };
    return await this.fetchJson(`/projects/id/${projectId}/`, opts);
  }

  async saveRole(
    projectId: ProjectId,
    roleId: RoleId,
    roleData: RoleData,
  ): Promise<ProjectMetadata> {
    const opts = { method: "post", body: JSON.stringify(roleData) };
    return await this.fetchJson(`/projects/id/${projectId}/${roleId}`, opts);
  }

  async renameRole(
    projectId: ProjectId,
    roleId: RoleId,
    updateData: UpdateRoleData,
  ): Promise<ProjectMetadata> {
    const opts = { method: "patch", body: JSON.stringify(updateData) };
    return await this.fetchJson(`/projects/id/${projectId}/${roleId}`, opts);
  }

  async getRole(projectId: ProjectId, roleId: RoleId): Promise<RoleData> {
    return await this.fetchJson(`/projects/id/${projectId}/${roleId}`);
  }

  async getLatestRole(projectId: ProjectId, roleId: RoleId): Promise<RoleData> {
    return await this.fetchJson(`/projects/id/${projectId}/${roleId}/latest`);
  }

  async deleteRole(
    projectId: ProjectId,
    roleId: RoleId,
  ): Promise<ProjectMetadata> {
    const opts = { method: "delete" };
    return await this.fetchJson(`/projects/id/${projectId}/${roleId}`, opts);
  }

  ////////////////////////////// Collaborators //////////////////////////////

  async listCollaborationInvites(
    receiver: string,
  ): Promise<CollaborationInvite[]> {
    return await this.fetchJson(`/collaboration-invites/user/${receiver}/`);
  }

  async inviteCollaborator(
    projectId: ProjectId,
    receiver: string,
  ): Promise<CollaborationInvite> {
    const opts = { method: "post" };
    return await this.fetchJson(
      `/collaboration-invites/${projectId}/invite/${receiver}`,
      opts,
    );
  }

  async respondToCollaboration(
    id: string,
    state: InvitationState,
  ): Promise<InvitationState> {
    const opts = { method: "post", body: JSON.stringify(state) };
    return await this.fetchJson(`/collaboration-invites/id/${id}`, opts);
  }

  async listCollaborators(projectId: ProjectId): Promise<string[]> {
    return await this.fetchJson(`/projects/id/${projectId}/collaborators`);
  }

  async removeCollaborator(
    projectId: ProjectId,
    collaborator: string,
  ): Promise<string[]> {
    const opts = { method: "delete" };
    return await this.fetchJson(
      `/projects/id/${projectId}/collaborators/${collaborator}`,
      opts,
    );
  }

  ////////////////////////////// Libraries //////////////////////////////
  async listCommunityLibraries(): Promise<LibraryMetadata[]> {
    return await this.fetchJson(`/libraries/community/`);
  }

  async listUserLibraries(owner: string): Promise<LibraryMetadata[]> {
    return await this.fetchJson(
      `/libraries/user/${encodeURIComponent(owner)}/`,
    );
  }

  async getUserLibrary(owner: string, name: string): Promise<string> {
    return await this.fetchText(
      `/libraries/user/${encodeURIComponent(owner)}/${
        encodeURIComponent(name)
      }`,
    );
  }

  async saveUserLibrary(
    owner: string,
    data: CreateLibraryData,
  ): Promise<LibraryMetadata> {
    return await this.post(
      `/libraries/user/${encodeURIComponent(owner)}/`,
      data,
    );
  }

  async deleteUserLibrary(
    owner: string,
    name: string,
  ): Promise<LibraryMetadata> {
    const opts = { method: "delete" };
    return await this.fetchJson(
      `/libraries/user/${encodeURIComponent(owner)}/${
        encodeURIComponent(name)
      }`,
      opts,
    );
  }

  async publishLibrary(
    owner: string,
    name: string,
  ): Promise<PublishState> {
    return await this.post(
      `/libraries/user/${encodeURIComponent(owner)}/${
        encodeURIComponent(name)
      }/publish`,
    );
  }

  async unpublishLibrary(
    owner: string,
    name: string,
  ): Promise<PublishState> {
    return await this.post(
      `/libraries/user/${encodeURIComponent(owner)}/${
        encodeURIComponent(name)
      }/unpublish`,
    );
  }

  async listPendingLibraries(): Promise<LibraryMetadata[]> {
    return await this.fetchJson(`/libraries/mod/pending`);
  }

  async setLibraryState(
    owner: string,
    name: string,
    state: PublishState,
  ): Promise<LibraryMetadata> {
    return await this.post(
      `/libraries/mod/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
      state,
    );
  }

  ////////////////////////////// Network //////////////////////////////
  async setClientState(
    clientId: ClientId,
    state: ClientStateData,
  ): Promise<string> {
    const opts = { method: "post", body: JSON.stringify(state) };
    return await this.fetchText(
      `/network/${encodeURIComponent(clientId)}/state`,
      opts,
    );
  }

  async getClientState(
    clientId: ClientId,
  ): Promise<ClientInfo> {
    return await this.fetchJson(`/network/${clientId}/state`);
  }

  async getRoomState(projectId: ProjectId): Promise<RoomState> {
    return await this.fetchJson(`/network/id/${projectId}`);
  }

  async getRooms(): Promise<ProjectId[]> {
    return await this.fetchJson(`/network/`);
  }

  async getExternalClients(): Promise<ExternalClient[]> {
    return await this.fetchJson(`/network/external`);
  }

  async inviteOccupant(
    projectId: ProjectId,
    data: OccupantInviteData,
  ): Promise<OccupantInvite> {
    return await this.post(`/network/id/${projectId}/occupants/invite`, data);
  }

  async evictOccupant(
    clientId: ClientId,
  ): Promise<RoomState> {
    return await this.post(`/network/clients/${clientId}/evict`);
  }

  async startNetworkTrace(
    projectId: ProjectId,
  ): Promise<NetworkTraceMetadata> {
    return await this.post(`/network/id/${projectId}/trace/`);
  }

  async stopNetworkTrace(
    projectId: ProjectId,
    traceId: string,
  ): Promise<NetworkTraceMetadata> {
    return await this.post(`/network/id/${projectId}/trace/${traceId}/stop`);
  }

  async getNetworkTraceMetadata(
    projectId: ProjectId,
    traceId: string,
  ): Promise<NetworkTraceMetadata> {
    return await this.fetchJson(`/network/id/${projectId}/trace/${traceId}`);
  }

  async getNetworkTrace(
    projectId: ProjectId,
    traceId: string,
  ): Promise<NetworkTraceMetadata> {
    return await this.fetchJson(
      `/network/id/${projectId}/trace/${traceId}/messages`,
    );
  }

  async deleteNetworkTrace(
    projectId: ProjectId,
    traceId: string,
  ): Promise<NetworkTraceMetadata> {
    const opts = { method: "delete" };
    return await this.fetchJson(
      `/network/id/${projectId}/trace/${traceId}`,
      opts,
    );
  }

  async sendMessage(msg: SendMessage): Promise<void> {
    await this.post("/network/messages/", msg);
  }

  ////////////////////////////// Service Hosts //////////////////////////////
  async listGroupHosts(id: GroupId): Promise<ServiceHost[]> {
    return await this.fetchJson(`/services/hosts/group/${id}`);
  }

  async setGroupHosts(
    id: GroupId,
    hosts: ServiceHost[],
  ): Promise<Group> {
    return await this.post(`/services/hosts/group/${id}`, hosts);
  }

  async listUserHosts(username: string): Promise<ServiceHost[]> {
    return await this.fetchJson(`/services/hosts/user/${username}`);
  }

  async setUserHosts(
    username: string,
    hosts: ServiceHost[],
  ): Promise<User> {
    return await this.post(`/services/hosts/user/${username}`, hosts);
  }

  async listAllHosts(username: string): Promise<ServiceHost[]> {
    return await this.fetchJson(`/services/hosts/all/${username}`);
  }

  async getAuthorizedHosts(): Promise<AuthorizedServiceHost[]> {
    return await this.fetchJson(`/services/hosts/authorized/`);
  }

  async authorizedHost(
    host: AuthorizedServiceHost,
  ): Promise<string> {
    return await this.post(`/services/hosts/authorized/`, host);
  }

  async unauthorizedHost(
    hostId: string,
  ): Promise<AuthorizedServiceHost[]> {
    const opts = { method: "delete" };
    return await this.fetchJson(`/services/hosts/authorized/${hostId}`, opts);
  }

  ////////////////////////////// Service Settings //////////////////////////////
  async listUserHostsWithSettings(
    username: string,
  ): Promise<string[]> {
    return await this.fetchJson(`/services/settings/user/${username}/`);
  }

  async getUserSettings(
    username: string,
    host: string,
  ): Promise<string> {
    return await this.fetchJson(`/services/settings/user/${username}/${host}`);
  }

  async setUserSettings(
    username: string,
    host: string,
    settings: string,
  ): Promise<void> {
    const opts = { method: "post", body: settings };
    await this.fetch(`/services/settings/user/${username}/${host}`, opts);
  }

  async deleteUserSettings(
    username: string,
    host: string,
  ): Promise<void> {
    const opts = { method: "delete" };
    await this.fetch(`/services/settings/user/${username}/${host}`, opts);
  }

  async listGroupHostsWithSettings(
    id: GroupId,
  ): Promise<string[]> {
    return await this.fetchJson(`/services/settings/group/${id}/`);
  }

  async getGroupSettings(
    id: GroupId,
    host: string,
  ): Promise<string> {
    return await this.fetchJson(`/services/settings/group/${id}/${host}`);
  }

  async setGroupSettings(
    id: GroupId,
    host: string,
    settings: string,
  ): Promise<void> {
    const opts = { method: "post", body: settings };
    await this.fetch(`/services/settings/group/${id}/${host}`, opts);
  }

  async deleteGroupSettings(
    id: GroupId,
    host: string,
  ): Promise<void> {
    const opts = { method: "delete" };
    await this.fetch(`/services/settings/group/${id}/${host}`, opts);
  }

  async getAllSettings(
    username: string,
    host: string,
  ): Promise<ServiceSettings> {
    return await this.fetchJson(
      `/services/settings/user/${username}/${host}/all`,
    );
  }

  ////////////////////////////// Helpers //////////////////////////////
  private async fetch(url: string, opts?: RequestInit) {
    opts = opts || {};
    url = this.baseUrl + url;
    opts.credentials = opts.credentials || "include";
    opts.headers = {
      "Content-Type": "application/json",
    };

    if (this.auth) {
      this.auth.inject(opts);
    }

    let response: Response;
    try {
      response = await fetch(url, opts);
    } catch (err) {
      const error = new ConnectionRefusedError(url);
      throw error;
    }

    if (!response.ok) {
      const error = await RequestError.from(response);
      throw error;
    }

    const cookieHeader = response.headers.get("set-cookie");
    if (cookieHeader) {
      const netsbloxCookie = response.headers.get("set-cookie").split(";").find(
        (chunk) => chunk.startsWith("netsblox="),
      );
      if (netsbloxCookie) {
        const token = netsbloxCookie.split("=").pop();
        this.auth = new TokenAuth(token);
      }
    }
    return response;
  }

  private async fetchJson(url: string, opts?: RequestInit): Promise<any> {
    const response = await this.fetch(url, opts);
    return await response.json();
  }

  private async fetchText(url: string, opts?: RequestInit): Promise<any> {
    const response = await this.fetch(url, opts);
    return await response.text();
  }

  private async post(url: string, data?: any): Promise<any> {
    const opts: { method: string; body?: string } = { method: "post" };
    if (data !== undefined) {
      opts.body = JSON.stringify(data);
    }
    return await this.fetchJson(url, opts);
  }
}
