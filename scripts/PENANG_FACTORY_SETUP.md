1# Penang Factory Listing 设置说明

## 1. 部署 Storage 规则

已更新 `storage.rules`，并已在项目根目录添加 **firebase.json** 和 **.firebaserc**（项目 ID: oscar-property-1cc52），因此可以直接部署。

在项目根目录执行：

```bash
cd "/Users/ginooh/Documents/OscarYan（property agent）"
npx firebase deploy --only storage
```

- 使用 **npx** 无需全局安装 Firebase CLI，也不会遇到 `EACCES` 权限问题。
- 若首次使用，终端会提示登录 Firebase（`npx firebase login`），按提示完成即可。
- 若已全局安装过 `firebase-tools`，也可直接执行 `firebase deploy --only storage`。

### 若出现 403 Permission denied（无法启用 firebasestorage.googleapis.com）

1. **用项目拥有者账号登录**  
   在终端执行 `npx firebase login`，确保登录的是 **创建该 Firebase 项目** 的 Google 账号（或该项目的 Owner）。

2. **在 Google Cloud 控制台启用 API**  
   - 打开：<https://console.cloud.google.com/apis/library/firebasestorage.googleapis.com?project=oscar-property-1cc52>  
   - 若提示无权限，先切换到正确账号或让项目拥有者操作。  
   - 点击 **「启用」**，等待启用完成。

3. **检查项目权限**  
   - 打开 [Google Cloud IAM](https://console.cloud.google.com/iam-admin/iam?project=oscar-property-1cc52)。  
   - 确认你的账号具有 **所有者** 或 **编辑者** 角色；若项目在组织下，需有「Service Usage 管理员」或可启用 API 的权限。

4. **再次部署**  
   ```bash
   npx firebase deploy --only storage
   ```

## 2. 获取「penang factory」内图片的下载链接

**注意**：Storage 规则中路径不能包含空格。请把文件放在 **uploads/** 下且文件夹名不含空格，例如 `uploads/penang_factory/`。若你之前建的是 `penang factory`（有空格），可在 Firebase Console 里新建 `uploads/penang_factory` 并移动或重新上传文件。

任选其一：

**方式 A：Firebase Console**  
1. 打开 [Firebase Console](https://console.firebase.google.com/) → 你的项目 → Storage。  
2. 进入文件夹 `uploads/penang_factory`（或你使用的无空格路径）。  
3. 点击每张图片/文件 → 在详情中复制「下载链接」，存成列表备用。

**方式 B：Admin 后台（若已实现「列出 Storage」功能）**  
在 Admin 页面若有「输入 Storage 路径并列出文件」的输入框，输入 `uploads/penang_factory`，即可在页面上看到每份文件的下载 URL。  

（项目已在 `services/firebase.ts` 中提供 `listStorageFolder(folderPath)`，可在 Admin 里加一个按钮调用并显示这些 URL。）

把得到的 **图片 URL** 复制下来，稍后填到 listing 的 **主图 (imageUrl)** 和 **轮播图 (images)**。

## 3. 根据 Fact Sheet 填写 listing 内容

请根据你上传的 **fact sheet** 补全以下信息（可发给我或直接在 Admin 里改）：

- **price**：售价（数字，如 5000000）
- **landSize**：土地/建筑面积（如 "2.5 Acres" 或 "50,000 sqft"）
- **tenure**：Freehold / Leasehold
- **description**：从 fact sheet 整理的完整描述

## 4. 在 Admin 后台创建该 listing

1. 登录 Admin：打开 `/admin`，用你的 Admin 账号登录。
2. 在「房源管理」里点「新建房源」。
3. 按 `scripts/penang-factory-listing.json` 的字段填写，并把第 2 步得到的图片 URL 填到：
   - **主图 (imageUrl)**：第一张图 URL
   - **轮播图 (images)**：所有工厂图片的 URL 数组
4. 将第 3 步中从 fact sheet 整理好的 **price、landSize、tenure、description** 填入并保存。

## 5. 静态 fallback（constants）

已在 `constants.ts` 中加入 Penang Factory 的 fallback 数据；若 Firestore 暂无该条或加载失败，会显示这条。在 Admin 创建并发布后，前台会优先显示 Firestore 的数据。

---

若你把 fact sheet 的文字内容贴给我，我可以直接帮你写好 **price、landSize、tenure、description** 的最终版本，你只需复制到 Admin 或更新 `scripts/penang-factory-listing.json` 即可。
