import assert from "node:assert/strict";
import test from "node:test";
import { buildResearchSystemPrompt, buildResearchUserPrompt, buildUserPrompt, parseModelJson } from "../src/evaluationService.js";

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

test("buildResearchUserPrompt requests formal report sections", () => {
  const prompt = buildResearchUserPrompt({
    projectText: "项目材料：AI 储能安全系统",
    projectName: "储能安全项目",
    contact: "",
    weightPresets: { templates: { general: { name: "通用" } } }
  });

  assert.match(prompt, /项目\/行业调研报告/);
  assert.match(prompt, /external_research_status/);
  assert.match(prompt, /sources/);
  assert.match(prompt, /AI 储能安全系统/);
});

test("buildResearchSystemPrompt includes search and citation guardrails", () => {
  const prompt = buildResearchSystemPrompt();

  assert.match(prompt, /联网搜索/);
  assert.match(prompt, /不要编造/);
  assert.match(prompt, /严格 JSON/);
});
