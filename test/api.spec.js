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

    it("should create users", async function () {
      const username = `testCreateUser${Date.now()}`;
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
      const username = `testBanUser${Date.now()}`;
      const email = "noreply@netsblox.org";
      const userData = { username, email };
      await api.createUser(userData);
      const acct = await api.banUser(username);
      assert.equal(acct.username, username);
    });

    it("should unban user", async function () {
      const username = `testUnbanUser${Date.now()}`;
      const email = "noreply@netsblox.org";
      const userData = { username, email };
      await api.createUser(userData);
      await api.banUser(username);
      const acct = await api.unbanUser(username);
      assert.equal(acct.username, username);
    });

    it("should delete user", async function () {
      const username = `testDeleteUser${Date.now()}`;
      const email = "noreply@netsblox.org";
      const userData = { username, email };
      await api.createUser(userData);
      const user = await api.deleteUser(username);
      assert.equal(user.username, username);
    });

    it("should set password", async function () {
      const username = `testSetPassword${Date.now()}`;
      const email = "noreply@netsblox.org";
      const userData = { username, email };
      await api.createUser(userData);

      const password = "myPassword";
      await api.setPassword(username, password);
      await api.login(username, password);
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
      await api.createUser(userData);
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
      assert.equal(Object.keys(newMetadata).length, 1);
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

    it("should list shared projects", async function () {
      // TODO
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
      // TODO
    });

    it("should get project xml by name", async function () {
      // TODO
    });

    it("should get project metadata by name", async function () {
      // TODO
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
      assert.equal(metadata.name, updateData.name);
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

    it("should list pending projects", async function () {
      // TODO
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

      const pendingProjects = await api.setProjectState(projectId, state);
      assert(pendingProjects.some((project) => project.id === projectId));
    });
  });

  describe("collaborators", function () {
    it("should list invites", async function () {
      // TODO
    });

    it("should send invite", async function () {
      // TODO
    });

    it("should respond to invite", async function () {
      // TODO
    });

    it("should list collaborators", async function () {
      // TODO
    });

    it("should remove collaborator", async function () {
      // TODO
    });
  });

  describe("libraries", function () {
    it("should list community libraries", async function () {
      // TODO
    });

    it("should save/list/get/publish/unpublish/delete user library", async function () {
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
      const libraryData = await api.getUserLibrary("admin", library.name);
      assert.equal(libraryData.blocks, library.blocks);

      // publish
      const state = await api.publishLibrary("admin", library.name);
      assert.equal(state, "Public");

      // unpublish
      const newState = await api.unpublishLibrary("admin", library.name);
      assert.equal(newState, "Private");

      // delete
      const newMetadata = await api.deleteUserLibrary("admin", library.name);
      assert.equal(newMetadata.name, library.name);
      assert.equal(newMetadata.state, "Private");
    });

    it("should list pending libraries", async function () {
      // TODO
    });

    it("should set library state", async function () {
      // TODO
    });
  });

  describe("service hosts", function () {
    it("should list group hosts", async function () {
      const serviceHosts = [
        { url: "http://localhost:4040", categories: ["host1"] },
        { url: "http://localhost:4041", categories: ["host2"] },
      ];
      const data = { name: "testListGroupHosts", serviceHosts };
      const group = await api.createGroup("admin", data);
      const hosts = await api.listGroupHosts(group.id);
      assert.equal(hosts.length, 2);
    });

    it("should set group hosts", async function () {
      const data = { name: "setGroupHosts" };
      const group = await api.createGroup("admin", data);

      const hosts = [
        { url: "http://localhost:4042", categories: ["host3"] },
      ];

      const groupData = await api.setGroupHosts(group.id, hosts);
      assert.equal(groupData.servicesHosts.length, 2);
    });

    it("should set/list user hosts", async function () {
      const hosts = [
        { url: "http://localhost:4042", categories: ["host3"] },
      ];

      const user = await api.setUserHosts("admin", hosts);
      assert.equal(user.username, "admin");
    });

    it("should list all hosts", async function () {
      const serviceHosts = [
        { url: "http://localhost:4040", categories: ["host1"] },
        { url: "http://localhost:4041", categories: ["host2"] },
      ];
      const data = { name: "testListAllHosts", serviceHosts };
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
      const settings = "SomeSettings";
      await api.setUserSettings("admin", "TestHost", settings);

      // get
      const data = await api.getUserSettings("admin", "TestHost");
      assert.equal(data, settings);

      // list
      const [hostname] = await api.listUserHostsWithSettings("admin");
      assert.equal(hostname, "TestHost");

      // delete
      await api.deleteUserSettings("admin", "TestHost");
    });

    it("should set/get/list/delete hosts for the group", async function () {
      const group = await api.createGroup("admin", { name: "groupSettings" });

      // set
      const settings = "SomeSettings";
      await api.setGroupSettings(group.id, "TestHost", settings);

      // get
      const data = await api.getGroupSettings(group.id, "TestHost");
      assert.equal(data, settings);

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
