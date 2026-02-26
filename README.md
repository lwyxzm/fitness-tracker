# Fitness Tracker App 🏋️

一款简洁的健身记录应用，基于 Expo + React Native 开发。

## 📱 功能特性

- 📊 **记录每日训练**：项目、重量、组数、次数
- ⚖️ **单位切换**：kg / lbs 自由切换
- 📈 **进度追踪**：重量趋势图表展示进步
- 💾 **本地存储**：数据持久化，离线可用
- 🎨 **简洁UI**：专注核心功能，无广告干扰

## 🛠️ 技术栈

- **框架**: Expo SDK 55 + React Native
- **导航**: Expo Router (文件系统路由)
- **样式**: NativeWind (Tailwind CSS for RN)
- **存储**: expo-sqlite (训练数据) + AsyncStorage (设置)
- **图表**: react-native-chart-kit

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/lwyxzm/fitness-tracker.git
cd fitness-tracker

# 安装依赖
npm install

# 启动开发服务器
npx expo start

# iOS 模拟器
i

# Android 模拟器
a
```

## 🧪 测试

本项目使用 [Maestro](https://maestro.mobile.dev/) 进行 E2E 测试。

```bash
# 安装 Maestro
curl -fsSL "https://get.maestro.mobile.dev" | bash

# 运行单个测试
maestro test flows/add_exercise.yaml
maestro test flows/record_workout.yaml
maestro test flows/view_stats.yaml
maestro test flows/change_settings.yaml

# 运行完整测试套件
maestro test flows/full_test_suite.yaml
```

### 测试流程

| 测试文件 | 功能覆盖 |
|---------|---------|
| `add_exercise.yaml` | 添加锻炼项目 |
| `record_workout.yaml` | 记录训练数据 |
| `view_stats.yaml` | 查看进度统计 |
| `change_settings.yaml` | 切换重量单位 |

## 📁 项目结构

```
fitness-tracker/
├── app/                    # 页面路由
│   ├── _layout.tsx         # 根布局
│   ├── index.tsx           # 首页 - 训练记录列表
│   ├── exercises.tsx       # 锻炼项目管理
│   ├── settings.tsx        # 设置页面
│   ├── workout/
│   │   └── [id].tsx        # 记录训练
│   └── stats/
│       └── [id].tsx        # 进度统计
├── components/             # 组件
├── hooks/                  # 自定义 Hooks
│   ├── useDatabase.ts
│   └── useSettings.ts
├── lib/                    # 工具库
│   ├── database.ts         # SQLite 数据库操作
│   └── storage.ts          # 本地存储
├── types/                  # TypeScript 类型
│   └── index.ts
├── flows/                  # Maestro E2E 测试
└── assets/                 # 图片资源
```

## 📝 开发计划

- [x] 基础架构搭建
- [x] 锻炼项目管理
- [x] 训练记录功能
- [x] 进度统计图表
- [x] 单位切换设置
- [x] Maestro E2E 测试
- [ ] 数据导出功能
- [ ] 训练计划模板
- [ ] 休息计时器

## 📄 License

MIT
