# 科技成果五维评估 Web Skill

这个仓库实现了一个可部署的网站与 API，用于根据项目路演 PPT 或文字资料生成科技成果五维评估报告。

## 已支持的三项能力

1. **根据项目路演 PPT 生成评估报告**
   - 支持上传 `.pptx`，服务端会抽取幻灯片与备注页文字。
   - 抽取后的内容会进入“五维评估”提示词，由千问/DashScope 兼容接口生成结构化 JSON 报告。
   - 二进制 `.ppt` 暂不直接解析，请先另存为 `.pptx`。

2. **前端网站供其他用户通过网址访问**
   - Express 后端同时托管静态前端页面。
   - 用户可填写项目名称、联系方式、文字资料，也可上传 `.pptx`、`.txt`、`.md` 文件。
   - 前端展示综合评分、评级、五维明细、亮点、风险、建议和原始 JSON。

3. **后续支持部署到阿里云**
   - 项目包含 `Dockerfile`，可构建镜像部署到阿里云 SAE、ECS、ACK 或函数计算容器运行时。
   - 模型默认使用阿里云 DashScope OpenAI 兼容接口。
   - API Key 通过环境变量注入，不写入代码或镜像。

## 技术结构

```text
.
├── data/
│   ├── system-prompt.md       # 五维评估 System Prompt
│   ├── output-schema.json     # 结构化输出 Schema
│   └── weight-presets.json    # 行业权重模板
├── public/
│   ├── index.html             # 上传与报告展示页面
│   ├── app.js
│   └── styles.css
├── src/
│   ├── server.js              # Express API 和静态站点
│   ├── evaluationService.js   # 千问/DashScope 调用与 JSON 解析
│   └── fileExtractors.js      # PPTX/TXT/MD 文本抽取
└── test/                      # Node.js 内置测试
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

```bash
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MODEL_NAME=qwen-max
PORT=3000
```

也可以设置 `OPENAI_API_KEY` 和 `MODEL_BASE_URL` 连接其他 OpenAI 兼容模型服务。

### 3. 启动

```bash
npm run dev
```

浏览器打开：

```text
http://localhost:3000
```

## API 使用

### 健康检查

```bash
curl http://localhost:3000/api/health
```

### 生成评估报告

```bash
curl -X POST http://localhost:3000/api/evaluations \
  -F "projectName=钙钛矿太阳能电池产业化项目" \
  -F "projectText=项目属于新能源材料方向，已有中试线和发明专利..." \
  -F "projectFile=@roadshow.pptx"
```

返回：

```json
{
  "report": {
    "project_name": "项目名称",
    "dimensions": {},
    "overall_score": 73.2,
    "grade": "A"
  },
  "input": {
    "source": "roadshow.pptx",
    "warning": null,
    "textLength": 12000
  }
}
```

## 阿里云部署建议

### 方案 A：SAE（推荐的轻量 Web 服务部署）

1. 在阿里云容器镜像服务 ACR 创建镜像仓库。
2. 构建并推送镜像：

   ```bash
   docker build -t <registry>/<namespace>/tech-evaluation-web-skill:latest .
   docker push <registry>/<namespace>/tech-evaluation-web-skill:latest
   ```

3. 在 SAE 创建 Web 应用：
   - 运行端口：`3000`
   - 健康检查路径：`/api/health`
   - 环境变量：
     - `DASHSCOPE_API_KEY`
     - `MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
     - `MODEL_NAME=qwen-max`
     - `MAX_UPLOAD_BYTES=20971520`
4. 绑定公网访问域名或自定义域名。

### 方案 B：ECS + Docker

```bash
docker run -d \
  --name tech-evaluation-web-skill \
  -p 80:3000 \
  -e DASHSCOPE_API_KEY=sk-your-dashscope-api-key \
  -e MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1 \
  -e MODEL_NAME=qwen-max \
  <registry>/<namespace>/tech-evaluation-web-skill:latest
```

### 方案 C：ACK / Kubernetes

将镜像部署为 Deployment，Service 暴露 `3000` 端口，并通过 Ingress 绑定域名。`DASHSCOPE_API_KEY` 应存储为 Kubernetes Secret。

## 安全与生产注意事项

- 不要把 API Key 提交到 Git，也不要写入 Dockerfile。
- 生产环境建议增加登录、上传频率限制、文件病毒扫描和对象存储归档。
- 如果要长期保存用户上传的 PPT，可接入 OSS；当前实现只在内存中解析文件，不落盘。
- `.pptx` 文本抽取基于 Office Open XML；扫描件图片或嵌入图片中的文字需要后续接入 OCR。

## 验证

```bash
npm run check
npm test
```