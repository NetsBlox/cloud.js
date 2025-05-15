(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NetsBloxCloud = {}));
})(this, (function (exports) { 'use strict';

    class RequestError extends Error {
        static async from(response) {
            const message = await response.text() || response.statusText ||
                "An unknown error occurred. Please try again later.";
            const error = new RequestError(message);
            error.status = response.status;
            return error;
        }
    }
    class ConnectionRefusedError extends RequestError {
        constructor(url) {
            super(`Unable to connect to ${url}`);
        }
    }

    class TokenAuth {
        constructor(token) {
            this.token = token;
        }
        inject(opts) {
            opts.headers = opts.headers || {};
            opts.headers["cookie"] = `netsblox=${this.token}`;
        }
    }

    /**
     * A simple (stateless) TS API wrapper for the NetsBlox cloud.
     */
    class NetsBloxApi {
        constructor(baseUrl, auth) {
            this.baseUrl = baseUrl;
            this.auth = auth;
        }
        ////////////////////////////// Users //////////////////////////////
        async listUsers() {
            return await this.fetchJson(`/users/`);
        }
        async createUser(userData) {
            return await this.post(`/users/create`, userData);
        }
        /**
         * Email the given address with a list of all users registered with the given
         * email address.
         */
        async forgotUsername(email) {
            const url = `/users/forgot-username`;
            const opts = { method: "post", body: JSON.stringify(email) };
            await this.fetch(url, opts);
        }
        async login(loginData) {
            return await this.post(`/users/login`, loginData);
        }
        async logout(clientId) {
            let url = `/users/logout`;
            if (clientId) {
                url += `?clientId=${encodeURIComponent(clientId)}`;
            }
            return await this.post(url);
        }
        async whoami() {
            return await this.fetchText("/users/whoami");
        }
        async banUser(username) {
            return await this.post(`/users/${encodeURIComponent(username)}/ban`);
        }
        async unbanUser(username) {
            return await this.post(`/users/${encodeURIComponent(username)}/unban`);
        }
        async deleteUser(username) {
            return await this.post(`/users/${encodeURIComponent(username)}/delete`);
        }
        async resetPassword(username) {
            const opts = { method: "post" };
            await this.fetch(`/users/${encodeURIComponent(username)}/password`, opts);
        }
        async setPassword(username, password) {
            const opts = { method: "PATCH", body: JSON.stringify(password) };
            return await this.fetchJson(`/users/${encodeURIComponent(username)}/password`, opts);
        }
        async viewUser(username) {
            return await this.fetchJson(`/users/${encodeURIComponent(username)}`);
        }
        async linkAccount(username, account) {
            return await this.post(`/users/${encodeURIComponent(username)}/link`, account);
        }
        async unlinkAccount(username, account) {
            return await this.post(`/users/${encodeURIComponent(username)}/unlink`, account);
        }
        /**
         * Send a magic link to the given email address. Usable for any user associated with the
         * address.
         */
        async sendMagicLink(data) {
            const url = "/magic-links/";
            const opts = { method: "post", body: JSON.stringify(data) };
            await this.fetch(url, opts);
        }
        ////////////////////////////// Friends //////////////////////////////
        async listFriends(username) {
            return await this.fetchJson(`/friends/${encodeURIComponent(username)}/`);
        }
        async listOnlineFriends(username) {
            return await this.fetchJson(`/friends/${encodeURIComponent(username)}/online`);
        }
        async unfriend(username, friend) {
            return await this.post(`/friends/${encodeURIComponent(username)}/unfriend/${encodeURIComponent(friend)}`);
        }
        async block(username, friend) {
            return await this.post(`/friends/${encodeURIComponent(username)}/block/${encodeURIComponent(friend)}`);
        }
        async unblock(username, friend) {
            return await this.post(`/friends/${encodeURIComponent(username)}/unblock/${encodeURIComponent(friend)}`);
        }
        async listFriendInvites(username) {
            return await this.fetchJson(`/friends/${encodeURIComponent(username)}/invites/`);
        }
        async sendFriendInvite(username, recipient) {
            return await this.post(`/friends/${encodeURIComponent(username)}/invite/`, recipient);
        }
        async respondToFriendInvite(username, sender, state) {
            return await this.post(`/friends/${encodeURIComponent(username)}/invites/${encodeURIComponent(sender)}`, state);
        }
        ////////////////////////////// Groups (Classes) //////////////////////////////
        async listGroups(owner) {
            return await this.fetchJson(`/groups/user/${encodeURIComponent(owner)}/`);
        }
        async createGroup(owner, data) {
            return await this.post(`/groups/user/${encodeURIComponent(owner)}/`, data);
        }
        async updateGroup(id, data) {
            const opts = {
                method: "patch",
                body: JSON.stringify(data),
            };
            return await this.fetchJson(`/groups/id/${encodeURIComponent(id)}`, opts);
        }
        async viewGroup(id) {
            return await this.fetchJson(`/groups/id/${encodeURIComponent(id)}`);
        }
        async deleteGroup(id) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/groups/id/${encodeURIComponent(id)}`, opts);
        }
        async listMembers(id) {
            return await this.fetchJson(`/groups/id/${encodeURIComponent(id)}/members`);
        }
        async createAssignment(id, data) {
            return await this.post(`/groups/id/${encodeURIComponent(id)}/assignments/`, data);
        }
        async listGroupAssignments(id) {
            return await this.fetchJson(`/groups/id/${encodeURIComponent(id)}/assignments/`);
        }
        async viewAssignment(group_id, id) {
            return await this.fetchJson(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${id}/`);
        }
        async editAssignment(group_id, id, data) {
            const opts = {
                method: "patch",
                body: JSON.stringify(data),
            };
            return await this.fetchJson(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${id}/`, opts);
        }
        async deleteAssignment(group_id, id) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${encodeURIComponent(id)}/`, opts);
        }
        async createSubmission(group_id, id, data) {
            return await this.post(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${encodeURIComponent(id)}/submissions/`, data);
        }
        async viewSubmission(group_id, assignment_id, id) {
            return await this.fetchJson(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${encodeURIComponent(assignment_id)}/submissions/id/${encodeURIComponent(id)}/`);
        }
        async viewAssignmentSubmissions(group_id, assignment_id) {
            return await this.fetchJson(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${encodeURIComponent(assignment_id)}/submissions/`);
        }
        async viewUserSubmissions(group_id, assignment_id, username) {
            return await this.fetchJson(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${encodeURIComponent(assignment_id)}/submissions/user/${encodeURIComponent(username)}/`);
        }
        async viewSubmissionXml(group_id, assignment_id, id) {
            return await this.fetchText(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${encodeURIComponent(assignment_id)}/submissions/id/${encodeURIComponent(id)}/xml/`);
        }
        async deleteSubmission(group_id, assignment_id, id) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${encodeURIComponent(assignment_id)}/submissions/id/${encodeURIComponent(id)}/`, opts);
        }
        ////////////////////////////// Projects //////////////////////////////
        async createProject(data) {
            const opts = {
                method: "post",
                body: JSON.stringify(data),
            };
            return await this.fetchJson(`/projects/`, opts);
        }
        async listSharedProjects(username) {
            return await this.fetchJson(`/projects/shared/${username}`);
        }
        async listUserProjects(username) {
            return await this.fetchJson(`/projects/user/${username}`);
        }
        async listPublicProjects() {
            return await this.fetchJson(`/projects/public/`);
        }
        async getProjectNamed(owner, name) {
            return await this.fetchJson(`/projects/user/${owner}/${name}`);
        }
        async getProjectNamedXml(owner, name) {
            return await this.fetchText(`/projects/user/${owner}/${name}/xml`);
        }
        async getProjectThumbnail(id, aspectRatio) {
            const url = this.getProjectThumbnailPath(id, aspectRatio);
            return await this.fetch(url);
        }
        getProjectThumbnailPath(id, aspectRatio) {
            let url = `/projects/id/${id}/thumbnail`;
            if (aspectRatio) {
                url += `?aspectRatio=${aspectRatio}`;
            }
            return url;
        }
        getProjectThumbnailUrl(id, aspectRatio) {
            return this.baseUrl + this.getProjectThumbnailPath(id, aspectRatio);
        }
        async getProjectNamedMetadata(owner, name) {
            return await this.fetchJson(`/projects/user/${owner}/${name}/metadata`);
        }
        async updateProject(id, updateData) {
            const opts = { method: "patch", body: JSON.stringify(updateData) };
            return await this.fetchJson(`/projects/id/${id}`, opts);
        }
        async deleteProject(id) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/projects/id/${id}`, opts);
        }
        async getProject(id) {
            return await this.fetchJson(`/projects/id/${id}`);
        }
        async getLatestProject(id) {
            return await this.fetchJson(`/projects/id/${id}/latest`);
        }
        async getProjectMetadata(id) {
            return await this.fetchJson(`/projects/id/${id}/metadata`);
        }
        async getProjectXml(id) {
            return await this.fetchText(`/projects/id/${id}/xml`);
        }
        async publishProject(id) {
            return await this.post(`/projects/id/${id}/publish`);
        }
        async unpublishProject(id) {
            return await this.post(`/projects/id/${id}/unpublish`);
        }
        async listPendingProjects() {
            return await this.fetchJson(`/projects/mod/pending/`);
        }
        async setProjectState(id, state) {
            const opts = { method: "post", body: JSON.stringify(state) };
            return await this.fetchJson(`/projects/mod/id/${id}`, opts);
        }
        async createRole(projectId, roleData) {
            const opts = { method: "post", body: JSON.stringify(roleData) };
            return await this.fetchJson(`/projects/id/${projectId}/`, opts);
        }
        async saveRole(projectId, roleId, roleData) {
            const opts = { method: "post", body: JSON.stringify(roleData) };
            return await this.fetchJson(`/projects/id/${projectId}/${roleId}`, opts);
        }
        async renameRole(projectId, roleId, updateData) {
            const opts = { method: "patch", body: JSON.stringify(updateData) };
            return await this.fetchJson(`/projects/id/${projectId}/${roleId}`, opts);
        }
        async getRole(projectId, roleId) {
            return await this.fetchJson(`/projects/id/${projectId}/${roleId}`);
        }
        async getLatestRole(projectId, roleId) {
            return await this.fetchJson(`/projects/id/${projectId}/${roleId}/latest`);
        }
        async deleteRole(projectId, roleId) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/projects/id/${projectId}/${roleId}`, opts);
        }
        ////////////////////////////// Collaborators //////////////////////////////
        async listCollaborationInvites(receiver) {
            return await this.fetchJson(`/collaboration-invites/user/${receiver}/`);
        }
        async inviteCollaborator(projectId, receiver) {
            const opts = { method: "post" };
            return await this.fetchJson(`/collaboration-invites/${projectId}/invite/${receiver}`, opts);
        }
        async respondToCollaborationInvite(id, state) {
            const opts = { method: "post", body: JSON.stringify(state) };
            return await this.fetchJson(`/collaboration-invites/id/${id}`, opts);
        }
        async listCollaborators(projectId) {
            return await this.fetchJson(`/projects/id/${projectId}/collaborators/`);
        }
        async removeCollaborator(projectId, collaborator) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/projects/id/${projectId}/collaborators/${collaborator}`, opts);
        }
        ////////////////////////////// Libraries //////////////////////////////
        async listCommunityLibraries() {
            return await this.fetchJson(`/libraries/community/`);
        }
        async listUserLibraries(owner) {
            return await this.fetchJson(`/libraries/user/${encodeURIComponent(owner)}/`);
        }
        async getUserLibrary(owner, name) {
            return await this.fetchText(`/libraries/user/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
        }
        async saveUserLibrary(owner, data) {
            return await this.post(`/libraries/user/${encodeURIComponent(owner)}/`, data);
        }
        async deleteUserLibrary(owner, name) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/libraries/user/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, opts);
        }
        async publishLibrary(owner, name) {
            return await this.post(`/libraries/user/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/publish`);
        }
        async unpublishLibrary(owner, name) {
            return await this.post(`/libraries/user/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/unpublish`);
        }
        async listPendingLibraries() {
            return await this.fetchJson(`/libraries/mod/pending`);
        }
        async setLibraryState(owner, name, state) {
            return await this.post(`/libraries/mod/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, state);
        }
        ////////////////////////////// Network //////////////////////////////
        async setClientState(clientId, state) {
            const opts = { method: "post", body: JSON.stringify(state) };
            return await this.fetchText(`/network/${encodeURIComponent(clientId)}/state`, opts);
        }
        async getClientState(clientId) {
            return await this.fetchJson(`/network/${clientId}/state`);
        }
        async getRoomState(projectId) {
            return await this.fetchJson(`/network/id/${projectId}`);
        }
        async getRooms() {
            return await this.fetchJson(`/network/`);
        }
        async getExternalClients() {
            return await this.fetchJson(`/network/external`);
        }
        async inviteOccupant(projectId, data) {
            return await this.post(`/network/id/${projectId}/occupants/invite`, data);
        }
        async evictOccupant(clientId) {
            return await this.post(`/network/clients/${clientId}/evict`);
        }
        async startNetworkTrace(projectId) {
            return await this.post(`/network/id/${projectId}/trace/`);
        }
        async stopNetworkTrace(projectId, traceId) {
            return await this.post(`/network/id/${projectId}/trace/${traceId}/stop`);
        }
        async getNetworkTraceMetadata(projectId, traceId) {
            return await this.fetchJson(`/network/id/${projectId}/trace/${traceId}`);
        }
        async getNetworkTrace(projectId, traceId) {
            return await this.fetchJson(`/network/id/${projectId}/trace/${traceId}/messages`);
        }
        async deleteNetworkTrace(projectId, traceId) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/network/id/${projectId}/trace/${traceId}`, opts);
        }
        async sendMessage(msg) {
            await this.post("/network/messages/", msg);
        }
        ////////////////////////////// Service Hosts //////////////////////////////
        async listGroupHosts(id) {
            return await this.fetchJson(`/services/hosts/group/${id}`);
        }
        async setGroupHosts(id, hosts) {
            return await this.post(`/services/hosts/group/${id}`, hosts);
        }
        async listUserHosts(username) {
            return await this.fetchJson(`/services/hosts/user/${username}`);
        }
        async setUserHosts(username, hosts) {
            return await this.post(`/services/hosts/user/${username}`, hosts);
        }
        async listAllHosts(username) {
            return await this.fetchJson(`/services/hosts/all/${username}`);
        }
        async getAuthorizedHosts() {
            return await this.fetchJson(`/services/hosts/authorized/`);
        }
        async authorizedHost(host) {
            return await this.post(`/services/hosts/authorized/`, host);
        }
        async unauthorizedHost(hostId) {
            const opts = { method: "delete" };
            return await this.fetchJson(`/services/hosts/authorized/${hostId}`, opts);
        }
        ////////////////////////////// Service Settings //////////////////////////////
        async listUserHostsWithSettings(username) {
            return await this.fetchJson(`/services/settings/user/${username}/`);
        }
        async getUserSettings(username, host) {
            return await this.fetchJson(`/services/settings/user/${username}/${host}`);
        }
        async setUserSettings(username, host, settings) {
            const opts = { method: "post", body: settings };
            await this.fetch(`/services/settings/user/${username}/${host}`, opts);
        }
        async deleteUserSettings(username, host) {
            const opts = { method: "delete" };
            await this.fetch(`/services/settings/user/${username}/${host}`, opts);
        }
        async listGroupHostsWithSettings(id) {
            return await this.fetchJson(`/services/settings/group/${id}/`);
        }
        async getGroupSettings(id, host) {
            return await this.fetchJson(`/services/settings/group/${id}/${host}`);
        }
        async setGroupSettings(id, host, settings) {
            const opts = { method: "post", body: settings };
            await this.fetch(`/services/settings/group/${id}/${host}`, opts);
        }
        async deleteGroupSettings(id, host) {
            const opts = { method: "delete" };
            await this.fetch(`/services/settings/group/${id}/${host}`, opts);
        }
        async getAllSettings(username, host) {
            return await this.fetchJson(`/services/settings/user/${username}/${host}/all`);
        }
        ////////////////////////////// Helpers //////////////////////////////
        async fetch(url, opts) {
            opts = opts || {};
            url = this.baseUrl + url;
            opts.credentials = opts.credentials || "include";
            opts.headers = {
                "Content-Type": "application/json",
            };
            if (this.auth) {
                this.auth.inject(opts);
            }
            // Make sure the method is all caps as a workaround for:
            // https://stackoverflow.com/questions/34666680/fetch-patch-request-is-not-allowed
            opts.method = opts.method ? opts.method.toUpperCase() : "GET";
            let response;
            try {
                response = await fetch(url, opts);
            }
            catch (err) {
                const error = new ConnectionRefusedError(url);
                throw error;
            }
            if (!response.ok) {
                const error = await RequestError.from(response);
                throw error;
            }
            const cookieHeader = response.headers.get("set-cookie");
            if (cookieHeader) {
                const netsbloxCookie = response.headers.get("set-cookie").split(";").find((chunk) => chunk.startsWith("netsblox="));
                if (netsbloxCookie) {
                    const token = netsbloxCookie.split("=").pop();
                    this.auth = new TokenAuth(token);
                }
            }
            return response;
        }
        async fetchJson(url, opts) {
            const response = await this.fetch(url, opts);
            return await response.json();
        }
        async fetchText(url, opts) {
            const response = await this.fetch(url, opts);
            return await response.text();
        }
        async post(url, data) {
            const opts = { method: "post" };
            if (data !== undefined) {
                opts.body = JSON.stringify(data);
            }
            return await this.fetchJson(url, opts);
        }
    }

    const defaultLocalizer = (text) => text;
    const isNodeJs = typeof window === "undefined";
    var SaveState;
    (function (SaveState) {
        SaveState["Created"] = "Created";
        SaveState["Saved"] = "Saved";
        SaveState["Transient"] = "Transient";
        SaveState["Broken"] = "Broken";
    })(SaveState || (SaveState = {}));
    var PublishState;
    (function (PublishState) {
        PublishState["Private"] = "Private";
        PublishState["Public"] = "Public";
        PublishState["PendingApproval"] = "PendingApproval";
        PublishState["ApprovalDenied"] = "ApprovalDenied";
    })(PublishState || (PublishState = {}));
    class Cloud {
        constructor(url, clientId, username, localize = defaultLocalizer, groupId = null) {
            this.clientId = clientId;
            this.username = username;
            this.projectId = null;
            this.roleId = null;
            this.groupId = groupId;
            this.url = url;
            this.token = null; // only needed in NodeJs
            this.localize = localize;
            this.api = new NetsBloxApi(this.url);
        }
        clear() {
            this.username = null;
            this.groupId = null;
            this.token = null;
        }
        hasProtocol() {
            return this.url.toLowerCase().indexOf("http") === 0;
        }
        async resetPassword(username) {
            const response = await this.fetch(`/users/${username}/password`, {
                method: "POST",
            });
            return await response.text();
        }
        async login(username, password, remember, // TODO: use this...
        strategy = "NetsBlox") {
            const credentials = {};
            credentials[strategy] = { username, password };
            const body = {
                credentials,
                clientId: this.clientId,
            };
            const response = await this.post("/users/login", body);
            const user = await response.json();
            this.username = user.username;
            this.groupId = user.groupId;
            if (isNodeJs) {
                const cookie = response.headers.get("set-cookie");
                if (!cookie)
                    throw new CloudError("No cookie received");
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
        async changePassword(oldPW, newPW) {
            const body = JSON.stringify(newPW);
            const response = await this.fetch(`/users/${this.username}/password`, { method: "PATCH", body });
            return await response.text();
        }
        parseResponse(src) {
            var ans = [], lines;
            if (!src)
                return ans;
            lines = src.split(" ");
            lines.forEach(function (service) {
                var entries = service.split("&"), dict = {};
                entries.forEach(function (entry) {
                    var pair = entry.split("="), key = decodeURIComponent(pair[0]), val = decodeURIComponent(pair[1]);
                    dict[key] = val;
                });
                ans.push(dict);
            });
            return ans;
        }
        parseDict(src) {
            var dict = {};
            if (!src)
                return dict;
            src.split("&").forEach(function (entry) {
                var pair = entry.split("="), key = decodeURIComponent(pair[0]), val = decodeURIComponent(pair[1]);
                dict[key] = val;
            });
            return dict;
        }
        encodeDict(dict) {
            var str = "", pair, key;
            if (!dict)
                return null;
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
            return await response.json();
        }
        async saveRole(roleData) {
            const url = `/projects/id/${this.projectId}/${this.roleId}`;
            const options = {
                method: "POST",
                body: JSON.stringify(roleData),
            };
            const response = await this.fetch(url, options);
            return await response.json();
        }
        async renameRole(roleId, name) {
            const body = {
                name,
                clientId: this.clientId,
            };
            await this.patch(`/projects/id/${this.projectId}/${roleId}`, body);
            // TODO: error handling
            //return await response.json();
        }
        async renameProject(name) {
            const body = {
                name,
                clientId: this.clientId,
            };
            const response = await this.patch(`/projects/id/${this.projectId}`, body);
            return await response.json();
        }
        async reportLatestRole(id, data) {
            const clientId = this.clientId;
            const options = {
                method: "POST",
                body: JSON.stringify({ id, data }),
            };
            await this.fetch(`/projects/id/${this.projectId}/${this.roleId}/latest?clientId=${clientId}`, options);
        }
        async cloneRole(roleId) {
            const projectId = this.projectId;
            const fetchRoleResponse = await this.fetch(`/projects/id/${projectId}/${roleId}/latest`);
            const { name, code, media } = await fetchRoleResponse.json();
            await this.post(`/projects/id/${projectId}/`, {
                name,
                code,
                media,
            });
        }
        async sendOccupantInvite(username, roleId) {
            const body = { username, roleId };
            await this.post(`/network/id/${this.projectId}/occupants/invite`, body);
        }
        async evictOccupant(clientID) {
            await this.post(`/network/clients/${clientID}/evict`);
        }
        async getCollaboratorList() {
            const response = await this.get(`/projects/id/${this.projectId}/collaborators/`);
            return await response.json();
        }
        async getCollaboratorRequestList() {
            const response = await this.get(`/collaboration-invites/user/${this.username}/`);
            return await response.json();
        }
        async sendCollaborateRequest(projectId, username) {
            await this.post(`/collaboration-invites/${projectId}/invite/${username}`);
        }
        async respondToCollaborateRequest(id, accepted) {
            const newState = accepted ? "Accepted" : "Rejected";
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
            const response = await this.fetch(`/projects/id/${projectId}/${roleId}/latest?${qs}`);
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
            const response = await this.fetch(`/projects/user/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
            return await response.json();
        }
        async getProjectMetadataByName(owner, name) {
            const response = await this.fetch(`/projects/user/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/metadata`);
            return await response.json();
        }
        async startNetworkTrace(projectId) {
            const response = await this.post(`/network/id/${projectId}/trace/`);
            return await response.text();
        }
        async stopNetworkTrace(projectId, traceId) {
            const response = await this.post(`/network/id/${projectId}/trace/${traceId}/stop`);
            return await response.text();
        }
        async getNetworkTrace(projectId, traceId) {
            const response = await this.fetch(`/network/id/${projectId}/trace/${traceId}`);
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
            const response = await this.post(`/projects/id/${projectId}/publish`);
            return response.json();
        }
        async unpublishProject(projectId) {
            const response = await this.post(`/projects/id/${projectId}/unpublish`);
            return response.json();
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
        async signup(username, password, email) {
            const body = {
                username,
                password,
                email,
            };
            const response = await this.post("/users/create", body);
            return await response.text();
        }
        async saveProjectCopy() {
            const currentProject = await this.getProjectData(this.projectId);
            const projectData = {
                name: currentProject.name,
                saveState: SaveState.Saved,
                roles: Object.values(currentProject.roles),
            };
            return await this.importProject(projectData);
        }
        async patch(url, body = undefined) {
            const opts = {
                method: "PATCH",
            };
            if (body !== undefined) {
                opts.body = JSON.stringify(body);
            }
            return await this.fetch(url, opts);
        }
        async post(url, body = undefined) {
            const opts = {
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
        /**
         * RAII-style API usage where the error handler is called on exception.
         */
        async callApi(fn) {
            try {
                return await fn(this.api);
            }
            catch (err) {
                this.onerror(err);
                throw err;
            }
        }
        async fetch(url, opts) {
            opts = opts || {};
            url = this.url + url;
            opts.credentials = opts.credentials || "include";
            opts.headers = {
                "Content-Type": "application/json",
            };
            if (this.token) {
                opts.headers["cookie"] = `netsblox=${this.token}`;
            }
            let response;
            try {
                response = await fetch(url, opts);
            }
            catch (err) {
                const error = new ConnectionRefusedError(url);
                this.onerror(error);
                throw error;
            }
            if (!response.ok) {
                const error = await RequestError.from(response);
                this.onerror(error);
                throw error;
            }
            return response;
        }
        onerror(err) {
            console.error(err);
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
            var newProjectRequest = this.newProjectRequest || Promise.resolve();
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
        async unlinkAccount(account) {
            await this.post(`/users/${this.username}/unlink`, account);
        }
        async getProjectData(projectId = this.projectId) {
            const response = await this.fetch(`/projects/id/${projectId}/latest?clientId=${this.clientId}`);
            return await response.json();
        }
        async exportRole(projectId = this.projectId, roleId = this.roleId) {
            const response = await this.fetch(`/projects/id/${projectId}/${roleId}/latest?clientId=${this.clientId}`);
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
            const response = await this.post(`/libraries/user/${this.username}/`, library);
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
            const response = await this.post(`/libraries/user/${this.username}/${name}/publish`);
            return await response.json();
        }
        async unpublishLibrary(name) {
            name = encodeURIComponent(name);
            await this.post(`/libraries/user/${this.username}/${name}/unpublish`);
        }
        async listGroupAssignments() {
            const response = await this.fetch(`/groups/id/${encodeURIComponent(this.groupId)}/assignments/`);
            return await response.json();
        }
        async saveSubmission(assignmentId, xml) {
            const body = { owner: this.username, xml: xml };
            const response = await this.post(`/groups/id/${encodeURIComponent(this.groupId)}/assignments/id/${encodeURIComponent(assignmentId)}/submissions/`, body);
            return await response.json();
        }
        async viewSubmissionXml(group_id, assignment_id, id) {
            const response = await this.fetch(`/groups/id/${encodeURIComponent(group_id)}/assignments/id/${encodeURIComponent(assignment_id)}/submissions/id/${encodeURIComponent(id)}/xml/`);
            return await response.text();
        }
        // Cloud: user messages (to be overridden)
        message(string) {
            alert(string);
        }
        // legacy api used by other sites using NetsBlox authentication
        async register(username, email) {
            return this.signup(username, undefined, email);
        }
        async checkLogin() {
            try {
                await this.whoAmI();
                return true;
            }
            catch (err) {
                return false;
            }
        }
        async getProfile() {
            const profile = await this.viewUser();
            return profile;
        }
    }
    class CloudError extends Error {
        constructor(label, message = undefined) {
            super(message || label);
            this.label = label;
        }
    }

    exports.CloudClient = Cloud;
    exports.NetsBloxApi = NetsBloxApi;

}));
