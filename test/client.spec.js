const CloudClient = require("..");
const assert = require("assert");

const CLOUD_URL = "http://localhost:7777";
const client = new CloudClient(CLOUD_URL);

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

describe("register", function () {
  it("should create new user", async function () {
    client.clear();
    await client.register("testuser", "testuser@netsblox.org");
  });
});

describe("checkLogin", function () {
  it("should report true when logged in", async function () {
    await client.login("test", "password");
    assert(await client.checkLogin());
  });

  it("should report false when not logged in", async function () {
    await client.logout();
    assert(!await client.checkLogin());
  });
});

describe("getProfile", function () {
  it("should get the user profile", async function () {
    await client.login("test", "password");
    const profile = await client.getProfile();
    assert.equal(profile.username, "test");
    assert(profile.email);
  });
});

describe("evictOccupant", function () {
  it.only("should evict the user", async function () {
    const owner = await CloudClient.connect(CLOUD_URL);
    const occupant = await CloudClient.connect(CLOUD_URL);

    // create a project and move to it
    await owner.login("test", "password");
    await occupant.login("test", "password");

    const metadata = await owner.newProject("ExampleProject");
    console.log(metadata);
    await occupant.setClientState(
      metadata.id,
      Object.keys(metadata.roles).pop(),
    );
    console.log(await owner.getRoomState());
  });

  it("should return error if project is not found", async function () {
  });

  it("should return error if client ID is not found", async function () {
  });

  it("should return error if client ID is invalid", async function () {
  });
});
