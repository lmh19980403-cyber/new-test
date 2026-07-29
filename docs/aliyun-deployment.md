# 阿里云部署指南

本文档给出把科技成果五维评估 Web Skill 部署到阿里云的推荐路径。推荐优先使用 **SAE + ACR + DashScope**，因为它适合轻量 Web 服务，省去服务器运维。

## 一、部署前准备

### 1. 准备 DashScope API Key

在阿里云百炼 / DashScope 控制台创建 API Key。部署时通过环境变量注入：

```bash
DASHSCOPE_API_KEY=sk-xxxx
MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MODEL_NAME=qwen-max
MODEL_ENABLE_SEARCH=false
MODEL_RESPONSE_FORMAT=none
PORT=3000
```

不要把 API Key 写入 Git、Dockerfile 或前端代码。

### 2. 开通容器镜像服务 ACR

创建一个镜像仓库，例如：

```text
registry.cn-hangzhou.aliyuncs.com/<namespace>/tech-evaluation-web-skill
```

## 二、构建并推送镜像

### 方式 A：GitHub Actions 自动构建（适合没有 Docker 经验）

仓库已提供 `.github/workflows/build-and-push-acr.yml`。你只需要在 GitHub 配置以下 Secrets：

```text
ALIYUN_REGISTRY=crpi-xxxx.cn-hangzhou.personal.cr.aliyuncs.com
ALIYUN_NAMESPACE=tech-eval
ALIYUN_REPOSITORY=tech-evaluation-web-skill
ALIYUN_USERNAME=你的 ACR 登录用户名
ALIYUN_PASSWORD=你的 ACR 登录密码
```

然后进入 GitHub 仓库：

```text
Actions > Build and push ACR image > Run workflow
```

`image_tag` 填：

```text
latest
```

运行成功后，ACR 的“镜像版本”页面会出现 `latest`。

### 方式 B：本地 Docker 构建

在本地或 CI 环境执行：

```bash
npm install
npm run check
npm test
docker build -t registry.cn-hangzhou.aliyuncs.com/<namespace>/tech-evaluation-web-skill:latest .
docker push registry.cn-hangzhou.aliyuncs.com/<namespace>/tech-evaluation-web-skill:latest
```

如果使用企业 CI/CD，可把 `latest` 替换为 Git commit SHA 或版本号。

## 三、使用 SAE 部署

1. 打开阿里云 **Serverless 应用引擎 SAE**。
2. 创建应用：
   - 应用类型：Web 应用
   - 部署方式：镜像部署
   - 镜像地址：上一步推送到 ACR 的镜像
   - 运行端口：`3000`
3. 配置环境变量：

   ```text
   DASHSCOPE_API_KEY=sk-xxxx
   MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   MODEL_NAME=qwen-max
   MODEL_TEMPERATURE=0.3
   MODEL_ENABLE_SEARCH=false
   MODEL_RESPONSE_FORMAT=none
   MAX_UPLOAD_BYTES=20971520
   ```

4. 配置健康检查：
   - 路径：`/api/health`
   - 协议：HTTP
   - 端口：`3000`
5. 开启公网访问，绑定 SAE 默认域名或自定义域名。

部署完成后访问：

```text
https://你的域名/
```

## 四、ECS + Docker 部署方式

如果你希望自己管理服务器，可以在 ECS 上运行：

```bash
docker run -d \
  --name tech-evaluation-web-skill \
  --restart unless-stopped \
  -p 80:3000 \
  -e DASHSCOPE_API_KEY=sk-xxxx \
  -e MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1 \
  -e MODEL_NAME=qwen-max \
  -e MODEL_ENABLE_SEARCH=false \
  -e MODEL_RESPONSE_FORMAT=none \
  registry.cn-hangzhou.aliyuncs.com/<namespace>/tech-evaluation-web-skill:latest
```

建议同时配置：

- 安全组放行 80/443。
- Nginx + HTTPS 证书。
- 日志采集。
- API Key 使用 ECS 环境变量或密钥管理服务 KMS 注入。

## 五、生产环境建议

- 增加登录或访问白名单，避免公开滥用模型额度。
- 对上传文件增加频率限制、大小限制和病毒扫描。
- 如需保存历史报告，新增数据库表和 OSS 文件存储。
- 如 PPT 中有大量图片文字，接入 OCR 后再传给评估模型。
- 若访问量较大，建议增加任务队列，把生成报告改为异步任务。
