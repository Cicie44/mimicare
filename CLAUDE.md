# CLAUDE.md
# CLAUDE.md

## Project Overview

This project is called **MimiCare**.

MimiCare is a cute pet care diary web app inspired by the owner's real cat, Mimi. The goal is to create a warm, friendly, and practical website for cat owners to manage pet profile information, vaccine records, care reminders, daily diary entries, and photo memories.

This project is intended for both real use and portfolio presentation. Code quality, UI polish, readability, and clear project structure are important.

---

## Product Goal

Build a cute and useful pet care diary app that helps cat owners:

* View and manage a pet profile
* Track vaccine and health records
* Manage daily care reminders
* Record daily mood, food, activities, and notes
* Display pet photo memories
* Eventually support user login, database storage, and photo upload

The first version should be frontend-only with mock data. Backend and Supabase integration should be added later.

---

## Target User

The target user is a cat owner who wants a simple and friendly way to keep track of their pet’s care information.

The example pet is:

* Name: Mimi
* Species: Cat
* Style: cute, warm, gentle, personal

---

## Tech Stack

Preferred stack:

* React
* TypeScript
* Vite
* Tailwind CSS

Future stack:

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

Avoid adding extra libraries unless they are clearly useful.

---

## Development Phases

### Phase 1: Static Frontend

Build a beautiful frontend using mock data.

Required features:

* Home page
* Pet profile section
* Vaccine tracker section
* Care reminders section
* Photo gallery section
* Diary section
* Responsive layout

No backend is required in Phase 1.

### Phase 2: Local CRUD

Add basic create, edit, and delete interactions on the frontend.

Possible features:

* Add diary entry
* Add reminder
* Mark reminder as done
* Edit pet profile
* Add mock photo card

Data can still be stored locally or in frontend state.

### Phase 3: Supabase Integration

Add real persistence with Supabase.

Possible tables:

* pets
* vaccines
* reminders
* diary_entries
* photos

Add Supabase only after the frontend structure is stable.

### Phase 4: Authentication and Uploads

Add:

* User login
* User-specific pet data
* Photo upload
* Multi-pet support if needed

---

## Main Pages

### Home

The home page should include:

* Cute hero section
* Short introduction
* Mimi profile summary
* Next vaccine due card
* Reminder summary
* Recent diary entry
* Photo preview

### Pet Profile

Should display:

* Pet name
* Species
* Breed if available
* Age
* Gender
* Indoor status
* Neutered status
* Personality
* Avatar

### Vaccine Tracker

Should display:

* Vaccine name
* Dose number
* Date given
* Next due date
* Vet clinic
* Notes

Use a card layout or timeline layout.

### Care Reminders

Should display:

* Reminder title
* Category
* Due date
* Status
* Notes

Statuses:

* pending
* done
* overdue

### Photo Gallery

Should display:

* Image
* Caption
* Tags
* Date

Use a cute responsive grid.

### Diary

Should display:

* Date
* Mood
* Food
* Activity
* Notes

Suggested moods:

* happy
* sleepy
* playful
* grumpy
* sick
* calm

---

## Design Direction

The UI should feel:

* Cute
* Warm
* Friendly
* Soft
* Personal
* Clean enough for a developer portfolio

Suggested visual style:

* Cream background
* Soft pink
* Peach
* Warm orange
* White cards
* Rounded corners
* Gentle shadows
* Cat paw icons or emoji
* Friendly spacing
* Mobile-friendly layout

Avoid:

* Dark corporate style
* Overly complex dashboards
* Too many harsh colors
* Messy layout
* Unnecessary animations

---

## Suggested Color Palette

Use Tailwind classes where possible.

Suggested colors:

* Background: cream / orange-50 / rose-50
* Primary: pink / rose
* Secondary: orange / amber
* Text: gray-700 / gray-800
* Cards: white
* Accent: peach / warm yellow

---

## Code Style Rules

Please follow these rules:

1. Use TypeScript properly.
2. Create reusable components.
3. Keep files small and readable.
4. Use clear names for components, types, and mock data.
5. Avoid deeply nested logic.
6. Avoid unnecessary abstraction.
7. Do not add large dependencies without explaining why.
8. Prefer simple, maintainable code.
9. Keep styling consistent.
10. Make the layout responsive.

---

## Component Guidelines

