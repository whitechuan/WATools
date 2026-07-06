# 新拟态 UI 设计实践：用 Vue 3 打造一套高颜值组件库

> 看腻了扁平化？新拟态（Neumorphism）用柔和的光影效果让界面"浮"起来，本文分享如何用 Vue 3 + CSS 变量落地一套完整的新拟态组件库。

## 什么是新拟态？

新拟态（Neumorphism）是一种 UI 设计风格，核心特征是：

- 元素与背景**同色**，通过**亮面阴影**和**暗面阴影**制造凸起或凹陷的错觉
- 视觉上柔和、克制，有一种"从界面中长出来"的质感
- 介于扁平化和拟物化之间，兼具现代感和触感

典型效果：

```
   ┌──────────┐
   │          │  ← 元素与背景同色
   │  Button  │  ← 左上亮面阴影（凸起感）
   │          │  ← 右下暗面阴影（立体感）
   └──────────┘
```

## 设计原则

在 WATools 中，我遵循了以下设计原则：

1. **背景色统一**：所有组件共享同一个背景色变量 `--neu-bg`
2. **双色阴影**：每个凸起元素同时有亮面和暗面两个 `box-shadow`
3. **状态反馈**：点击时阴影反转（凸起 → 凹陷），提供触觉反馈
4. **主题适配**：所有颜色通过 CSS 变量定义，切换主题零成本

## CSS 变量体系

```css
:root {
  /* 基础背景色 */
  --neu-bg: #e0e5ec;
  
  /* 阴影颜色 */
  --neu-shadow-dark: rgba(163, 177, 198, 0.6);
  --neu-shadow-light: rgba(255, 255, 255, 0.8);
  
  /* 圆角 */
  --neu-radius: 12px;
  
  /* 文字颜色 */
  --neu-text: #4a5568;
  --neu-text-secondary: #718096;
  
  /* 主题强调色 */
  --neu-primary: #667eea;
}
```

## 组件实现示例

### NeuButton - 新拟态按钮

核心样式：

```css
.neu-button {
  background: var(--neu-bg);
  border: none;
  border-radius: var(--neu-radius);
  box-shadow: 
    6px 6px 12px var(--neu-shadow-dark),
    -6px -6px 12px var(--neu-shadow-light);
  transition: all 0.2s ease;
}

.neu-button:active {
  box-shadow: 
    inset 4px 4px 8px var(--neu-shadow-dark),
    inset -4px -4px 8px var(--neu-shadow-light);
}
```

Vue 组件封装：

```vue
<template>
  <button class="neu-button" :class="{ active: isActive }">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ isActive?: boolean }>()
</script>
```

### NeuCard - 新拟态卡片

```css
.neu-card {
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow:
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
  padding: 24px;
}
```

### NeuInput - 新拟态输入框

输入框采用**凹陷**效果，表示这是一个可填入内容的区域：

```css
.neu-input {
  background: var(--neu-bg);
  border: none;
  border-radius: var(--neu-radius);
  box-shadow:
    inset 4px 4px 8px var(--neu-shadow-dark),
    inset -4px -4px 8px var(--neu-shadow-light);
  padding: 12px 16px;
  color: var(--neu-text);
}
```

## 多主题方案

WATools 内置了 6 套主题，每套主题只需覆盖 CSS 变量：

| 主题 | 关键特征 |
|------|---------|
| 🌸 樱花 | 粉色调，温柔甜美 |
| 💜 薰衣草 | 紫色调，优雅梦幻 |
| 🌿 薄荷 | 绿色调，清新自然 |
| 🌊 海风 | 蓝色调，清爽通透 |
| 🌙 星空 | 深色调，神秘沉静 |
| 🌅 日落 | 橙色调，温暖活力 |

主题切换的实现非常简洁——在 Pinia store 中记录当前主题名，动态加载对应的 CSS 文件，所有组件因为使用 CSS 变量，自动完成样式跟随。

## 组件库目录结构

```
components/neu/
├── NeuButton.vue
├── NeuCard.vue
├── NeuInput.vue
├── NeuSelect.vue
├── NeuSwitch.vue
├── NeuTabs.vue
├── NeuTag.vue
└── NeuTextarea.vue
```

每个组件都是独立的单文件组件（SFC），按需引入，零耦合。

## 踩坑记录

1. **阴影层次感**：新拟态的关键是双色阴影，只用一个 `box-shadow` 会显得扁平
2. **暗色主题适配**：深色背景下阴影不明显，需要调整阴影策略（使用边框或发光效果替代）
3. **可访问性**：新拟态的对比度容易偏低，文字颜色要确保 WCAG 2.0 标准
4. **性能**：`box-shadow` 不会触发重排，但大量阴影叠加时注意 GPU 加速

## 写在最后

新拟态不是万能的设计风格，但对于工具类应用来说，它能提供一种**精致而不花哨**的视觉体验。

WATools 的完整组件库源码已开源，欢迎来 [GitCode](https://gitcode.com/white_chuan/WATools) 查看和参考。觉得有帮助的话，点个 Star 支持一下！
