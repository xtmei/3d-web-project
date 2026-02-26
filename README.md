# Stalingrad Operations Console (Three.js + React)

移动端优先的“作战室战史档案系统”界面，基于营级节点可视化斯大林格勒战役编制，支持快照切换、阵营切换、OOB 树检索、地图点选联动、营下连/排明细硬核表格。

## Run

```bash
npm install
npm run download:maps   # optional
npm run dev
```

> 默认加载快照 `1942-11-01`，默认选中 `62A`。

## Stack
- Vite + React + TypeScript
- three.js（正交顶视地图）
- Zustand（全局状态）
- zod（数据校验）
- TanStack Table / Virtual（明细表格与虚拟滚动）
- react-resizable-panels（三栏拖拽）
- Radix primitives（tooltip/popover）
- framer-motion（微动效预留）
- Tailwind + CSS Variables（design tokens）

## Data extension
1. 在 `data/stalingrad_datapack.json` 添加 snapshots / units。
2. 补充 `data/strength_schema.csv` 的字段后可在 loader 合并到 `summary`。
3. 团级单位（`rifle_regiment` / `infantry_regiment`）会自动展开 `Bn1-Bn3` 并生成 `company_details`。

## License note
发布在线演示时请保留 `CREDITS.md` 里的署名与许可说明（尤其 Wikimedia CC BY-SA 3.0）。
