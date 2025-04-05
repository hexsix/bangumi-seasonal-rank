# Bangumi.tv 动画季度排行榜

使用Nuxt.js构建的Bangumi.tv动画季度排行榜展示网站。

## 功能

- 展示Bangumi.tv上的动画季度排行榜
- 支持查看不同季度的动画排行
- 支持表格和卡片两种查看模式
- 展示动画的名称、海报、排名、评分、评分人数、收藏人数和标签

## 开发

本项目使用Nuxt.js构建。

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

## 后端工作流

在[https://bangumi.github.io/api/](https://bangumi.github.io/api/)中获取token，保存到`.env`文件中，形如`TOKEN=123456`，运行 `python main.py`，会以如下流程工作，完整更新约20分钟。

- 爬取[优莉雅的目录](https://bgm.tv/user/lilyurey/index?page=1)，获得形如[2012年4月番（共45部）](https://bgm.tv/index/1446)的目录链接。
- 利用API获得目录(`index`)详情，详见[https://bangumi.github.io/api/](https://bangumi.github.io/api/)。
- 利用API获得动画(`subject`)的详情，详见[https://bangumi.github.io/api/](https://bangumi.github.io/api/)。
- 保存到`data/201204.json`中。 
