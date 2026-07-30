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

export async function createProjectResearchReport({ projectText, projectName = "", contact = "" }) {
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw createConfigError("缺少 DASHSCOPE_API_KEY 或 OPENAI_API_KEY，无法调用评估模型。");
  }

  const assets = await loadEvaluationAssets();
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.MODEL_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1"
  });

  const completion = await createChatCompletionWithFallback(client, {
    model: process.env.MODEL_NAME || "qwen-max",
    temperature: Number(process.env.MODEL_TEMPERATURE || 0.25),
    messages: [
      { role: "system", content: buildResearchSystemPrompt() },
      {
        role: "user",
        content: buildResearchUserPrompt({
          projectText,
          projectName,
          contact,
          weightPresets: assets.weightPresets
        })
      }
    ]
  });

  const content = completion.choices?.[0]?.message?.content || "";
  return parseModelJson(content);
}

async function createChatCompletionWithFallback(client, payload) {
  const enrichedPayload = withOptionalSearch(payload);

  if (process.env.MODEL_RESPONSE_FORMAT === "none") {
    return client.chat.completions.create(enrichedPayload);
  }

  try {
    return await client.chat.completions.create({
      ...enrichedPayload,
      response_format: { type: "json_object" }
    });
  } catch (error) {
    if (!isResponseFormatError(error)) {
      throw normalizeModelError(error);
    }

    console.warn("Model endpoint rejected response_format; retrying without it.");
    try {
      return await client.chat.completions.create(enrichedPayload);
    } catch (retryError) {
      throw normalizeModelError(retryError);
    }
  }
}

function withOptionalSearch(payload) {
  if (process.env.MODEL_ENABLE_SEARCH !== "true") {
    return payload;
  }

  return {
    ...payload,
    enable_search: true,
    search_options: {
      forced_search: true,
      enable_source: true
    }
  };
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

export function buildResearchSystemPrompt() {
  return [
    "你是一位资深产业研究、科技投资和项目尽调顾问。",
    "你的任务是根据用户上传的项目路演材料、文字资料或 PPT 抽取内容，生成一份可直接给投资人、孵化器或面试官阅读的正式项目调研报告。",
    "如果系统已启用联网搜索，你必须主动补齐行业规模、增长率、政策、竞品、融资案例、产业链、技术趋势等外部信息，并在 sources 中给出来源。",
    "如果没有联网搜索能力，你必须明确标注 external_research_status 为 limited，并把需要联网核验的内容写入 validation_needs。",
    "不要编造具体来源链接、政策文件编号、公司融资额或市场规模。无法确认的信息必须标注为待核验。",
    "输出必须是严格 JSON，不要输出 Markdown，不要包裹代码块。"
  ].join("\n");
}

export function buildResearchUserPrompt({ projectText, projectName = "", contact = "", weightPresets }) {
  const metadata = [
    projectName ? `用户填写的项目名称：${projectName}` : "",
    contact ? `用户联系方式/提交人：${contact}` : ""
  ].filter(Boolean);

  return [
    "请生成一份正式排版用的项目/行业调研报告 JSON。",
    "",
    "## 输出 JSON 结构",
    JSON.stringify(getResearchReportShape(), null, 2),
    "",
    "## 研究要求",
    "- 报告要比单纯评分更完整，重点补齐行业研究、市场空间、竞争格局、产业链、政策环境、商业化路径。",
    "- 保留五维评估，但作为报告中的一个章节，而不是唯一输出。",
    "- 每个 section 至少包含 detail 正文和 bullets 要点。",
    "- sources 必须只放真实可追溯来源；无法联网时留空并在 validation_needs 说明。",
    "- validation_needs 必须列出后续需要人工核验的材料。",
    "",
    "## 五维权重预设参考",
    JSON.stringify(weightPresets, null, 2),
    "",
    metadata.length ? `## 用户补充信息\n${metadata.join("\n")}` : "",
    "## 项目材料",
    projectText
  ]
    .filter(Boolean)
    .join("\n");
}

function getResearchReportShape() {
  return {
    report_type: "project_research_report",
    title: "项目调研报告标题",
    subtitle: "一句话概括项目与赛道",
    project_name: "项目名称",
    industry: "所属行业",
    external_research_status: "enabled 或 limited",
    executive_summary: ["3-5 条高管摘要"],
    key_metrics: [
      { label: "综合评分", value: "示例：72/100", note: "说明" },
      { label: "建议评级", value: "示例：A", note: "说明" }
    ],
    sections: [
      {
        heading: "行业概览",
        summary: "本章节一句话摘要",
        detail: "正式报告正文",
        bullets: ["关键要点"],
        citations: ["引用来源标题或序号"]
      }
    ],
    five_dimension_assessment: {
      innovation: { score: 0, rationale: "技术创新性判断" },
      practicality: { score: 0, rationale: "实用性判断" },
      market: { score: 0, rationale: "市场前景判断" },
      economic: { score: 0, rationale: "经济效益判断" },
      social: { score: 0, rationale: "社会价值判断" },
      overall_score: 0,
      grade: "S/A/B/C/D"
    },
    risks: ["至少 3 条风险"],
    recommendations: ["至少 3 条建议"],
    validation_needs: ["需要继续核验的信息"],
    sources: [
      {
        title: "来源标题",
        url: "来源链接",
        publisher: "发布机构",
        date: "发布日期或未知",
        note: "使用该来源支撑的观点"
      }
    ],
    appendix: "补充说明"
  };
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
