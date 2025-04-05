# Bangumi.tv anime seasonal rank

利用爬虫和API，获得动画的名称、海报、排名、评分、评分人数、收藏人数等信息，存储到json中，并上传到GitHub指定repo。

## 后端工作流

在[https://bangumi.github.io/api/](https://bangumi.github.io/api/)中获取token，保存到`.env`文件中，形如`TOKEN=123456`，运行 `python main.py`，会以如下流程工作，完整更新约20分钟。

- 爬取[优莉雅的目录](https://bgm.tv/user/lilyurey/index?page=1)，获得形如[2012年4月番（共45部）](https://bgm.tv/index/1446)的目录链接。
- 利用API获得目录(`index`)详情，详见[https://bangumi.github.io/api/](https://bangumi.github.io/api/)。
- 利用API获得动画(`subject`)的详情，详见[https://bangumi.github.io/api/](https://bangumi.github.io/api/)。
- 保存到`data/201204.json`中。

## 前端部署
