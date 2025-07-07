# Bangumi.tv 动画季度排行榜

使用Nuxt.js构建的Bangumi.tv动画季度排行榜展示网站，采用SSR（服务端渲染）架构，通过API获取实时数据。

## 功能

- 展示Bangumi.tv上的动画季度排行榜
- 支持查看不同季度的动画排行
- 支持多种排序方式（排名、评分、收藏人数、话均评论、抛弃率）
- 展示动画的名称、海报、排名、评分、评分人数、收藏人数和标签
- 实时数据更新，通过API获取最新季度信息
- 响应式设计，支持移动端和桌面端

## 技术架构

- **前端框架**: Nuxt.js 2.x (SSR模式)
- **UI框架**: Tailwind CSS
- **状态管理**: Vuex
- **HTTP客户端**: Axios
- **后端API**: 外部API服务 (https://api.rinshankaiho.fun)
- **部署方式**: 支持SSR部署和静态生成

## 开发

```bash
# 安装依赖
npm install

# 开发模式 (SSR)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 静态生成 (可选)
npm run generate
```

## 部署

### SSR部署 (推荐)

项目支持SSR部署，可以部署到支持Node.js的平台：

1. 构建项目：`npm run build`
2. 启动服务：`npm run start`
3. 部署到支持Node.js的平台（如Vercel、Netlify Functions、Railway等）

### 静态部署 (可选)

如果需要静态部署，可以使用：

```bash
npm run generate
```

构建后会在`dist`目录生成静态文件，可以直接部署到任何静态网站托管平台。

### Vercel部署示例

1. 将代码推送到GitHub仓库
2. 在Vercel创建新项目
3. 选择对应的GitHub仓库
4. 构建设置：
   - 构建命令：`npm run build`
   - 输出目录：`.nuxt`
   - 安装命令：`npm install`
5. 环境变量（如需要）：配置API相关环境变量
6. 保存并开始部署

## API集成

项目通过以下API端点获取数据：

- `GET /api/v0/season/available` - 获取可用季度列表
- `GET /api/v0/season/{season_id}` - 获取指定季度的动画数据

API基础URL配置在 `nuxt.config.js` 中。

## 数据结构

API返回的数据结构如下:

```json
{
  "season_id": "202510",
  "updated_at": "2025-07-07T13:38:20.756606",
  "subjects": [
    {
      "id": 507634,
      "name": "千歳くんはラムネ瓶のなか",
      "name_cn": "弹珠汽水瓶里的千岁同学",
      "images_grid": "https://lain.bgm.tv/r/100/pic/cover/l/7a/e8/507634_bITEm.jpg",
      "images_large": "https://lain.bgm.tv/pic/cover/l/7a/e8/507634_bITEm.jpg",
      "rank": 0,
      "score": 6,
      "collection_total": 873,
      "average_comment": 0,
      "drop_rate": 0.00916380297823597,
      "air_weekday": null,
      "meta_tags": ["校园", "TV", "恋爱", "日本", "小说改"],
      "updated_at": "2025-07-07T13:38:20.756606"
    }
  ]
}
```

## 环境变量

如需自定义API配置，可以在环境变量中设置：

```bash
# API基础URL
API_BASE_URL=https://api.rinshankaiho.fun
```

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

本项目基于MIT许可证开源。
