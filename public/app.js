const progressBar = document.querySelector("#readProgress");
const navLinks = Array.from(document.querySelectorAll(".top-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const copyButton = document.querySelector("#copyChain");

const chainSummary =
  "云基础设施提供稳定运行环境；Transformer 构成大模型架构基础；PyTorch、TensorFlow、DeepSpeed、Megatron 支撑模型训练；通义千问、PAI 和百炼提供阿里云模型与平台能力；RAG、微调、Agent、多模态让大模型进入企业业务流程；生产部署、安全合规、监控和成本优化决定 AI 应用能否长期稳定运行。";

window.addEventListener("scroll", () => {
  updateProgress();
  updateActiveNav();
});

copyButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(chainSummary);
    setCopyState("已复制");
  } catch {
    setCopyState("复制失败");
  }
});

updateProgress();
updateActiveNav();

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
}

function updateActiveNav() {
  const current = sections
    .filter((section) => section.getBoundingClientRect().top <= 140)
    .at(-1);

  navLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    link.classList.toggle("active", target === current);
  });
}

function setCopyState(label) {
  const original = "复制技术链路摘要";
  copyButton.textContent = label;
  window.setTimeout(() => {
    copyButton.textContent = original;
  }, 1600);
}
