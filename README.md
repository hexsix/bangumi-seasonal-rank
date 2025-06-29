# Bangumi.tv 动画季度排行榜

使用Nuxt.js构建的Bangumi.tv动画季度排行榜展示网站。

## 功能

- 展示Bangumi.tv上的动画季度排行榜
- 支持查看不同季度的动画排行
- 支持表格和卡片两种查看模式
- 展示动画的名称、海报、排名、评分、评分人数、收藏人数和标签

## 开发

本项目使用Nuxt.js构建，数据直接打包在前端，无需后端支持。

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建静态网站
npm run generate
```

## 部署

项目构建后会在`dist`目录生成静态文件，可以直接部署到任何静态网站托管平台，如Cloudflare Pages、Vercel、Netlify等。

### Cloudflare Pages部署

1. 将代码推送到GitHub仓库
2. 在Cloudflare Pages创建新项目
3. 选择对应的GitHub仓库
4. 构建设置：
   - 构建命令：`npm run generate`
   - 输出目录：`dist`
5. 保存并开始部署

## 如何添加新的季度数据

1. 将新的季度JSON文件（例如 `202507.json`）放入 `static` 目录
2. 运行 `python main.py --update-seasons` 命令单独更新季度列表，或者直接执行数据更新，系统会自动更新季度列表
3. 重新构建项目

**注意：** 系统会自动扫描 `static` 目录中的JSON文件并更新 `plugins/public-files.js` 和 `store/index.js` 中的季度列表。文件名必须遵循 `YYYYMM.json` 格式（如 `202504.json`）才能被正确识别。

## 数据结构

JSON数据结构如下:

```json
{
  "title": "2025年4月（共68部）",
  "subjects": [
    {
      "date": "2025-04-01",
      "platform": "TV",
      "images": { ... },
      "name": "ある魔女が死ぬまで",
      "name_cn": "直至魔女消逝",
      "tags": [ ... ],
      "rating": {
        "rank": 6058,
        "total": 364,
        "count": { ... },
        "score": 6.2
      },
      "collection": {
        "on_hold": 30,
        "dropped": 42,
        "wish": 933,
        "collect": 38,
        "doing": 1906
      },
      "id": 501702
    },
    ...
  ]
}
```
