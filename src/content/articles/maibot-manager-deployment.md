---
title: 用 MaiBot Manager 管理机器人服务
description: 用一个 TUI/CLI 工具串起 MaiBot 安装、更新、服务管理和插件维护。
date: 2026-08-05
tags: [MaiBot, Rust, 运维]
featured: false
cover: anime-sky-city.webp
sourceUrl: https://docs.meowyun.cn/qqbot/maibot/install.html
sourceLabel: 查看 MaiBot 部署文档
---

MaiBot Manager 是一个以 Rust 编写的部署与运维工具。它把 MaiBot、NapCat、LLBot 的安装和运行状态放进同一个终端界面，同时保留 CLI 命令，适合服务器管理和自动化场景。

## 它解决了哪些重复工作

- 安装或更新 MaiBot，并管理核心服务启停
- 安装和管理 NapCat、LLBot 等协议端
- 检查基础依赖，根据环境选择可用的软件源
- 汇总 WebUI 地址、密钥和访问配置
- 安装、卸载插件并处理依赖

## 推荐的使用顺序

安装管理器后进入“部署与更新”，先确认安装目录、Python 环境和协议端选择，再执行安装。完成后启动 MaiBot，检查访问配置与日志，最后再接入插件和消息平台。

> 把 WebUI 绑定到公网地址前，应配置强访问令牌，并通过防火墙或安全组限制访问来源。

不同系统的安装命令、快捷键和平台差异会随版本调整，详情以文档站的完整指南为准。
