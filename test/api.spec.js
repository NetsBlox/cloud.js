const { NetsBloxApi } = require("..");
const assert = require("assert");

const api = new NetsBloxApi("http://localhost:7777");

describe.only("users", function () {
  it("should list users", async function () {
    const credentials = {
      NetsBlox: {
        username: "admin",
        password: "somePassword",
      },
    };
    await api.login({ credentials });

    const users = await api.listUsers();
    assert(users.find((user) => user.username === "admin"));
  });
});
