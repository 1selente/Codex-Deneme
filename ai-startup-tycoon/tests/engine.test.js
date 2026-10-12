/* Run with: node ai-startup-tycoon/tests/engine.test.js */
"use strict";

const assert = require("node:assert/strict");
const game = require("../engine.js");

function test(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (error) {
    console.error("FAIL " + name);
    throw error;
  }
}

test("new companies start with consistent statistics", () => {
  const s = game.createGame("Vertex AI", 123);
  assert.equal(s.company, "Vertex AI");
  assert.equal(s.cash, 220000);
  assert.equal(s.week, 1);
  assert.equal(game.totalUsers(s), 0);
  assert.equal(game.maxUsers(s), 2800);
});

test("launching a product costs cash and cannot be duplicated", () => {
  const s = game.createGame("Test", 12);
  assert.equal(game.dispatch(s, "launch", { id: "assistant" }).ok, true);
  assert.equal(s.cash, 201000);
  assert.equal(game.dispatch(s, "launch", { id: "assistant" }).ok, false);
  assert.equal(s.products.length, 1);
});

test("business actions validate available cash and restrictions", () => {
  const s = game.createGame("Test", 12);
  assert.equal(game.dispatch(s, "launch", { id: "api" }).ok, false);
  assert.equal(game.dispatch(s, "price", { id: "assistant", price: -100 }).ok, false);
  assert.equal(game.dispatch(s, "hire", { role: "invalid" }).ok, false);
  assert.equal(game.dispatch(s, "research").ok, true);
  assert.equal(game.dispatch(s, "research").ok, false);
});

test("research completes after sufficient elapsed weeks", () => {
  const s = game.createGame("Test", 34);
  game.dispatch(s, "research");
  for (let i = 0; i < 4; i++) game.dispatch(s, "next-week");
  assert.equal(s.model.name, "Nova-1");
  assert.equal(s.model.quality, 40);
  assert.equal(s.research, null);
});

test("simulations are deterministic with an equal seed and decisions", () => {
  const a = game.createGame("Test", 42);
  const b = game.createGame("Test", 42);
  for (const s of [a, b]) {
    game.dispatch(s, "launch", { id: "assistant" });
    game.dispatch(s, "hire", { role: "marketer" });
    game.dispatch(s, "price", { id: "assistant", price: 22 });
    for (let i = 0; i < 14; i++) game.dispatch(s, "next-week");
  }
  assert.deepEqual(a, b);
  assert.ok(a.lastWeek.revenue > 0);
  assert.ok(game.totalUsers(a) > 0);
});

test("pricing affects customer demand over equal market conditions", () => {
  const cheap = game.createGame("Test", 100);
  const premium = game.createGame("Test", 100);
  for (const s of [cheap, premium]) game.dispatch(s, "launch", { id: "assistant" });
  game.dispatch(cheap, "price", { id: "assistant", price: 10 });
  game.dispatch(premium, "price", { id: "assistant", price: 40 });
  game.dispatch(cheap, "next-week");
  game.dispatch(premium, "next-week");
  assert.ok(game.totalUsers(cheap) > game.totalUsers(premium));
});

test("capacity caps growth and funding dilutes the founder", () => {
  const s = game.createGame("Test", 321);
  game.dispatch(s, "launch", { id: "assistant" });
  for (let i = 0; i < 45 && s.status === "running"; i++) game.dispatch(s, "next-week");
  assert.ok(game.totalUsers(s) <= game.maxUsers(s));
  const s2 = game.createGame("Test", 1);
  assert.equal(game.dispatch(s2, "fund").ok, true);
  assert.ok(s2.ownership < 100);
  assert.ok(s2.cash > 220000);
  assert.equal(game.dispatch(s2, "fund").ok, false);
});

test("saves roundtrip and malformed data is rejected", () => {
  const s = game.createGame("Test", 99);
  game.dispatch(s, "next-week");
  assert.deepEqual(game.parseSave(JSON.stringify(s)), s);
  assert.equal(game.parseSave("{bad"), null);
  assert.equal(game.parseSave('{"version":999}'), null);
});

console.log("All simulation tests passed.");