Suggested component structure:

* `components/layout/Navbar.tsx`
* `components/layout/Footer.tsx`
* `components/pet/PetProfileCard.tsx`
* `components/health/VaccineCard.tsx`
* `components/reminders/ReminderCard.tsx`
* `components/gallery/PhotoCard.tsx`
* `components/diary/DiaryCard.tsx`
* `data/mockData.ts`
* `types/index.ts`

Use this structure only if it fits the project. Do not overcomplicate the app too early.

---

## Data Modeling Guidelines

Use clear TypeScript types.

Suggested types:

```ts
export type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender: string;
  birthday?: string;
  ageLabel: string;
  neutered: boolean;
  indoor: boolean;
  personality: string[];
  avatarUrl?: string;
};

export type VaccineRecord = {
  id: string;
  petId: string;
  name: string;
  doseNumber: number;
  dateGiven: string;
  nextDueDate?: string;
  clinicName?: string;
  notes?: string;
};

export type Reminder = {
  id: string;
  petId: string;
  title: string;
  category: string;
  dueDate: string;
  status: "pending" | "done" | "overdue";
  notes?: string;
};

export type DiaryEntry = {
  id: string;
  petId: string;
  date: string;
  mood: "happy" | "sleepy" | "playful" | "grumpy" | "sick" | "calm";
  food?: string;
  activity?: string;
  notes?: string;
};

export type PetPhoto = {
  id: string;
  petId: string;
  imageUrl: string;
  caption: string;
  tags: string[];
  date: string;
};
```

---

## Claude Code Working Rules

When working on this project, always follow these rules:

### Before Making Changes

* Inspect the existing project structure first.
* Briefly explain the plan.
* Identify which files will be changed.
* Do not assume the project structure without checking.

### During Coding

* Make small and focused changes.
* Do not rewrite the whole project unless explicitly requested.
* Do not delete files unless necessary.
* If a file must be deleted or replaced, explain why.
* Preserve working code.
* Keep the app runnable after each major step.

### After Making Changes

* Summarize what changed.
* Mention which files were updated.
* Mention how to test the change.
* Mention any known limitations.
* Update README.md if the change affects setup, features, or project structure.

---

## Safety Rules

Do not:

* Expose API keys
* Commit `.env` files
* Hardcode secrets
* Delete important files without explanation
* Install unnecessary packages
* Make destructive Git operations
* Run risky terminal commands without explaining them first

If environment variables are needed, create or update `.env.example` instead.

---

## Git Rules

Use clear commit-style summaries when explaining changes.

Preferred commit message style:

* `feat: add pet profile card`
* `feat: add vaccine tracker section`
* `feat: add care reminders`
* `feat: add diary mock data`
* `style: improve responsive layout`
* `refactor: extract reusable card components`
* `docs: update README`

Avoid vague commit messages such as:

* `update`
* `fix`
* `final`
* `changes`
* `test`

---

## README Requirements

The README should eventually include:

* Project name
* Short overview
* Features
* Tech stack
* Screenshots
* How to run locally
* Project structure
* What I learned
* Future improvements

The project should be presented as a portfolio-ready full-stack web app, even if the first version is frontend-only.

---

## Portfolio Positioning

This project should show:

* Frontend UI design ability
* React and TypeScript skills
* Component-based development
* Data modeling
* Product thinking
* Personal storytelling
* Ability to build a polished, real-world inspired app

The project should not look like a basic todo list. It should feel like a thoughtful pet care product.

---

## Future Ideas

Possible future improvements:

* Supabase database integration
* User authentication
* Photo upload
* Multi-pet support
* Calendar view for vaccines and reminders
* Health record export
* Mobile-first design improvements
* AI-generated pet care summary
* Reminder notifications

Do not implement future ideas until the current phase is stable.

## 项目概述

本项目名称为 **MimiCare**。

MimiCare 是一个可爱的宠物照护日记网站，灵感来自项目作者真实养的猫咪 Mimi。这个项目的目标是做一个温暖、友好、实用的网站，帮助猫主人记录宠物资料、疫苗记录、照护提醒、日常日记和照片回忆。

这个项目既是一个真实可用的小工具，也会作为个人作品集项目展示。因此，代码质量、页面美观度、项目结构清晰度和可读性都很重要。

---

## 产品目标

