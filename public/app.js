const form = document.querySelector("#evaluationForm");
const submitButton = document.querySelector("#submitButton");
const statusBox = document.querySelector("#status");
const resultBox = document.querySelector("#result");
const fileInput = document.querySelector('input[name="projectFile"]');
const fileHint = document.querySelector("#fileHint");
const printButton = document.querySelector("#printButton");

const dimensionNames = {
  innovation: "技术创新性",
  practicality: "实用性",
  market: "市场前景",
  economic: "经济效益",
  social: "社会价值"
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const reportType = new FormData(form).get("reportType");
  setStatus(reportType === "research" ? "正在联网补齐信息并生成调研报告，请稍候..." : "正在解析材料并生成评估报告，请稍候...", "loading");
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

    if (payload.reportType === "research" || payload.report?.report_type === "project_research_report") {
      renderResearchReport(payload.report, payload.input);
    } else {
      renderReport(payload.report, payload.input);
    }
    setStatus(payload.input?.warning || "报告已生成。", payload.input?.warning ? "warning" : "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

printButton.addEventListener("click", () => {
  window.print();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  fileHint.textContent = file
    ? `已选择：${file.name}（${formatFileSize(file.size)}）`
    : "二进制 .ppt 请先另存为 .pptx；默认文件大小上限 20MB。";
});

function renderReport(report, input) {
  resultBox.hidden = false;
  resultBox.classList.remove("research-document");
  document.querySelector(".result-header .eyebrow").textContent = "Evaluation Report";
  document.querySelector("#projectTitle").textContent = report.project_name || "未命名项目";
  document.querySelector("#overallScore").textContent = formatScore(report.overall_score);
  document.querySelector("#grade").textContent = `评级 ${report.grade || "--"}`;
  resetColumnHeadings("亮点", "风险", "建议");

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

function renderResearchReport(report, input) {
  resultBox.hidden = false;
  resultBox.classList.add("research-document");
  document.querySelector(".result-header .eyebrow").textContent = "Research Report";
  document.querySelector("#projectTitle").textContent = report.title || report.project_name || "项目调研报告";
  document.querySelector("#overallScore").textContent = "REPORT";
  document.querySelector("#grade").textContent = report.five_dimension_assessment?.grade
    ? `建议评级 ${report.five_dimension_assessment.grade}`
    : "调研报告";

  const metrics = Array.isArray(report.key_metrics) ? report.key_metrics : [];
  document.querySelector("#summary").innerHTML = `
    <div><strong>项目</strong><span>${escapeHtml(report.project_name || "未识别")}</span></div>
    <div><strong>行业</strong><span>${escapeHtml(report.industry || "未识别")}</span></div>
    <div><strong>外部研究</strong><span>${escapeHtml(report.external_research_status || "limited")}</span></div>
    <div><strong>输入来源</strong><span>${escapeHtml(input?.source || "manual_text")}</span></div>
    ${metrics
      .slice(0, 2)
      .map((item) => `<div><strong>${escapeHtml(item.label || "指标")}</strong><span>${escapeHtml(item.value || "--")}</span></div>`)
      .join("")}
  `;

  const summaryItems = Array.isArray(report.executive_summary) ? report.executive_summary : [];
  const assessment = report.five_dimension_assessment || {};
  const sections = Array.isArray(report.sections) ? report.sections : [];
  document.querySelector("#dimensionGrid").innerHTML = `
    <article class="report-section report-summary">
      <h3>高管摘要</h3>
      <ul>${summaryItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </article>
    <article class="report-section">
      <h3>五维评估</h3>
      <div class="assessment-grid">
        ${renderAssessmentItem("技术创新性", assessment.innovation)}
        ${renderAssessmentItem("实用性", assessment.practicality)}
        ${renderAssessmentItem("市场前景", assessment.market)}
        ${renderAssessmentItem("经济效益", assessment.economic)}
        ${renderAssessmentItem("社会价值", assessment.social)}
      </div>
      <p>综合评分：${formatScore(assessment.overall_score)} ｜ 评级：${escapeHtml(assessment.grade || "--")}</p>
    </article>
    ${sections
      .map(
        (section) => `
          <article class="report-section">
            <h3>${escapeHtml(section.heading || "报告章节")}</h3>
            <p class="section-summary">${escapeHtml(section.summary || "")}</p>
            <p>${escapeHtml(section.detail || "")}</p>
            <ul>${(section.bullets || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            ${section.citations?.length ? `<p class="citations">引用：${section.citations.map(escapeHtml).join("；")}</p>` : ""}
          </article>
        `
      )
      .join("")}
  `;

  resetColumnHeadings("关键风险", "行动建议", "待核验信息");
  renderList("#highlights", report.risks);
  renderList("#risks", report.recommendations);
  renderList("#recommendations", report.validation_needs);

  const sources = Array.isArray(report.sources) ? report.sources : [];
  document.querySelector("#rawJson").textContent = JSON.stringify(
    {
      sources,
      raw_report: report
    },
    null,
    2
  );
}

function renderAssessmentItem(label, item = {}) {
  return `
    <div>
      <strong>${label}</strong>
      <span>${formatScore(item.score)}</span>
      <small>${escapeHtml(item.rationale || "")}</small>
    </div>
  `;
}

function resetColumnHeadings(first, second, third) {
  const headings = document.querySelectorAll(".three-columns h3");
  headings[0].textContent = first;
  headings[1].textContent = second;
  headings[2].textContent = third;
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
