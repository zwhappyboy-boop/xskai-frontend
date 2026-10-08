# 前端部署 → GitHub Pages

纯静态站，直接推仓库即上线。

## 步骤

1. **建仓库**：GitHub 新建公开仓库，名字如 `xskai-site`。
2. **推代码**：把本目录所有文件推到 `main` 分支根目录。
   ```bash
   cd frontend
   git init && git add . && git commit -m "xskai 上线"
   git remote add origin git@github.com:你的用户名/xskai-site.git
   git push -u origin main
   ```
3. **开 Pages**：仓库 Settings → Pages → Source 选 `Deploy from a branch` → Branch 选 `main` / `/(root)` → Save。等 1-2 分钟，`https://你的用户名.github.io/xskai-site/` 可访问。
4. **绑域名 xskai.com**（二选一）：
   - **推荐**：DNS 用 Cloudflare 托管，域名加一条 CNAME：`@` → `你的用户名.github.io`（Cloudflare 支持根域名 CNAME）。本目录已有 `CNAME` 文件（内容 `xskai.com`），Pages 会自动识别。
   - 或按 GitHub 文档加 4 条 A 记录。
5. **HTTPS**：Pages 的 Enforce HTTPS 勾上（Cloudflare 那边也开 Flexible/Full）。

## 上线后必做

- 后端 Worker 部署好后，改 `config.js` 里的 `SITE_WORKER` 为真实 Worker 地址，重新 push。
- 把微信购买二维码命名为 `wx-buy.png` 放进 `images/` 后 push，定价页自动显示。

## 说明

- `.nojekyll`：告诉 GitHub 不要用 Jekyll 处理，原样 serve。
- `CNAME`：自定义域名，没有它 Pages 不知道 xskai.com 指向这个仓库。
- `admin.html`：卡密管理页，不在导航里，已加 `noindex`，搜索引擎不收录。