MimiCare 希望帮助猫主人完成以下事情：

* 查看和管理宠物资料
* 记录疫苗和健康信息
* 管理日常照护提醒
* 记录每日心情、饮食、活动和备注
* 展示宠物照片回忆
* 后续支持用户登录、数据库保存和照片上传

第一版只需要做前端静态版本，使用 mock data。后端和 Supabase 集成后续再添加。

---

## 目标用户

目标用户是希望用简单、友好的方式记录宠物照护信息的猫主人。

示例宠物信息：

* 名字：Mimi
* 种类：Cat
* 风格：可爱、温暖、温柔、有个人故事感

---

## 技术栈

优先使用：

* React
* TypeScript
* Vite
* Tailwind CSS

后续可能使用：

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

除非有明确必要，不要随意添加额外依赖库。

---

## 开发阶段

### Phase 1：静态前端版本

先使用 mock data 做一个漂亮的前端页面。

需要包含：

* Home 页面
* 宠物资料区域
* 疫苗记录区域
* 照护提醒区域
* 照片墙区域
* 日记区域
* 响应式布局

Phase 1 不需要后端，也不需要数据库。

---

### Phase 2：本地交互和 CRUD

在前端添加基础的新增、编辑、删除功能。

可添加功能：

* 新增日记
* 新增提醒
* 将提醒标记为完成
* 编辑宠物资料
* 新增模拟照片卡片

数据可以先保存在前端 state 或 localStorage 中。

---

### Phase 3：Supabase 集成

当前端结构稳定后，再接入 Supabase，实现真实数据保存。

可能需要的表：

* pets
* vaccines
* reminders
* diary_entries
* photos

不要在 Phase 1 就加入 Supabase。

---

### Phase 4：登录和图片上传

后续可添加：

* 用户登录
* 用户自己的宠物数据
* 图片上传
* 多宠物支持

---

## 主要页面和功能

### Home 页面

Home 页面应包含：

* 可爱的 hero section
* MimiCare 的简短介绍
* Mimi 的资料概览
* 下一针疫苗提醒卡片
* 日常提醒概览
* 最近一条日记
* 照片预览

---

### Pet Profile 宠物资料

需要展示：

* 宠物名字
* 种类
* 品种，如果有的话
* 年龄
* 性别
* 是否室内饲养
* 是否绝育
* 性格特点
* 头像

---

### Vaccine Tracker 疫苗记录

需要展示：

* 疫苗名称
* 第几针
* 接种日期
* 下一针日期
* 宠物诊所名称
* 备注

可以使用卡片布局或时间线布局。

---

### Care Reminders 照护提醒

需要展示：

* 提醒标题
* 类型
* 截止日期
* 状态
* 备注

状态包括：

* pending
* done
* overdue

---

### Photo Gallery 照片墙

需要展示：

* 图片
* 图片标题
* 标签
* 日期

使用可爱的响应式网格布局。

---

### Diary 日记

需要展示：

* 日期
* 心情
* 饮食
* 活动
* 备注

建议心情类型：

* happy
* sleepy
* playful
* grumpy
* sick
* calm

---

## 设计方向

整体 UI 应该呈现以下感觉：

* 可爱
* 温暖
* 友好
* 柔和
* 有个人故事感
* 同时足够干净，可以作为作品集展示

建议视觉风格：

* 奶油色背景
* 浅粉色
* 蜜桃色
* 暖橘色
* 白色卡片
* 大圆角
* 柔和阴影
* 猫爪 icon 或 emoji
* 舒适的页面间距
* 移动端友好

避免：

* 太商务、太冷淡的深色风格
* 过度复杂的 dashboard
* 太多刺眼颜色
* 杂乱布局
* 不必要的动画

---

## 建议配色

尽量使用 Tailwind CSS class。

建议颜色方向：

* 背景：cream / orange-50 / rose-50
* 主色：pink / rose
* 辅助色：orange / amber
* 文字：gray-700 / gray-800
* 卡片：white
* 点缀色：peach / warm yellow

---

## 代码风格要求

请遵守以下规则：

1. 正确使用 TypeScript。
2. 创建可复用组件。
3. 保持文件简洁、清晰、可读。
4. 组件名、类型名、mock data 命名要清楚。
5. 避免过深的逻辑嵌套。
6. 避免不必要的抽象。
7. 不要在没有解释原因的情况下添加大型依赖。
8. 优先写简单、可维护的代码。
9. 保持整体样式一致。
10. 页面需要支持响应式布局。

