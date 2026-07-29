import assert from "node:assert/strict";
import test from "node:test";
import { buildUserPrompt, parseModelJson } from "../src/evaluationService.js";

test("parseModelJson parses direct JSON", () => {
  assert.deepEqual(parseModelJson("{\"project_name\":\"测试项目\"}"), {
    project_name: "测试项目"
  });
});

test("parseModelJson extracts JSON object from wrapped model text", () => {
  assert.deepEqual(parseModelJson("```json\n{\"grade\":\"A\"}\n```"), {
    grade: "A"
  });
});

test("buildUserPrompt includes project material and metadata", () => {
  const prompt = buildUserPrompt({
    projectText: "核心技术：高效率储能材料",
    projectName: "储能项目",
    contact: "demo@example.com",
    weightPresets: { templates: { general: { name: "通用" } } }
  });

  assert.match(prompt, /储能项目/);
  assert.match(prompt, /demo@example\.com/);
  assert.match(prompt, /高效率储能材料/);
  assert.match(prompt, /通用/);
});
