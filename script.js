const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const tabShell = document.querySelector("[data-tabs]");
const pathCards = document.querySelectorAll("[data-path]");
const pathDetail = document.querySelector(".path-detail");

const pathCopy = {
  sales: {
    title: "路径 A：解决方案销售能力",
    body:
      "先展示锐捷重点项目的完整打单流程，再把方法论迁移到阿里云 SMB 客户：识别行业痛点、组合云产品和大模型能力、设计试点方案、用 ROI 推动成交。",
  },
  ai: {
    title: "路径 B：AI 场景落地能力",
    body:
      "先讲三个 Agent 的业务目标和交付物，再映射到阿里云 RAG、Tair、LoRA 和万小智，强调如何用低门槛 AI 应用帮助中小企业提效。",
  },
  learning: {
    title: "路径 C：学习与表达能力",
    body:
      "先用 ACP 考纲展示云计算和大模型知识框架，再用 Transformer、TensorFlow、PyTorch 说明技术理解深度，最后回到售前表达和客户沟通能力。",
  },
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (tabShell) {
  const tabButtons = tabShell.querySelectorAll("[data-tab]");
  const tabPanels = tabShell.querySelectorAll("[data-panel]");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      tabButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === target);
      });
    });
  });
}

pathCards.forEach((card) => {
  card.addEventListener("click", () => {
    const content = pathCopy[card.dataset.path];
    if (!content || !pathDetail) return;

    pathCards.forEach((item) => item.classList.toggle("active", item === card));
    pathDetail.innerHTML = `<h3>${content.title}</h3><p>${content.body}</p>`;
  });
});
