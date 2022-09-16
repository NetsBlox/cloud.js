require('isomorphic-fetch');
const assert = require('assert');

const defaultLocalizer = text => text;
const isNodeJs = typeof window === 'undefined';

class Cloud {
    constructor(url, clientId, username, localize=defaultLocalizer) {
        this.clientId = clientId;
        this.username = username;
        this.projectId = null;
        this.roleId = null;
        this.url = url;
        this.token = null;  // only needed in NodeJs
    }

    clear() {
        this.username = null;
        this.token = null;
    }

    hasProtocol() {
        return this.url.toLowerCase().indexOf('http') === 0;
    }

    async getPublicProject(
        id,
    ) {
        // id is Username=username&projectName=projectname,
        // where the values are url-component encoded
        // callBack is a single argument function, errorCall take two args
        // FIXME: update this to use fetch
        const deferred = utils.defer();
        const request = new XMLHttpRequest();

        try {
            request.open(
                "GET",
                (this.hasProtocol() ? '' : 'http://')
                    + this.url + 'RawPublic'
                    + '?'
                    + id,
                true
            );
            request.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded"
            );
            request.withCredentials = true;
            request.onreadystatechange = () => {
                if (request.readyState === 4) {
                    if (request.responseText) {
                        if (request.responseText.indexOf('ERROR') === 0) {
                            deferred.reject(new Error(request.responseText));
                        } else {
                            deferred.resolve(request.responseText);
                        }
                    } else {
                        deferred.reject(new Error(this.localize('could not connect to:') + this.url));
                    }
                }
            };
            request.send(null);
        } catch (err) {
            deferred.reject(err);
        }
        return deferred.promise;
    };

    async resetPassword(username) {
        const response = await this.fetch(`/api/users/${username}/password`, {method: 'POST'});
        return await response.text();
    };

    async login(
        username,
        password,
        remember,  // TODO: use this...
        strategy = 'NetsBlox',
    ) {
        const credentials = {};
        credentials[strategy] = {username, password};
        const body = {
            credentials,
            clientId: this.clientId,
        };
        const response = await this.post('/users/login', body);
        this.username = await response.text();
        if (isNodeJs) {
            const cookie = response.headers.get('set-cookie');
            assert(cookie, new CloudError('No cookie received'));
            this.token = cookie.split('=')[1].split(';').shift();
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
        const body = JSON.stringify({
            username: this.username,
            password_hash: newPW,
        });
        const response = await this.fetch(
            `/users/${this.username}/password`,
            {method: 'PATCH', body}
        );
        return await response.text();
    }

    parseResponse(src) {
        var ans = [],
            lines;
        if (!src) {return ans; }
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
    };

    parseDict(src) {
        var dict = {};
        if (!src) {return dict; }
        src.split("&").forEach(function (entry) {
            var pair = entry.split("="),
                key = decodeURIComponent(pair[0]),
                val = decodeURIComponent(pair[1]);
            dict[key] = val;
        });
        return dict;
    };

    encodeDict(dict) {
        var str = '',
            pair,
            key;
        if (!dict) {return null; }
        for (key in dict) {
            if (dict.hasOwnProperty(key)) {
                pair = encodeURIComponent(key)
                    + '='
                    + encodeURIComponent(dict[key]);
                if (str.length > 0) {
                    str += '&';
                }
                str += pair;
            }
        }
        return str;
    };

    async getUserData() {
        const response = await this.fetch(`/users/${this.username}`);
        return await response.json();
    };

    async addRole(name) {
        const response = await this.post(`/projects/id/${this.projectId}/`, {name});
        // TODO: should I request the new project state, too?
        // I shouldn't have to since we should be subscribed to changes...
        //return await response.json();
    };

    async saveRole(roleData) {

        const url = `/projects/id/${this.projectId}/${this.roleId}`;
        const options = {
            method: 'POST',
            body: JSON.stringify(roleData),
        };
        await this.fetch(url, options);
    };

    async renameRole(roleId, name) {
        const body = {
            name,
            clientId: this.clientId,
        };
        const response = await this.patch(`/projects/id/${this.projectId}/${roleId}`, body);
        // TODO: error handling
        //return await response.json();
    };

    async renameProject(name) {
        const body = {
            name,
            clientId: this.clientId,
        };
        const response = await this.patch(`/projects/id/${this.projectId}`, body);
    };

    async reportLatestRole(id, data) {
        const clientId = this.clientId;
        const options = {
            method: 'POST',
            body: JSON.stringify({id, data})
        };
        await this.fetch(`/projects/id/${this.projectId}/${this.roleId}/latest?clientId=${clientId}`, options);
    };

    async cloneRole(roleId) {
        const projectId = this.projectId;
        const fetchRoleResponse = await this.fetch(`/projects/id/${projectId}/${roleId}/latest`);
        const {name, code, media} = await fetchRoleResponse.json();
        const response = await this.post(`/projects/id/${projectId}/`, {name, code, media});
    };

    async inviteOccupant(username, roleId) {
        const body = {username, roleId};
        await this.post(`/network/id/${this.projectId}/occupants/invite`, body);
    };

    async inviteToCollaborate(username) {
        const options = {
            method: 'POST',
            body: JSON.stringify({
                sender: this.username,
                projectId: this.projectId,
            })
        };
        const response = await this.fetch(`/collaboration-invites/${username}`, options);
        return await response.json();
    };

    async respondToCollaborationInvite(id, accepted) {
        const options = {
            method: 'POST',
            body: JSON.stringify({
                response: accepted
            })
        };
        const response = await this.fetch(`/collaboration-invites/${this.username}/${id}`, options);
        return await response.json();
    };

    async addCollaborator(projectId, username) {
        const response = await this.post(
            `/collaboration-invites/${projectId}/invite/${username}`,
            {username}
        );
        return await response.json();
    };

    async removeCollaborator(username, projectId) {
        const options = {
            method: 'DELETE',
        };
        await this.fetch(`/projects/id/${projectId}/collaborators/${username}`, options);
    };

    async getFriendList() {
        const response = await this.fetch(`/friends/${this.username}/online`);
        return await response.json();
    };

    async getRole(projectId, roleId) {
        const response = await this.fetch(`/projects/id/${projectId}/${roleId}/latest`);
        const project = await response.json();
        // TODO: Set the state here?
        this.setLocalState(projectId, roleId);
        return project;
    };

    async getProjectMetadata(projectId) {
        const response = await this.fetch(`/projects/id/${projectId}/metadata`);
        const project = await response.json();
        return project;
    };

    async getProjectByName(owner, name) {
        const response = await this.fetch(`/projects/user/${owner}/${name}`);
        // FIXME: This is returning an empty response sometimes
        const project = await response.json();
        this.setLocalState(project.ProjectID, project.RoleID);
        console.assert(project.ProjectID, 'Response does not have a project ID');
        return project;
    };

    async startNetworkTrace(projectId) {
        const response = await this.post(`/network/id/${projectId}/trace/`);
        return await response.text();
    };

    async stopNetworkTrace(projectId, traceId) {
        const response = await this.post(`/network/id/${projectId}/trace/${traceId}/stop`);
        return await response.text();
    };

    async getNetworkTrace(projectId, traceId) {
        const response = await this.fetch(`/network/id/${projectId}/trace/${traceId}`);
        return await response.json();
    };

    async getCollaboratorList() {
        const [friends, collaborators] = Promise.all(
            [
                this.fetch(`/friends/${this.username}/`),
                this.fetch(`/projects/${this.projectId}/collaborators`)
            ]
            .map(responseP => responseP.then(response => response.json()))
        );
        return friends.map(username => ({
            username,
            collaborating: collaborators.includes(username),
        }));
    };

    async deleteRole(roleId) {
        const method = 'DELETE';
        await this.fetch(`/projects/id/${this.projectId}/${roleId}`, {method});
    };

    async evictUser(clientID) {
        const method = 'DELETE';
        await this.fetch(`/network/id/${this.projectdId}/occupants/${clientID}`, {method});
    };

    async deleteProject(projectId) {
        const method = 'DELETE';
        await this.fetch(`/projects/id/${projectId}`, {method});
    };

    async publishProject(projectId) {
        const method = 'POST';
        await this.fetch(`/projects/id/${projectId}/publish`, {method});
    };

    async unpublishProject(projectId) {
        const method = 'POST';
        await this.fetch(`/projects/id/${projectId}/unpublish`, {method});
    };

    reconnect(callback, errorCall) {
        if (!this.username) {
            this.message('You are not logged in');
            return;
        }

        // need to set 'api' from setClientState
        let promise = this.setClientState();
        if (callback && errorCall) {
            promise = promise.then(callback)
                .catch(errorCall);
        }
        return promise;
    };

    async logout() {
        const method = 'POST';
        await this.fetch('/users/logout', {method});
        this.clear();
        return true;
    };

    async signup(
        username,
        email,
    ) {
        const body = {
            username,
            email,
        };
        const response = await this.post('/users/create', body);
    };

    async saveProjectCopy() {
        const response = await this.fetch(`/projects/${this.projectId}/latest`);
        const xml = await response.text();
        const options = {
            method: 'POST',
            body: xml,  // TODO: add options for allow rename?
        };
        const saveResponse = await this.fetch(`/projects/`, options);

        // TODO: set the state with the network overlay
        //this.setLocalState(response.projectId, this.roleId);

        return saveResponse.status == 200;
    };

    async patch(url, body) {
        const opts = {
            method: 'PATCH',
        };
        if (body !== undefined) {
            opts.body = JSON.stringify(body);
        }
        return await this.fetch(url, opts);
    };

    async post(url, body) {
        const opts = {
            method: 'POST',
        };
        if (body !== undefined) {
            opts.body = JSON.stringify(body);
        }
        return await this.fetch(url, opts);
    };

    async get(url) {
        const opts = {
            method: 'GET',
        };
        return await this.fetch(url, opts);
    };

    async fetch(url, opts={}) {
        url = this.url + url;
        opts.credentials = opts.credentials || 'include';
        opts.headers = opts.headers || {};
        opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';
        if (this.token) {
            opts.headers.cookie = `netsblox=${this.token}`;
        }
        const response = await fetch(url, opts);
        if (response.status > 399) {
            const text = await response.text();
            const error = new CloudError(text);
            await this.onerror(error);
            throw error;
        }
        return response;
    }

    async onerror(response) {
        const text = await response.text();
        throw new CloudError(text);
    }

    setLocalState(projectId, roleId) {
        this.projectId = projectId;
        this.roleId = roleId;
    };

    resetLocalState() {
        this.setLocalState(null, null);
    };

    newProject(name=this.localize('untitled')) {
        var myself = this;

        if (!this.newProjectRequest) {
            const saveResponse = this.post(`/projects/`, {name, clientId: this.clientId});
            this.newProjectRequest = saveResponse
                .then(response => response.json())
                .then(async result => {
                    this.setClientState(result.projectId, result.roleId);
                    myself.newProjectRequest = null;
                    return result;
                })
                .catch(function(req) {
                    myself.resetLocalState();
                    myself.newProjectRequest = null;
                    throw new Error(req.responseText);
                });
        }

        return this.newProjectRequest;
    };

    getClientState() {
        return {
            username: this.username,
            clientId: this.clientId,
            projectId: this.projectId,
            roleId: this.roleId
        };
    };

    async setClientState(projectId=this.projectId, roleId=this.roleId) {
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
                        }
                    }
                };
                await this.post(`/network/${this.clientId}/state`, body);
                // Only change the project ID if no other moves/newProjects/etc have occurred
            })
            .catch(function(req) {
                var connError = 'Could not connect to ' + myself.url;
                throw new Error(req.responseText || connError);
            });
    };

    setProjectName(name) {
        const newProjectRequest = this.newProjectRequest || Promise.resolve();


        return newProjectRequest
            .then(async () => {
                await this.patch(`/projects/id/${this.projectId}`, {name, clientId: this.clientId});
            });
    };

    async importProject(projectData) {
        projectData.clientId = this.clientId;

        const response = await this.post('/projects/', projectData);
        return await response.json();
    };

    async linkAccount(username, password, type) {
        await this.request(`/api/v2/link/${this.username}/${type}`, {username, password});
    };

    async unlinkAccount(account) {
        await this.request(`/api/v2/unlink/${this.username}`, account);
    };

    async getProjectData(projectId=this.projectId) {
        const response = await this.fetch(`/projects/id/${projectId}/latest?clientId=${this.clientId}`);
        return await response.json();
    };

    async exportRole(projectId=this.projectId, roleId=this.roleId) {
        const response = await this.fetch(`/projects/id/${projectId}/${roleId}/latest?clientId=${this.clientId}`);
        return await response.text();
    };

    async viewUser(username=this.username) {
        const response = await this.fetch(`/users/${username}`);
        return await response.json();
    }

    async whoAmI() {
        const response = await this.get('/users/whoami');
        return await response.text();
    }

    // Cloud: user messages (to be overridden)

    message(string) {
        alert(string);
    }

    // TODO: legacy api used by other sites using NetsBlox authentication
    async register() {
        return this.signup(...arguments);
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
}

class CloudError extends Error {
    constructor(label, message) {
        super(message || label);
        this.label = label;
    }
}

module.exports = Cloud;
