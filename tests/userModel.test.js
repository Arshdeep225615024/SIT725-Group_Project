const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const User = require("../models/userModel");

describe("User Model", () => {
  before(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/passwordCheckerTest", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it("should hash the password before saving", async () => {
    const user = new User({ username: "testUser", passwordHash: "plain123" });
    await user.save();

    expect(user.passwordHash).to.not.equal("plain123");
    expect(user.passwordHash).to.match(/^\$2[aby]\$.{56}$/); // bcrypt hash format
  });
});
