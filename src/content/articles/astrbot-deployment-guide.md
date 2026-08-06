---
title: AstrBot 部署前的路线选择
description: 从运行环境、WebUI 到消息平台接入，先理清一条可维护的部署链路。
date: 2026-08-06
tags: [AstrBot, QQ机器人, 部署]
featured: true
icon: message-circle
sourceUrl: https://docs.meowyun.cn/qqbot/astrbot/intro.html
sourceLabel: 阅读 AstrBot 完整指南
---

AstrBot 是一个面向多消息平台的开源 AI 机器人框架，可以通过统一的 WebUI 管理模型、平台适配器、插件和运行日志。真正开始部署前，先根据运行环境选择合适方式，会比照着命令一路复制更稳妥。

## 怎么选择部署方式

- 云服务器长期运行：优先考虑 Docker，方便隔离依赖、迁移数据与更新版本
- Linux 宿主机直接运行：可以使用 uv 与 AstrBot CLI 管理环境
- Windows 本地体验：适合调试和轻量运行
- 二次开发：选择源码方式，便于检查代码、依赖和日志

## 一条完整的验收链路

先确认 AstrBot 本体正常启动，再登录 WebUI 配置模型服务；随后接入 NapCat 等消息协议端，最后发送一条真实测试消息，并同时检查机器人和协议端日志。

> 首次登录后应及时修改密码。API Key、WebUI 密码和 OneBot Token 都不应该出现在公开截图或 Git 仓库中。

本文只保留路线概览，完整的 Docker、Linux 和 Windows 操作步骤请进入清蒸云鸭文档继续阅读。
