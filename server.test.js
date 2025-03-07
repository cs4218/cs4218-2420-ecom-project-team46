// unit testing the server == unit testing the app.listen function
import express from 'express';
import request from 'supertest';

let server;

afterEach(() => {
  if (server) server.close();
})

test("Server Test", async () => {
  const app = express();
  const PORT = process.env.PORT || 6060;

  app.get('/', function(req, res) {
    res.status(200).send("OK"); // Need to add if not will hang
  });

  server = app.listen(PORT);

  const res = await request(app).get("/");
  expect(res.statusCode).toEqual(200);
  expect(res.text).toBe("OK");
})