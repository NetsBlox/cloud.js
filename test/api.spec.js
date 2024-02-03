/**
 * Tests for the NetsBlox API.
 *
 * These are intended to be tests for the client wrapper - not integration tests.
 * They do not check that the server did the correct thing; just that the client
 * deserialized the correct response (ie, that the return type is correct)
 */
const { NetsBloxApi } = require("..");
const assert = require("assert/strict");

const api = new NetsBloxApi("http://127.0.0.1:7777");

describe("api", function () {
  beforeEach(async () => {
    const credentials = {
      NetsBlox: {
        username: "admin",
        password: "somePassword",
      },
    };
    await api.login({ credentials });
  });

  describe("users", function () {
    it("should list users", async function () {
      const users = await api.listUsers();
      assert(users.find((user) => user.username === "admin"));
    });

    it("should support 'forgot username' endpoint", async function () {
      try {
        await api.forgotUsername('admin@netsblox.org');
      } catch (err) {
        // This will throw an error since email is not configured on the server.
        // That's ok though since we just need to make sure it wasn't an error w/
        // the request
        
        assert(err.status > 499);
      }
    });

    it("should create users", async function () {
      const username = `testCreateUser`;
      const email = "noreply@netsblox.org";
      const userData = { username, email };
      const user = await api.createUser(userData);
      assert.equal(user.username, username);
    });

    it("should check username with whoami", async function () {
      const username = await api.whoami();
      assert.equal(username, "admin");
    });

    it("should view user", async function () {
      const user = await api.viewUser("admin");
      assert.equal(user.username, "admin");
    });

    it("should ban user", async function () {
      const username = `testBanUser`;
      const email = "banned@netsblox.org";
      const userData = { username, email };
      await api.createUser(userData);
      const acct = await api.banUser(username);
      assert.equal(acct.username, username);
    });

    it("should unban user", async function () {
      const username = `testUnbanUser`;
      const email = "testUnban@netsblox.org";
      const userData = { username, email };
      await api.createUser(userData);

      await api.banUser(username);
      const acct = await api.unbanUser(username);
      assert.equal(acct.username, username);
    });

    it("should delete user", async function () {
      const username = `testDeleteUser`;
      const email = "noreply@netsblox.org";
      const userData = { username, email };
      await api.createUser(userData);
      const user = await api.deleteUser(username);
      assert.equal(user.username, username);
    });

    it("should set password", async function () {
      const username = `testSetPassword`;
      const email = "noreply@netsblox.org";
      const userData = { username, email };
      await api.createUser(userData);

      const password = "myPassword";
      await api.setPassword(username, password);
      await api.login({ credentials: { NetsBlox: { username, password } } });
    });
  });

  describe("friends", function () {
    it("should send/accept/list/unfriend friends", async function () {
      const friend = "testFriend";
      await ensureUserExists(api, friend);

      // send
      const linkState = await api.sendFriendInvite("admin", friend);
      assert.equal(linkState, "Pending");

      // list invites
      const invites = await api.listFriendInvites(friend);
      assert.equal(invites.length, 1);
      assert.equal(invites[0].sender, "admin");

      // accept
      const link = await api.respondToFriendInvite(friend, "admin", "Approved");
      assert.equal(link.state, "Approved");

      // list
      const friends = await api.listFriends(friend);
      assert(friends.includes("admin"));

      // unfriend
      const success = await api.unfriend("admin", friend);
      assert(success);
    });

    it("should block/unblock users", async function () {
      const friend = "testBlockUser";
      await ensureUserExists(api, friend);

      // block
      const link = await api.block("admin", friend);
      assert.equal(link.state, "Blocked");

      // unblock
      const success = await api.unblock("admin", friend);
      assert(success);
    });
  });

  describe("groups", function () {
    it("should create group", async function () {
      const data = { name: "createGroup" };
      const group = await api.createGroup("admin", data);
      assert.equal(group.name, data.name);
    });

    it("should list groups", async function () {
      const data = { name: "listGroups" };
      await api.createGroup("admin", data);
      const groups = await api.listGroups("admin", data);
      assert(groups.some((g) => g.name === data.name));
    });

    it("should update group", async function () {
      const data = { name: "updateGroup" };
      const group = await api.createGroup("admin", data);
      const newName = "someNewNameAfterUpdate";
      const newGroup = await api.updateGroup(group.id, { name: newName });
      assert.equal(newGroup.name, newName);
    });

    it("should view group", async function () {
      const data = { name: "viewGroup" };
      const groupId = (await api.createGroup("admin", data)).id;
      const group = await api.viewGroup(groupId);
      assert.equal(group.id, groupId);
    });

    it("should delete group", async function () {
      const data = { name: "deleteGroup" };
      const groupId = (await api.createGroup("admin", data)).id;
      const group = await api.deleteGroup(groupId);
      assert.equal(group.id, groupId);
    });

    it("should list group members", async function () {
      const data = { name: "listMembers" };
      const groupId = (await api.createGroup("admin", data)).id;
      const userData = {
        username: "listGroupMembers",
        email: "noreply@netsblox.org",
        groupId,
      };
      const user = await api.createUser(userData);
      const members = await api.listMembers(groupId);
      assert.equal(members.length, 1);
      assert(members[0].username, userData.username);
    });
  });

  describe("projects", function () {
    it("should create a project", async function () {
      const data = { name: "someProject" };
      const metadata = await api.createProject(data);
      assert.equal(metadata.owner, "admin");
    });

    it("should create a role", async function () {
      const data = { name: "someProject" };
      const metadata = await api.createProject(data);
      assert.equal(metadata.owner, "admin");

      const roleData = {
        name: "someRole",
        code: "<code/>",
        media: "<media/>",
      };
      const newMetadata = await api.createRole(metadata.id, roleData);
      assert(
        Object.values(newMetadata.roles).some((role) =>
          role.name === roleData.name
        ),
      );
    });

    it("should save role", async function () {
      const data = {
        name: "someProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
        ],
      };
      const metadata = await api.createProject(data);
      assert.equal(metadata.owner, "admin");

      const newRoleData = {
        name: "NEW NAME",
        code: "<code/>",
        media: "<media/>",
      };
      const roleId = Object.keys(metadata.roles).pop();
      const newMetadata = await api.saveRole(metadata.id, roleId, newRoleData);
      assert(
        Object.values(newMetadata.roles).some((role) =>
          role.name === newRoleData.name
        ),
      );
    });

    it("should rename role", async function () {
      const data = {
        name: "someProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
        ],
      };
      const metadata = await api.createProject(data);
      assert.equal(metadata.owner, "admin");

      const name = "NEW NAME";
      const roleId = Object.keys(metadata.roles).pop();
      const newMetadata = await api.renameRole(
        metadata.id,
        roleId,
        { name },
      );
      assert(
        Object.values(newMetadata.roles).some((role) => role.name === name),
      );
    });

    it("should get role", async function () {
      const data = {
        name: "someProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
        ],
      };
      const metadata = await api.createProject(data);
      assert.equal(metadata.owner, "admin");

      const roleId = Object.keys(metadata.roles).pop();
      const roleData = await api.getRole(
        metadata.id,
        roleId,
      );
      assert.equal(roleData.name, "someRole");
      assert.equal(roleData.code, "<code/>");
      assert.equal(roleData.media, "<media/>");
    });

    it("should get latest role", async function () {
      const data = {
        name: "someProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
        ],
      };
      const metadata = await api.createProject(data);
      assert.equal(metadata.owner, "admin");

      const roleId = Object.keys(metadata.roles).pop();
      const roleData = await api.getLatestRole(
        metadata.id,
        roleId,
      );
      assert.equal(roleData.name, "someRole");
      assert.equal(roleData.code, "<code/>");
      assert.equal(roleData.media, "<media/>");
    });

    it("should delete role", async function () {
      const data = {
        name: "someProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
      };
      const metadata = await api.createProject(data);
      assert.equal(metadata.owner, "admin");

      const roleId = Object.keys(metadata.roles).pop();
      const newMetadata = await api.deleteRole(
        metadata.id,
        roleId,
      );
      assert.equal(Object.keys(newMetadata.roles).length, 1);
    });

    it("should get metadata", async function () {
      const data = {
        name: "someProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
      };
      const projectId = (await api.createProject(data)).id;
      const metadata = await api.getProjectMetadata(projectId);
      assert.equal(metadata.id, projectId);
    });

    it("should get xml", async function () {
      const data = {
        name: "someProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
      };
      const projectId = (await api.createProject(data)).id;
      const xml = await api.getProjectXml(projectId);
      assert.equal(typeof xml, "string");
      assert(xml.includes("someProject"));
    });

    it("should get thumbnail", async function () {
      const data = {
        name: "someProject",
        roles: [
          {
            name: "someRole",
            code:
              "<code><thumbnail>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==</thumbnail></code>",
            media: "<media/>",
          },
        ],
      };
      const metadata = await api.createProject(data);
      assert.equal(metadata.owner, "admin");

      const response = await api.getProjectThumbnail(metadata.id);
      assert(response.ok);
    });

    it("should publish/unpublish project", async function () {
      const data = {
        name: "testPublishProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      const projectId = (await api.createProject(data)).id;
      const state = await api.publishProject(projectId);
      assert.equal(state, "Public");

      const newState = await api.unpublishProject(projectId);
      assert.equal(newState, "Private");
    });

    it("should list projects", async function () {
      const data = {
        name: "testListProjects",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      const projectId = (await api.createProject(data)).id;
      const projects = await api.listUserProjects("admin");
      assert(projects.some((p) => p.id === projectId));
    });

    it("should list public projects", async function () {
      const owner = "listPublicProjectsOwner";
      await ensureUserExists(api, owner);
      const data = {
        name: "testListProjects",
        owner,
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      const projectId = (await api.createProject(data)).id;
      await api.publishProject(projectId);

      const projects = await api.listPublicProjects();
      assert(projects.some((p) => p.id === projectId));
    });

    it("should get project by name", async function () {
      const data = {
        name: "getProjectByName",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      await api.createProject(data);
      const project = await api.getProjectNamed("admin", data.name);
      assert.equal(data.roles[0].code, Object.values(project.roles)[0].code);
    });

    it("should get project xml by name", async function () {
      const data = {
        name: "getProjectXmlByName",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      await api.createProject(data);
      const xml = await api.getProjectNamedXml("admin", data.name);
      assert.equal(typeof xml, "string");
      assert(xml.startsWith("<room"));
    });

    it("should get project metadata by name", async function () {
      const data = {
        name: "getProjectMetadataByName",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      const metadata = await api.createProject(data);
      const md2 = await api.getProjectNamedMetadata("admin", metadata.name);
      assert.deepEqual(metadata, md2);
    });

    it("should rename project", async function () {
      const data = {
        name: "testRenameProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      const projectId = (await api.createProject(data)).id;
      const updateData = {
        name: "newName",
      };
      const metadata = await api.updateProject(projectId, updateData);
      assert.equal(metadata.id, projectId);
      assert.notEqual(metadata.name, data.name);
    });

    it("should delete project", async function () {
      const data = {
        name: "testRenameProject",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      const projectId = (await api.createProject(data)).id;
      const metadata = await api.deleteProject(projectId);
      assert.equal(metadata.id, projectId);
    });

    it("should list pending projects; set project state", async function () {
      const data = {
        name: "setProjectState",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      const projectId = (await api.createProject(data)).id;
      const state = "PendingApproval";
      const metadata = await api.setProjectState(projectId, state);
      assert.equal(metadata.state, state);

      const pendingProjects = await api.listPendingProjects();
      assert(pendingProjects.some((project) => project.id === projectId));
    });
  });

  describe("collaborators", function () {
    it("should send/list/respond to invite then list/remove collabs", async function () {
      const collaborator = "testCollaborator";
      await ensureUserExists(api, collaborator);
      const data = {
        name: "testCollabs",
        roles: [
          {
            name: "someRole",
            code: "<code/>",
            media: "<media/>",
          },
          {
            name: "role2",
            code: "<code/>",
            media: "<media/>",
          },
        ],
        saveState: "Saved",
      };
      const metadata = await api.createProject(data);

      // send invite
      const invite = await api.inviteCollaborator(metadata.id, collaborator);
      assert.equal(invite.projectId, metadata.id);
      assert.equal(invite.sender, metadata.owner);

      // list invites
      const invites = await api.listCollaborationInvites(collaborator);
      assert.equal(invites.length, 1);
      assert.equal(invites[0].sender, metadata.owner);
      assert.equal(invites[0].receiver, collaborator);

      // respond to invite
      const state = await api.respondToCollaborationInvite(
        invite.id,
        "Accepted",
      );
      assert.equal(state, "Accepted");

      // list collabs
      const collaborators = await api.listCollaborators(metadata.id);
      assert.equal(collaborators.length, 1);
      assert.equal(collaborators[0], collaborator);

      // list shared projects
      const sharedProjects = await api.listSharedProjects(collaborator);
      assert(Array.isArray(sharedProjects));
      assert.equal(sharedProjects[0].id, metadata.id);

      // remove collaborator
      const updatedMetadata = await api.removeCollaborator(
        metadata.id,
        collaborator,
      );
      assert.equal(metadata.id, updatedMetadata.id);
      assert.deepEqual(metadata.collaborators, updatedMetadata.collaborators);
    });
  });

  describe("libraries", function () {
    it("should save/list/get/publish/list pub/unpublish/delete user library", async function () {
      const library = {
        name: "saveUserLib",
        blocks: "<blocks/>",
        notes: "notes..",
      };
      const metadata = await api.saveUserLibrary("admin", library);
      assert.equal(metadata.name, library.name);
      assert.equal(metadata.state, "Private");

      // list
      const libraries = await api.listUserLibraries("admin");
      assert(libraries.some((lib) => lib.name === library.name));

      // get
      const libraryXml = await api.getUserLibrary("admin", library.name);
      assert.equal(libraryXml, library.blocks);

      // publish
      const state = await api.publishLibrary("admin", library.name);
      assert.equal(state, "Public");

      // list community libraries
      const communityLibs = await api.listCommunityLibraries();
      assert(communityLibs[0].state, "Public");
      assert(communityLibs[0].hasOwnProperty("notes"));

      // unpublish
      const libMetadata = await api.unpublishLibrary("admin", library.name);
      assert.equal(libMetadata.state, "Private");

      // delete
      const newMetadata = await api.deleteUserLibrary("admin", library.name);
      assert.equal(newMetadata.name, library.name);
      assert.equal(newMetadata.state, "Private");
    });

    it("should set library state/list pending libraries", async function () {
      const library = {
        name: "moderateLibraries",
        blocks: "<blocks/>",
        notes: "notes..",
      };
      await api.saveUserLibrary("admin", library);

      // set state
      const newMetadata = await api.setLibraryState(
        "admin",
        library.name,
        "PendingApproval",
      );
      assert(newMetadata.hasOwnProperty("state"));

      // list pending
      const libraries = await api.listPendingLibraries();
      assert.equal(libraries[0].state, "PendingApproval");
    });
  });

  describe("service hosts", function () {
    it("should list group hosts", async function () {
      const servicesHosts = [
        { url: "http://localhost:4040", categories: ["host1"] },
        { url: "http://localhost:4041", categories: ["host2"] },
      ];
      const data = { name: "testListGroupHosts", servicesHosts };
      const group = await api.createGroup("admin", data);
      const hosts = await api.listGroupHosts(group.id);
      assert.equal(hosts.length, 2);
      assert(hosts[0].hasOwnProperty("url"));
      assert(hosts[0].hasOwnProperty("categories"));
    });

    it("should set group hosts", async function () {
      const data = { name: "setGroupHosts" };
      const group = await api.createGroup("admin", data);

      const hosts = [
        { url: "http://localhost:4042", categories: ["host3"] },
      ];

      const groupData = await api.setGroupHosts(group.id, hosts);
      assert(Array.isArray(groupData.servicesHosts));
    });

    it("should set/list user hosts", async function () {
      const hosts = [
        { url: "http://localhost:4042", categories: ["host3"] },
      ];

      const user = await api.setUserHosts("admin", hosts);
      assert.equal(user.username, "admin");
    });

    it("should list all hosts", async function () {
      const servicesHosts = [
        { url: "http://localhost:4040", categories: ["host1"] },
        { url: "http://localhost:4041", categories: ["host2"] },
      ];
      const data = { name: "testListAllHosts", servicesHosts };
      const group = await api.createGroup("admin", data);
      const userData = {
        username: "listAllHostsUser",
        email: "noreply@netsblox.org",
        groupId: group.id,
      };
      const member = await api.createUser(userData);
      const hosts = [
        { url: "http://localhost:4042", categories: ["host3"] },
      ];

      await api.setUserHosts(member.username, hosts);
      const allHosts = await api.listAllHosts(member.username);
      assert.equal(allHosts.length, 3);
    });

    it("should authorize/list/unauthorize host", async function () {
      const host = { url: "http://localhost", id: "TestHost", public: false };
      const secret = await api.authorizedHost(host);
      assert.equal(typeof secret, "string");

      const hosts = await api.getAuthorizedHosts();
      assert(hosts.some((h) => h.id === host.id));

      const hostData = await api.unauthorizedHost(host.id);
      assert.equal(hostData.id, host.id);
    });
  });

  describe("service settings", function () {
    it("should set/get/list/delete settings for the user", async function () {
      // set
      const settingsStr = `{"SomeSetting": "SomeValue"}`;
      await api.setUserSettings("admin", "TestHost", settingsStr);

      // get
      const data = await api.getUserSettings("admin", "TestHost");
      assert.deepEqual(data, JSON.parse(settingsStr));

      // list
      const [hostname] = await api.listUserHostsWithSettings("admin");
      assert.equal(hostname, "TestHost");

      // delete
      await api.deleteUserSettings("admin", "TestHost");
    });

    it("should set/get/list/delete hosts for the group", async function () {
      const group = await api.createGroup("admin", { name: "groupSettings" });

      // set
      const settingsStr = `{"SomeSetting": "SomeValue"}`;
      await api.setGroupSettings(group.id, "TestHost", settingsStr);

      // get
      const data = await api.getGroupSettings(group.id, "TestHost");
      assert.deepEqual(data, JSON.parse(settingsStr));

      // list
      const [hostname] = await api.listGroupHostsWithSettings(group.id);
      assert.equal(hostname, "TestHost");

      // delete
      await api.deleteGroupSettings(group.id, "TestHost");
    });

    it("should get all settings", async function () {
      const allSettings = await api.getAllSettings("admin", "TestHost");
      assert(allSettings.hasOwnProperty("groups"));
    });
  });
});

async function ensureUserExists(api, username) {
  const email = "noreply@netsblox.org";
  const userData = { username, email };
  return api.createUser(userData)
    .catch((err) => {
      console.log(`Assuming ${username} already exists. Received: ${err}`);
    });
}
