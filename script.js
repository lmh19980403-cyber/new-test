const TEMPLATE_GUIDES = {
  "转化案例复盘": {
    template: "模板1：转化案例复盘",
    column: "转化现场",
    cta: "成果转化服务入口排第一",
    titleTypes: "数字冲突型、路径型、反常识型",
    structure: [
      "开篇150字内，用结果倒叙或场景钩子切入。",
      "小标题：这项技术本来可能死在论文里。",
      "小标题：我们做了什么。写需求匹配、概念验证、中试熟化、孵化陪跑中的具体动作，不写空泛流程。",
      "小标题：关键人物的一句话。没有原话则标【待填：创始人/科学家金句】。",
      "小标题：这个案例给同类项目的3个启示。",
      "结尾从个案升到科技成果转化和产业化逻辑。"
    ]
  },
  "投资界式项目/融资报道": {
    template: "模板2：投资界式项目/融资报道",
    column: "转化现场",
    cta: "默认顺序或投资入口前置",
    titleTypes: "快讯型、路径型",
    structure: [
      "第1段一句话新闻，谁、做了什么、多少钱或什么节点，关键数据加粗。",
      "第2段用2-3句讲清项目做什么。",
      "第3段说明技术来源和壁垒。",
      "第4段写我们的具体角色，不夸大。",
      "第5段放合作方/投资方评价，没有则标【待填：引言】。",
      "第6段写下一步规划，收尾给行业判断。"
    ]
  },
  "方法论拆解": {
    template: "模板3：方法论拆解",
    column: "转化手册",
    cta: "成果转化服务入口排第一",
    titleTypes: "指南型、设问型、数字冲突型",
    structure: [
      "开篇直接给结论，不铺垫，前150字出现搜索关键词。",
      "拆成3-5个维度，每个维度包含定义、自测方法、常见误区、我们的一手观察。",
      "给一张可收藏的 Markdown 表格、清单或打分卡。",
      "收尾引导读者对照工具自查并后台私信。"
    ]
  },
  "政策解读": {
    template: "模板4：政策解读",
    column: "政策解读",
    cta: "按政策主受众调整入口顺序",
    titleTypes: "政策型、设问型",
    structure: [
      "一句话导语：政策发布时间、发布主体、文件名、真正影响读者的重点。",
      "每个要点包含原文核心概括、对你意味着什么、怎么用上。",
      "单独写我们的判断，给出有依据的趋势判断。",
      "收尾提示政策原文链接或申报咨询，缺失信息标【待填】。"
    ]
  },
  "赛道观察": {
    template: "模板5：赛道观察",
    column: "赛道拆解",
    cta: "研发合作入口排第一",
    titleTypes: "缺口型、反常识型",
    structure: [
      "以一线观察开场：我们接触团队/企业后看到的反复现象。",
      "写产业链现状：哪里强、哪里缺，公开数据和一线体感结合。",
      "拆2-3个具体技术缺口：现状、相关技术储备、商业化卡点。",
      "写我们的判断：未来转化窗口和企业合作机会。",
      "收尾邀请技术供给方和企业技术需求方来聊。"
    ]
  },
  "人物对话": {
    template: "模板6：人物对话",
    column: "对话",
    cta: "按人物和主受众调整入口顺序",
    titleTypes: "观点型、路径型",
    structure: [
      "编者按80字内：他是谁，为什么值得聊。",
      "抓1-2个有冲突感或洞察力的观点展开。",
      "写他走过最难的一段路，必须追问细节。",
      "给后来者的具体建议。",
      "我们点评2-3句，体现独立判断。"
    ]
  },
  "踩坑实录": {
    template: "模板7：踩坑实录",
    column: "踩坑实录",
    cta: "成果转化服务入口排第一",
    titleTypes: "反常识型、数字冲突型",
    structure: [
      "用一个具体踩坑瞬间开篇，制造代入感。",
      "每个坑写表现、真实损失、根因、怎么避。",
      "脱敏但不模糊，保留可学习的细节。",
      "结尾明确态度，不和稀泥。"
    ]
  },
  "基地动态与读者问答": {
    template: "模板8：基地动态与读者问答",
    column: "基地动态/问答",
    cta: "默认顺序",
    titleTypes: "快讯型、指南型",
    structure: [
      "动态不写会议纪要，结果先行、数据加粗、一句判断。",
      "活动复盘要提炼对读者的价值和释放的信号。",
      "读者问答选择有普遍性的问题，一篇解答一类困惑。",
      "篇幅短平快，不注水凑字数。"
    ]
  }
};

