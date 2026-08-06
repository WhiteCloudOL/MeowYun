---
title: 上传 Minecraft 服务端包前要检查什么
description: 服务端包、目录层级、压缩格式与启动脚本，是最容易踩坑的四个位置。
date: 2026-08-04
tags: [Minecraft, MCSManager, 运维]
featured: false
sourceUrl: https://docs.meowyun.cn/rainyun/mcsm/install-mc.html
sourceLabel: 阅读 Minecraft 服务端完整教程
---

在面板里部署 Minecraft 服务端，问题往往不是出在“启动”按钮，而是更早的文件准备阶段。上传前先确认下载的是服务端包，并检查压缩格式和解压后的目录结构。

## 服务端包里通常有什么

- mods 或 plugins 目录
- config 配置目录
- sh、bat 等启动脚本
- user_jvm_args.txt 或 server.properties
- eula.txt

这些内容应该直接位于面板文件管理的根目录。如果解压后多出一层同名文件夹，需要把里面的内容移动到根目录，否则启动脚本很可能找不到核心文件。

## 上传和解压

体积较小时可以通过网页上传；大型整合包更适合使用 SFTP。面板只支持某些压缩格式时，应先在本地重新打包为 ZIP，并根据文件名语言选择合适的解压编码。

> 不要把只面向本地游玩的客户端整合包直接当作服务端包。缺少服务端核心或包含客户端专用模组时，需要使用对应的服务端包或先完成转换。

运行环境安装、启动命令和面板参数配置请继续查看完整文档。
