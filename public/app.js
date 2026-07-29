const form = document.querySelector("#evaluationForm");
const submitButton = document.querySelector("#submitButton");
const statusBox = document.querySelector("#status");
const resultBox = document.querySelector("#result");
const fileInput = document.querySelector('input[name="projectFile"]');
const fileHint = document.querySelector("#fileHint");

const dimensionNames = {
  innovation: "技术创新性",
  practicality: "实用性",
  market: "市场前景",
  economic: "经济效益",
  social: "社会价值"
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("正在解析材料并生成评估报告，请稍候...", "loading");
  submitButton.disabled = true;
  resultBox.hidden = true;

  try {
    const formData = new FormData(form);
    const response = await fetch("/api/evaluations", {
      method: "POST",
      body: formData
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "生成评估报告失败。");
    }

    renderReport(payload.report, payload.input);
    setStatus(payload.input?.warning || "评估报告已生成。", payload.input?.warning ? "warning" : "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  fileHint.textContent = file
    ? `已选择：${file.name}（${formatFileSize(file.size)}）`
    : "二进制 .ppt 请先另存为 .pptx；默认文件大小上限 20MB。";
});

function renderReport(report, input) {
  resultBox.hidden = false;
  document.querySelector("#projectTitle").textContent = report.project_name || "未命名项目";
  document.querySelector("#overallScore").textContent = formatScore(report.overall_score);
  document.querySelector("#grade").textContent = `评级 ${report.grade || "--"}`;

  document.querySelector("#summary").innerHTML = `
    <div><strong>行业</strong><span>${escapeHtml(report.industry || "未识别")}</span></div>
    <div><strong>权重模板</strong><span>${escapeHtml(report.weight_template || "未识别")}</span></div>
    <div><strong>阶段</strong><span>${escapeHtml(report.stage || "未识别")}</span></div>
    <div><strong>完整度</strong><span>${toPercent(report.data_completeness)}</span></div>
    <div><strong>象限</strong><span>${escapeHtml(report.quadrant?.category || "未识别")}</span></div>
    <div><strong>输入来源</strong><span>${escapeHtml(input?.source || "manual_text")}</span></div>
  `;

  const dimensionGrid = document.querySelector("#dimensionGrid");
  dimensionGrid.innerHTML = Object.entries(report.dimensions || {})
    .map(([key, dimension]) => {
      const subScores = Object.entries(dimension.sub_scores || {})
        .map(([name, item]) => `<li><strong>${escapeHtml(name)}：</strong>${formatScore(item.score)} - ${escapeHtml(item.reasoning || "")}</li>`)
        .join("");
      return `
        <article class="dimension-card">
          <div class="dimension-heading">
            <h3>${escapeHtml(dimension.name || dimensionNames[key] || key)}</h3>
            <span>${formatScore(dimension.score)}</span>
          </div>
          <p>权重：${toPercent(dimension.weight)} ｜ 置信度：${escapeHtml(dimension.confidence || "--")}</p>
          <ul>${subScores}</ul>
        </article>
      `;
    })
    .join("");

  renderList("#highlights", report.highlights);
  renderList("#risks", report.risks);
  renderList("#recommendations", report.recommendations);
  document.querySelector("#rawJson").textContent = JSON.stringify(report, null, 2);
}

function renderList(selector, items = []) {
  document.querySelector(selector).innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function setStatus(message, type) {
  statusBox.hidden = false;
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

function formatScore(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(1) : "--";
}

function toPercent(value) {
  if (!Number.isFinite(Number(value))) {
    return "--";
  }
  return `${Math.round(Number(value) * 100)}%`;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatFileSize(bytes = 0) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
