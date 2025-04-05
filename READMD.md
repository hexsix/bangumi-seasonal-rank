# Bangumi.tv anime seasonal rank

利用爬虫和API，获得动画的名称、排名、评分、评分人数、收藏人数等信息，存储到json中，并上传到GitHub指定repo。

## 工作流

- 爬取[优莉雅的目录](https://bgm.tv/user/lilyurey/index?page=1)，获得形如[2012年4月番（共45部）](https://bgm.tv/index/1446)的目录链接。
- 利用API获得目录(`index`)详情，详见`bangumi-api.dist.json`。
- 利用API获得动画(`subject`)的详情，详见`bangumi-api.dist.json`。
- 保存到`data/201204.json`中。
