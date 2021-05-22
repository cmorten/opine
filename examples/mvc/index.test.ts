import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("mvc", () => {
  describe("GET /", function () {
    it("should redirect to /users", function (done) {
      superdeno(app)
        .get("/")
        .expect("Location", "/users")
        .expect(302, done);
    });
  });

  describe("GET /pet/0", function () {
    it("should get pet", function (done) {
      superdeno(app)
        .get("/pet/0")
        .expect(200, /Smudge/, done);
    });
  });

  describe("GET /pet/0/edit", function () {
    it("should get pet edit page", function (done) {
      superdeno(app)
        .get("/pet/0/edit")
        .expect(/<form/)
        .expect(200, /Smudge/, done);
    });
  });

  describe("POST /pet/2", function () {
    it("should update the pet", function (done) {
      superdeno(app)
        .post("/pet/2")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ pet: { name: "Georgie Porgie" } })
        .expect(302, function (err) {
          if (err) {
            return done(err);
          }

          superdeno(app)
            .get("/pet/2/edit")
            .expect(200, /Georgie Porgie/, done);
        });
    });
  });

  describe("GET /users", function () {
    it("should display a list of users", function (done) {
      superdeno(app)
        .get("/users")
        .expect(/<h1>Users<\/h1>/)
        .expect(/>C</)
        .expect(/>H</)
        .expect(/>S</)
        .expect(200, done);
    });
  });

  describe("GET /user/:id", function () {
    describe("when present", function () {
      it("should display the user", function (done) {
        superdeno(app)
          .get("/user/0")
          .expect(200, /<h1>C <a href="\/user\/0\/edit">edit/, done);
      });

      it("should display the user's pets", function (done) {
        superdeno(app)
          .get("/user/2")
          .expect(/\/pet\/1">Tilly/)
          .expect(/\/pet\/2">Georgie/)
          .expect(200, done);
      });
    });

    describe("when not present", function () {
      it("should 404", function (done) {
        superdeno(app)
          .get("/user/123")
          .expect(404, done);
      });
    });
  });

  describe("GET /user/:id/edit", function () {
    it("should display the edit form", function (done) {
      superdeno(app)
        .get("/user/1/edit")
        .expect(/H/)
        .expect(200, /<form/, done);
    });
  });

  describe("PUT /user/:id", function () {
    it("should 500 on error", function (done) {
      superdeno(app)
        .post("/user/1")
        .send({})
        .expect(500, done);
    });

    it("should update the user", function (done) {
      superdeno(app)
        .post("/user/1")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ user: { name: "Elephant Seal" } })
        .expect(302, function (err) {
          if (err) {
            return done(err);
          }

          superdeno(app)
            .get("/user/1/edit")
            .expect(200, /Elephant Seal/, done);
        });
    });
  });

  describe("POST /user/:id/pet", function () {
    it("should create a pet for user", function (done) {
      superdeno(app)
        .post("/user/0/pet")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ pet: { name: "Bramble" } })
        .expect("Location", "/user/0")
        .expect(302, function (err) {
          if (err) {
            return done(err);
          }

          superdeno(app)
            .get("/user/0")
            .expect(200, /Bramble/, done);
        });
    });
  });
});
