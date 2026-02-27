# 部署到 johorfactoryoy.com（Cloud Run）

## 一、登出并重新登录 Google Cloud

已执行登出。若需重新登录：

1. **在终端执行**（会打开浏览器或给出链接）：
   ```bash
   gcloud auth login
   ```
2. 在浏览器中用**拥有 johorfactoryoy.com 域名且要用于部署的 Google 账号**登录。
3. 若使用 `--no-launch-browser`，终端会打印一个链接，复制到浏览器打开，完成登录后把**验证码**粘贴回终端回车。

确认当前账号与项目：
```bash
gcloud auth list
gcloud config get-value project
```

## 二、设置 GCP 项目

若尚未设置或要切换到正确项目（请换成你的 GCP 项目 ID，例如 `oscar-property-1cc52` 或与 johorfactoryoy 对应的项目）：

```bash
gcloud config set project YOUR_PROJECT_ID
```

## 三、本地构建并部署到 Cloud Run

在项目根目录执行（会构建 Docker 镜像并部署到 Cloud Run）：

```bash
cd /Users/ginooh/Documents/OscarYan（property\ agent）
gcloud builds submit --config docker/cloudbuild.yaml .
```

首次运行需启用：Cloud Build API、Artifact Registry API、Cloud Run Admin API。按提示在 GCP 控制台启用即可。

部署完成后会得到 Cloud Run 服务 URL，形如：
`https://oscar-yan-property-xxxxx-as.a.run.app`

## 四、把 johorfactoryoy.com 指向 Cloud Run

### 方式 A：在 GCP 控制台操作（推荐）

1. 打开 [Cloud Run](https://console.cloud.google.com/run)，选择区域 **asia-southeast1**，点击服务 **oscar-yan-property**。
2. 顶部点 **「管理自定义网域」**（或 “Manage custom domains”）。
3. 点 **「添加映射」**，域名填 `johorfactoryoy.com`（如需也加 `www.johorfactoryoy.com`）。
4. 按页面提示在**域名注册商**（你管理 johorfactoryoy.com 的地方）添加给出的 **CNAME** 或 **A 记录**，指向 Cloud Run 提供的目标。
5. 等待 SSL 证书自动签发（通常几分钟到几十分钟）。

### 方式 B：用 gcloud 命令

```bash
# 查看当前项目与区域
gcloud run domain-mappings list --region=asia-southeast1

# 添加自定义域名映射（将 SERVICE_URL 换成上面得到的 run.app 地址）
gcloud run domain-mappings create --service=oscar-yan-property --domain=johorfactoryoy.com --region=asia-southeast1
```

然后到域名管理面板，按命令输出或控制台提示添加 CNAME/A 记录。

## 五、可选：应用默认账号（用于本地调用 API）

若本地脚本或 CI 需要调用 GCP API，可设置应用默认凭证：

```bash
gcloud auth application-default login
```

---

**小结**：登出已完成；请在终端完成 `gcloud auth login` 的验证码步骤 → 设置 `project` → 执行 `gcloud builds submit` → 在 Cloud Run 中把 johorfactoryoy.com 映射到该服务并在域名商处添加 DNS。