const BRAND_FACTS = [
  "我们是一家科技成果转化与创新孵化服务平台。",
  "核心主张：落地应用 · 投资孵化（From Lab to Market · Venture Building Ecosystem）。",
  "可直接引用资质：国家级众创空间、成都首批概念验证中心、成都首批中试熟化平台单位、成都科技企业孵化器协会成果转化服务联盟秘书长单位。",
  "业务主线：技术发掘 → 产业匹配 → 概念验证 → 中试熟化 → 孵化创投 → 产业化。",
  "服务领域按素材选择：AI、电子信息、智能硬件、新材料、生物健康、农业深加工、IC集成电路、数字经济等。",
  "宏观数据可引用：与国内外50余所高校院所建立成果转化链接；年辅导科技成果转化项目200余项；为近百家国央企、大中型公司提供技术创新合作；200+位专业导师资源库。"
];

const BANNED_WORDS = [
  "赋能",
  "抓手",
  "闭环",
  "全链条",
  "综上所述",
  "重磅",
  "突发",
  "唯一",
  "独家",
  "首选",
  "100%",
  "稳赚",
  "躺赚",
  "保本"
];

const REMOVED_BRAND_NAME = String.fromCharCode(31181, 26234);

const form = document.querySelector("#article-form");
const promptOutput = document.querySelector("#prompt-output");
const articleOutput = document.querySelector("#article-output");
const statusEl = document.querySelector("#status");
const materialCount = document.querySelector("#material-count");
const promptCount = document.querySelector("#prompt-count");
const todoCount = document.querySelector("#todo-count");
const apiEndpoint = document.querySelector("#api-endpoint");
const apiModel = document.querySelector("#api-model");
const apiKey = document.querySelector("#api-key");

function value(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
}

function countChineseChars(text) {
  return Array.from(text.replace(/\s/g, "")).length;
}

function updateStats() {
  const materials = value("materials");
  const prompt = promptOutput.value;
  const article = articleOutput.value;
  materialCount.textContent = countChineseChars(materials);
  promptCount.textContent = countChineseChars(prompt);
  todoCount.textContent = (article.match(/【待填[:：][^】]+】/g) || []).length;
}

function getCtaOrder(audience) {
  if (audience.includes("企业")) {
    return "🔬 **找研发合作** 企业技术需求对接 → 【待填：联系方式】\n🌱 **找成果转化服务** 高校/科研团队成果转化 → 【待填：联系方式】\n💰 **了解种子基金** 投资/合作 → 【待填：联系方式】";
  }

  if (audience.includes("投资")) {
    return "💰 **了解种子基金** 投资/合作 → 【待填：联系方式】\n🌱 **找成果转化服务** 高校/科研团队成果转化 → 【待填：联系方式】\n🔬 **找研发合作** 企业技术需求对接 → 【待填：联系方式】";
  }

  return "🌱 **找成果转化服务** 高校/科研团队成果转化 → 【待填：联系方式】\n🔬 **找研发合作** 企业技术需求对接 → 【待填：联系方式】\n💰 **了解种子基金** 投资/合作 → 【待填：联系方式】";
}

