const CloudClient = require("..");
const assert = require("assert");

const client = new CloudClient("http://localhost:7777");

describe("localize", function () {
  it("should have localize fn (default: identity)", function () {
    assert.equal(client.localize("abc"), "abc");
  });
});

describe("login", function () {
  it("should login on success", async function () {
    const username = await client.login("test", "password");
    assert.equal(username, "test");
  });

  it("should maintain state", async function () {
    await client.login("test", "password");
    const { username } = await client.viewUser();
    assert.equal(username, "test");
  });

  it("should throw error on bad password", async function () {
    await assert.rejects(
      client.login("test", "incorrectPassword"),
    );
  });

  it("should throw error on invalid URL", async function () {
    const client = new CloudClient("http://localhost:da7777");
    await assert.rejects(client.login("test", "password"));
  });
});

describe("logout", function () {
  before(async () => {
    await client.login("test", "password");
  });

  it("should logout", async function () {
    await client.logout();
    await assert.rejects(client.viewUser());
  });
});

describe("saveRole", function () {
  before(async () => {
    await client.login("test", "password");
    await client.newProject();
  });

  it("should return project metadata", async function () {
    const role = {
      name: "someName",
      code: "<someCode>",
      media: "<someMedia>",
    };
    const metadata = await client.saveRole(role);
    // Check a few fields specific to project metadata
    assert(metadata.id);
    assert(metadata.name);
    assert(metadata.owner);
  });
});

describe("addRole", function () {
  before(async () => {
    await client.login("test", "password");
    await client.newProject();
  });

  it("should return project metadata", async function () {
    const metadata = await client.addRole("someName");
    // Check a few fields specific to project metadata
    assert(metadata.id);
    assert(metadata.name);
    assert(metadata.owner);
  });
});

describe("register", function () {
  it("should create new user", async function () {
    const client = new CloudClient("http://localhost:7777");
    await client.register("testuser", "testuser@netsblox.org");
  });
});

describe("checkLogin", function () {
  it("should report true when logged in", async function () {
    const username = await client.login("test", "password");
    assert(await client.checkLogin());
  });

  it("should report false when not logged in", async function () {
    await client.logout();
    assert(!await client.checkLogin());
  });
});

describe("getProfile", function () {
  it("should get the user profile", async function () {
    const username = await client.login("test", "password");
    const profile = await client.getProfile();
    assert.equal(profile.username, "test");
    assert(profile.email);
  });
});
