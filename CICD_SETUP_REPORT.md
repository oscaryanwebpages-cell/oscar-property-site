# CI/CD 自动化部署方案 (GitHub Actions)

我已经为您设置了基于 GitHub Actions 的 CI/CD 流程。现在，每次您将代码推送到 GitHub 的 `main` 分支时，系统都会自动构建镜像并部署到 Cloud Run。

## 🛠 已完成的操作

1.  **创建流程文件**：`.github/workflows/deploy.yml` 已创建，集成了 Docker 层缓存以提速。
2.  **优化 Dockerfile**：更新了 `docker/Dockerfile` 以支持在构建时通过 ARGs 注入 `VITE_` 环境变量。
3.  **环境切换脚本**：创建了 `scripts/switch-env.sh`，方便您在多个项目间切换。
4.  **初始化 Git**：已在本地执行 `git init`。

## 🚀 后续操作 (需要您配合)

由于涉及权限和账户登录，请按以下步骤完成最后配置：

### 1. 关联 GitHub 仓库
在终端运行：
```bash
# 登录 GitHub (如果尚未登录)
gh auth login

# 创建并推送仓库 (或者手动在页面创建后关联)
gh repo create oscar-property-site --public --source=. --remote=origin --push
```

### 2. 配置 GitHub Secrets
请将以下变量添加到 GitHub 仓库设置中的 **Secrets and variables > Actions**：

| Secret 名称 | 说明 |
| :--- | :--- |
| `GCP_SA_KEY` | GCP 服务账号的 JSON 密钥 |
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | `oscar-property-1cc52` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | APP ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API Key |
| `VITE_ADMIN_EMAIL` | 管理员邮箱 |

> [!TIP]
> 所有的 `VITE_` 开头的变量可以从本地 `.env` 文件中复制。`GCP_SA_KEY` 需要在 Google Cloud Console 中为服务账号生成。

## ⚡ 部署提速说明
- 我们使用了 `cache-from: type=gha`，这能让后续部署时间控制在 **2-5 分钟** 内。
- 部署命令包含了 `--remove-secrets` 标志，确保环境变量的一致性，防止类型冲突。
