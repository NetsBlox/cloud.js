(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.NetsBloxApi = factory());
})(this, (function () { 'use strict';

    class TokenAuth {
        constructor(token) {
            this.token = token;
        }
        inject(opts) {
            opts.headers = opts.headers || {};
            opts.headers["cookie"] = `netsblox=${this.token}`;
        }
    }

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

    return NetsBloxApi;

}));
