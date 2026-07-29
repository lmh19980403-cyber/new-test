import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const systemPromptPath = path.join(rootDir, "data", "system-prompt.md");
const outputSchemaPath = path.join(rootDir, "data", "output-schema.json");
const weightPresetsPath = path.join(rootDir, "data", "weight-presets.json");

let cachedEvaluationAssets;

export async function loadEvaluationAssets() {
  if (!cachedEvaluationAssets) {
    const [systemPrompt, outputSchemaRaw, weightPresetsRaw] = await Promise.all([
      readFile(systemPromptPath, "utf8"),
      readFile(outputSchemaPath, "utf8"),
      readFile(weightPresetsPath, "utf8")
    ]);

    cachedEvaluationAssets = {
      systemPrompt,
      outputSchema: JSON.parse(outputSchemaRaw),
      weightPresets: JSON.parse(weightPresetsRaw)
    };
  }

  return cachedEvaluationAssets;
}

export async function createEvaluationReport({ projectText, projectName = "", contact = "" }) {
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw createConfigError("缺少 DASHSCOPE_API_KEY 或 OPENAI_API_KEY，无法调用评估模型。");
  }

  const assets = await loadEvaluationAssets();
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.MODEL_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1"
  });

  const userPrompt = buildUserPrompt({
    projectText,
    projectName,
    contact,
    weightPresets: assets.weightPresets
  });

  const completion = await createChatCompletionWithFallback(client, {
    model: process.env.MODEL_NAME || "qwen-max",
    temperature: Number(process.env.MODEL_TEMPERATURE || 0.3),
    messages: [
      { role: "system", content: assets.systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  const content = completion.choices?.[0]?.message?.content || "";
  return parseModelJson(content);
}

async function createChatCompletionWithFallback(client, payload) {
  if (process.env.MODEL_RESPONSE_FORMAT === "none") {
    return client.chat.completions.create(payload);
  }

  try {
    return await client.chat.completions.create({
      ...payload,
      response_format: { type: "json_object" }
    });
  } catch (error) {
    if (!isResponseFormatError(error)) {
      throw normalizeModelError(error);
    }

    console.warn("Model endpoint rejected response_format; retrying without it.");
    try {
      return await client.chat.completions.create(payload);
    } catch (retryError) {
      throw normalizeModelError(retryError);
    }
  }
}

function isResponseFormatError(error) {
  const message = getModelErrorMessage(error).toLowerCase();
  return message.includes("response_format") || message.includes("json_object");
}

function normalizeModelError(error) {
  const normalized = new Error(`模型调用失败：${getModelErrorMessage(error)}`);
  normalized.statusCode = error.status || error.statusCode || 502;
  normalized.code = error.code || "MODEL_REQUEST_FAILED";
  return normalized;
}

function getModelErrorMessage(error) {
  return (
    error?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "未知模型服务错误"
  );
}

export function buildUserPrompt({ projectText, projectName = "", contact = "", weightPresets }) {
  const metadata = [
    projectName ? `用户填写的项目名称：${projectName}` : "",
    contact ? `用户联系方式/提交人：${contact}` : ""
  ].filter(Boolean);

  return [
    "请根据以下项目材料生成科技成果五维评估报告。",
    "输出必须是严格 JSON，字段需符合系统提供的 output-schema。",
    "如材料信息不足，请降低 data_completeness，并在 flags/scoring_notes 标注需补充信息。",
    "",
    metadata.length ? `## 用户补充信息\n${metadata.join("\n")}` : "",
    "## 可选权重预设参考",
    JSON.stringify(weightPresets, null, 2),
    "",
    "## 项目材料",
    projectText
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseModelJson(content) {
  if (!content || typeof content !== "string") {
    throw new Error("模型返回为空，未能生成评估报告。");
  }

  try {
    return JSON.parse(content);
  } catch {
    const jsonText = extractJsonObject(content);
    if (!jsonText) {
      throw new Error("模型返回内容不是可解析的 JSON。");
    }
    return JSON.parse(jsonText);
  }
}

export function extractJsonObject(content) {
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  return content.slice(firstBrace, lastBrace + 1);
}

function createConfigError(message) {
  const error = new Error(message);
  error.statusCode = 503;
  error.code = "MODEL_NOT_CONFIGURED";
  return error;
}
