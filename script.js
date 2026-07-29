const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const tabShell = document.querySelector("[data-tabs]");
const pathCards = document.querySelectorAll("[data-path]");
const pathDetail = document.querySelector(".path-detail");
const agentTitleLinks = document.querySelectorAll(".agent-title-link");
const photoInput = document.querySelector("#profile-photo-input");
const photoPreview = document.querySelector("#profile-photo-preview");
const photoPlaceholder = document.querySelector(".photo-placeholder");
const storedPhotoKey = "candidateProfilePhoto";

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

if (photoInput && photoPreview && photoPlaceholder) {
  const uploadText = photoPlaceholder.querySelector(".photo-upload-text");
  let activePreviewUrl = "";

  const showPhoto = (src) => {
    if (activePreviewUrl && activePreviewUrl !== src) URL.revokeObjectURL(activePreviewUrl);
    photoPreview.src = src;
    photoPlaceholder.classList.add("has-photo");
    if (uploadText) uploadText.textContent = "更换照片";
  };

  const saveCompressedPhoto = (file) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      const maxSize = 900;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      try {
        const compressedPhoto = canvas.toDataURL("image/jpeg", 0.82);
        localStorage.setItem(storedPhotoKey, compressedPhoto);
      } catch (error) {
        console.warn("Photo preview works, but browser storage failed.", error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    });

    image.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      if (uploadText) uploadText.textContent = "请选择 JPG/PNG";
    });

    image.src = objectUrl;
  };

  const savedPhoto = localStorage.getItem(storedPhotoKey);
  if (savedPhoto) {
    showPhoto(savedPhoto);
  }

  photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    showPhoto(previewUrl);
    activePreviewUrl = previewUrl;
    saveCompressedPhoto(file);
  });
}

agentTitleLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") {
      event.preventDefault();
      alert(`${link.dataset.agentName || "智能体"}链接待配置，提供真实链接后即可点击跳转。`);
    }
  });
});

pathCards.forEach((card) => {
  card.addEventListener("click", () => {
    const content = pathCopy[card.dataset.path];
    if (!content || !pathDetail) return;

    pathCards.forEach((item) => item.classList.toggle("active", item === card));
    pathDetail.innerHTML = `<h3>${content.title}</h3><p>${content.body}</p>`;
  });
});