function buildPrompt() {
  const direction = value("direction");
  const audience = value("audience");
  const guide = TEMPLATE_GUIDES[direction];
  const facts = value("facts") || "无。只能使用素材和品牌资料中已给出的事实；缺失事实一律标【待填：具体内容】。";
  const quotes = value("quotes") || "无。不要编造金句；需要引用时标【待填：创始人/科学家/合作方原话】。";
  const requirements = value("requirements") || "无额外要求。";

  return `你是“公众号纯文字写作 Skill”，以干了15年公众号内容的老编辑标准写稿。

## 本次任务
- 文章主题 / 任务：${value("topic") || "【待填：文章主题】"}
- 选题方向：${direction}
- 文章模板：${guide.template}
- 栏目建议：${guide.column}
- 主打读者：${audience}
- 预计字数：${value("length")}
- CTA 顺序：${guide.cta}

## 品牌资料（可直接引用）
${BRAND_FACTS.map((item) => `- ${item}`).join("\n")}

## 写作总原则
1. 只输出纯 Markdown 文本，不输出 HTML，不做微信排版。
2. 口吻是机构品牌号：专业、克制、有判断，介于商业报道与成果转化干货之间。
3. 每段尽量不超过3行；每300-500字一个有信息量的小标题。
4. 开篇150字内必须有钩子：场景、数字或反常识三选一。
5. 关键数字用 Markdown 加粗，全文5-10处即可，不滥用。
6. 至少1个引用块。没有真实原话时，不要编造，标【待填：金句原话】。
7. 每个案例或观点后都要回答“所以对读者有什么用”。
8. 结尾从个案升到产业、成果转化或投资孵化逻辑。
9. 自称统一用“我们”。最终稿不得输出旧品牌名称；原本需要出现旧品牌名称的位置，一律改写为“我们”。
10. 不使用这些词或表达：${BANNED_WORDS.join("、")}。

## 事实与合规红线
- 不编造事实。素材中没有的人名、机构、合作关系、金额、融资、专利、时间、联系方式，一律写成【待填：具体内容】。
- 未获授权的客户案例需脱敏为“某高校团队”“一家做××的企业”等。
- 不夸大我们的角色。可写“发掘、匹配、验证、熟化、陪跑、孵化”，不要写“唯一、第一、独家”等。
- 涉及投资判断时加“本文不构成投资建议。”
- 发布前必须在正文外列出所有【待填】项清单。

## 本模板结构要求
${guide.structure.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## 标题车间要求
- 生成5个标题备选，覆盖这些标题类型：${guide.titleTypes}。
- 主推标题前加“★”，标题≤30字，核心信息前置，至少含一个搜索关键词：成果转化 / 概念验证 / 中试 / 孵化 / 研发合作 / 专利 / 高校 / 创业。
- 写54字以内摘要，不重复标题。
- 给封面建议：主图内容建议 + 视觉重点位置提醒。

## 用户提供的素材
${value("materials") || "【待填：用户素材】"}

## 已确认的关键数据
${facts}

## 可引用原话 / 金句
${quotes}

## 额外要求
${requirements}

## 固定名片框，请按主打读者调整入口顺序
🏢 **我们**

技术发掘 → 概念验证 → 中试熟化 → 孵化创投：依托国家级众创空间和成都首批概念验证中心资质，陪硬科技项目从实验室走到市场。

${getCtaOrder(audience)}

## 最终交付格式
请严格按以下结构输出：

## 文章信息
- 选题方向 / 模板 / 主打读者：
- 预计字数：
- 建议合集标签：

## 标题（5选1，★为主推）
★ 1.
  2.
  3.
  4.
  5.

## 摘要（54字内）

## 封面建议

---

[以下为正文，纯 Markdown 格式]

我们

> 导语（可选）

正文...

---

💬 聊聊

你的成果卡在哪个环节了？留言说说，我们看到都会回。

---

🏢 **我们**

技术发掘 → 概念验证 → 中试熟化 → 孵化创投：依托国家级众创空间和成都首批概念验证中心资质，陪硬科技项目从实验室走到市场。

${getCtaOrder(audience)}

*本文由我们原创。转载请联系后台授权。*

---

## ⚠️ 待填项清单（发布前必须替换）

## 发布前自查清单
- [ ] 标题≤30字、核心信息在前13字、含搜索关键词
- [ ] 摘要已手写且54字内
- [ ] 开篇150字内有钩子
- [ ] 关键数字已加粗、至少1个金句引用块
- [ ] 无极限词/无诱导分享/金融表述合规
- [ ] 所有待填项已替换
- [ ] 名片框3条入口联系方式已填`;
}