---

## 组件结构建议

可以参考以下结构：

```text
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pet/
│   │   └── PetProfileCard.tsx
│   ├── health/
│   │   └── VaccineCard.tsx
│   ├── reminders/
│   │   └── ReminderCard.tsx
│   ├── gallery/
│   │   └── PhotoCard.tsx
│   └── diary/
│       └── DiaryCard.tsx
├── data/
│   └── mockData.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

这个结构只是建议。如果实际项目结构不适合，可以适当调整，但不要一开始过度复杂化。

---

## 数据类型建议

请使用清晰的 TypeScript types。

建议类型如下：

```ts
export type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender: string;
  birthday?: string;
  ageLabel: string;
  neutered: boolean;
  indoor: boolean;
  personality: string[];
  avatarUrl?: string;
};

export type VaccineRecord = {
  id: string;
  petId: string;
  name: string;
  doseNumber: number;
  dateGiven: string;
  nextDueDate?: string;
  clinicName?: string;
  notes?: string;
};

export type Reminder = {
  id: string;
  petId: string;
  title: string;
  category: string;
  dueDate: string;
  status: "pending" | "done" | "overdue";
  notes?: string;
};

export type DiaryEntry = {
  id: string;
  petId: string;
  date: string;
  mood: "happy" | "sleepy" | "playful" | "grumpy" | "sick" | "calm";
  food?: string;
  activity?: string;
  notes?: string;
};

export type PetPhoto = {
  id: string;
  petId: string;
  imageUrl: string;
  caption: string;
  tags: string[];
  date: string;
};
```

---

## Claude Code 工作规则

在本项目中工作时，请始终遵守以下规则。

### 修改代码之前

* 先检查当前项目结构。
* 简短说明计划。
* 说明准备修改哪些文件。
* 不要在没有检查项目结构的情况下直接假设。

---

### 编码过程中

* 每次只做小而明确的修改。
* 除非明确要求，不要重写整个项目。
* 不要随意删除文件。
* 如果必须删除或替换文件，先说明原因。
* 保留已经能正常工作的代码。
* 每个主要步骤完成后，项目都应该尽量保持可运行状态。

---

### 修改完成后

请总结：

* 改了什么
* 更新了哪些文件
* 我应该如何测试
* 是否有已知限制
* 如果影响了安装、功能或项目结构，需要更新 README.md

---

## 安全规则

不要做以下事情：

* 暴露 API key
* 提交 `.env` 文件
* 硬编码 secret
* 未解释原因就删除重要文件
* 安装不必要的 package
* 执行危险的 Git 操作
* 在没有解释的情况下运行高风险 terminal 命令

如果需要环境变量，请创建或更新 `.env.example`，不要提交真实 `.env`。

---

## Git 规范

说明修改时，尽量使用清晰的 commit 风格。

推荐：

* `feat: add pet profile card`
* `feat: add vaccine tracker section`
* `feat: add care reminders`
* `feat: add diary mock data`
* `style: improve responsive layout`
* `refactor: extract reusable card components`
* `docs: update README`

避免：

* `update`
* `fix`
* `final`
* `changes`
* `test`

---

## README 要求

README 后续应包含：

* 项目名称
* 简短介绍
* 功能列表
* 技术栈
* 项目截图
* 本地运行方式
* 项目结构
* 学到了什么
* 未来改进方向

即使第一版只是前端静态页面，也要按照作品集项目的标准来包装。

---

## 作品集定位

这个项目应该展示：

* 前端 UI 设计能力
* React 和 TypeScript 能力
* 组件化开发能力
* 数据建模能力
* 产品思维
* 个人故事感
* 打磨真实场景项目的能力

这个项目不应该看起来像一个普通 todo list，而应该像一个认真设计过的宠物照护产品。

---

## 未来可扩展方向

后续可以考虑：

* Supabase 数据库集成
* 用户登录
* 照片上传
* 多宠物支持
* 疫苗和提醒日历视图
* 健康记录导出
* 移动端优化
* AI 生成宠物照护总结
* 提醒通知功能

在当前阶段稳定之前，不要实现未来功能。
