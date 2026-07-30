import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEvaluationReport, createProjectResearchReport, loadEvaluationAssets } from "./evaluationService.js";
import { extractTextFromUpload, isSupportedFile, normalizeWhitespace } from "./fileExtractors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_BYTES || 20 * 1024 * 1024)
  }
});

app.use(express.json({ limit: "2mb" }));
app.use(express.static(publicDir));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    modelConfigured: Boolean(process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY),
    model: process.env.MODEL_NAME || "qwen-max"
  });
});

app.get("/api/schema", async (_req, res, next) => {
  try {
    const assets = await loadEvaluationAssets();
    res.json({
      outputSchema: assets.outputSchema,
      weightPresets: assets.weightPresets
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/evaluations", upload.single("projectFile"), async (req, res, next) => {
  try {
    const uploadedFile = req.file;
    if (uploadedFile && !isSupportedFile(uploadedFile.originalname) && !uploadedFile.originalname.toLowerCase().endsWith(".ppt")) {
      return res.status(400).json({
        error: "UNSUPPORTED_FILE_TYPE",
        message: "暂仅支持 .pptx、.txt、.md 文件；二进制 .ppt 请先另存为 .pptx。"
      });
    }

    const manualText = normalizeWhitespace(req.body.projectText || "");
    const extracted = await extractTextFromUpload(uploadedFile);
    const projectText = normalizeWhitespace([manualText, extracted.text].filter(Boolean).join("\n\n"));

    if (!projectText) {
      return res.status(400).json({
        error: "EMPTY_PROJECT_MATERIAL",
        message: extracted.warning || "请填写项目文字资料，或上传 .pptx/.txt/.md 项目材料。"
      });
    }

    const reportType = normalizeWhitespace(req.body.reportType || "evaluation");
    const createReport = reportType === "research" ? createProjectResearchReport : createEvaluationReport;
    const report = await createReport({
      projectText,
      projectName: normalizeWhitespace(req.body.projectName || ""),
      contact: normalizeWhitespace(req.body.contact || "")
    });

    res.json({
      report,
      reportType,
      input: {
        source: extracted.source || "manual_text",
        warning: extracted.warning,
        textLength: projectText.length
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("Request failed", {
    code: error.code,
    statusCode: error.statusCode || error.status,
    message: error.message,
    stack: error.stack
  });

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error: error.code,
      message: error.code === "LIMIT_FILE_SIZE" ? "上传文件超过大小限制。" : error.message
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.code || "INTERNAL_SERVER_ERROR",
    message: error.message || "服务处理失败，请稍后重试或查看服务日志。"
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Tech evaluation skill is running at http://localhost:${port}`);
});