function generatePrompt() {
  const prompt = buildPrompt();
  promptOutput.value = prompt;
  setStatus("提示词已生成");
  updateStats();
  return prompt;
}

function loadApiConfig() {
  const config = JSON.parse(localStorage.getItem("wechatWriterApiConfig") || "{}");
  apiEndpoint.value = config.endpoint || "";
  apiModel.value = config.model || "";
  apiKey.value = config.key || "";
}

function saveApiConfig() {
  localStorage.setItem(
    "wechatWriterApiConfig",
    JSON.stringify({
      endpoint: apiEndpoint.value.trim(),
      model: apiModel.value.trim(),
      key: apiKey.value.trim()
    })
  );
  setStatus("API 配置已保存");
}

async function generateArticle() {
  const prompt = generatePrompt();
  const endpoint = apiEndpoint.value.trim();
  const model = apiModel.value.trim();
  const key = apiKey.value.trim();

  if (!endpoint || !model || !key) {
    setStatus("请先填写 API Endpoint、Model 和 Key", true);
    return;
  }

  setStatus("正在调用模型生成...");
  articleOutput.value = "";
  updateStats();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是一名资深中文公众号编辑，严格按用户给定的品牌、模板、合规和交付格式输出。"
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      "模型返回为空，请检查接口响应格式。";

    articleOutput.value = content.trim().replaceAll(REMOVED_BRAND_NAME, "我们");
    setStatus("推文已生成");
  } catch (error) {
    setStatus("生成失败，请检查 API 配置或跨域限制", true);
    articleOutput.value = `生成失败：\n${error.message}`;
  } finally {
    updateStats();
  }
}

async function copyTarget(id) {
  const target = document.querySelector(`#${id}`);
  if (!target.value.trim()) {
    setStatus("没有可复制的内容", true);
    return;
  }

  await navigator.clipboard.writeText(target.value);
  setStatus("已复制到剪贴板");
}

function loadExample() {
  document.querySelector("#topic").value = "把一场概念验证项目路演活动写成我们的公众号文章";
  document.querySelector("#direction").value = "基地动态与读者问答";
  document.querySelector("#audience").value = "高校/科研院所团队";
  document.querySelector("#length").value = "800-1200字";
  document.querySelector("#materials").value =
    "活动素材：我们在成都高新区菁蓉汇组织了一场概念验证项目路演，参与方包括高校科研团队、企业技术负责人、投资机构代表。现场重点讨论了AI检测、智能硬件、新材料三个方向的早期项目。多位团队提到共同难点：技术指标在实验室可行，但缺少真实应用场景、验证经费和中试资源。我们的技术经理人围绕需求匹配、概念验证方案设计、企业场景对接和后续孵化路径做了点评。活动后已有若干项目进入进一步沟通。";
  document.querySelector("#facts").value =
    "可引用资质：国家级众创空间、成都首批概念验证中心、成都首批中试熟化平台单位。与国内外50余所高校院所建立成果转化链接，年辅导科技成果转化项目200余项。";
  document.querySelector("#quotes").value =
    "现场有老师说：我们过去更关心技术能不能做出来，现在才发现，还要证明有没有人愿意用。";
  document.querySelector("#requirements").value =
    "不要写具体项目名称；突出概念验证不是写材料，而是验证真实需求；文末引导高校团队留言咨询。";
  generatePrompt();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generatePrompt();
});

document.querySelector("#generate-article").addEventListener("click", generateArticle);
document.querySelector("#save-api").addEventListener("click", saveApiConfig);
document.querySelector("#load-example").addEventListener("click", loadExample);

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyTarget(button.dataset.copy));
});

["materials", "topic", "facts", "quotes", "requirements"].forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("input", updateStats);
});

loadApiConfig();
updateStats();
