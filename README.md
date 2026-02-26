# Stalingrad War-Room UI (Three.js + React)

以三维地图 + 档案化表格为核心的斯大林格勒战役可视化控制台。  
营（battalion）是最小战术节点，连/排明细作为硬核树表进行展示，支持时间快照、阵营切换与移动端触控。

---

## Quick start

```bash
npm install
npm run download:maps   # 可选：下载 Wikimedia 地图素材
npm run dev
```

默认行为：

- snapshot = `1942-11-01`
- selected unit = `62A`
- theme = dark

即使没有任何地图素材，程序也会自动回退为程序生成网格底图（可运行且视觉不崩）。

---

## Tech stack

- **Vite + React + TypeScript**
- **three.js**（正交顶视地图、点选、缩放、平移）
- **Zustand**（全局状态）
- **zod**（datapack 校验）
- **TanStack Table + TanStack Virtual**（摘要表 + 虚拟滚动树表）
- **react-resizable-panels**（桌面三栏拖拽与折叠）
- **Radix UI primitives**（Tooltip / Popover / Dialog / Select）
- **lucide-react**（统一图标）
- **framer-motion**（微交互过渡）
- **Tailwind + CSS Variables**（Design Tokens）

---

## Feature checklist

- Desktop: 三栏布局（OOB / MAP / DETAILS）可拖拽宽度，左右面板可折叠
- Mobile: 底部 Tab（OOB / MAP / DETAILS），顶部轻量 command bar
- Top command bar: Snapshot / Side / Search / Density / Layers / 快捷键提示
- Bottom status bar: snapshot / side / selected / zoom / cursor / provenance 统计
- OOB 树：搜索、side/level/type 多选过滤、节点 pin/focus 动作
- three.js 地图：正交、触控拖拽平移、滚轮/双指缩放、点选高亮、legend、图层开关
- Unit details：
  - SummaryTable（排序、列显示开关、字段解释、source 引用）
  - CompanyTable（Company→Platoon→Squad 树表、固定表头、虚拟滚动、密度模式、行操作）
- 全量 provenance 徽标（from_source / generated_by_template / confidence）
- 空状态、加载骨架、字段缺失提示全部具备

---

## Repository structure

```text
data/
  stalingrad_datapack.json
  strength_schema.csv
public/assets/maps/
scripts/
  download_maps.mjs
src/
  app/
  data/
  ui/
  viz/
docs/
  ui-styleguide.md
CREDITS.md
```

---

## Data model & extension

### 1) Datapack loading pipeline

`data/stalingrad_datapack.json` → zod 校验 → template expansion → snapshot index

- `Unit` 包含标准字段与 provenance
- `Snapshot` 包含 `roots` + `unitIndexById`
- 所有明细行可直接用于 CompanyTable 渲染

### 2) Template expansion rules

- 团级单位（`rifle_regiment` / `infantry_regiment`）会自动展开 `Bn1-Bn2-Bn3`
- 自动生成营级 `company_details`
- 生成数据标记 `provenance.generated_by_template = true`

### 3) Company detail rows

每行包含：

- `rowId`, `parentRowId`
- `echelon` (`company|platoon|squad`)
- `name`, `role`
- `authorized`, `reported`, `weapons`, `notes`
- `provenance`（source/confidence/template flag）

### 4) Strength CSV extension

`data/strength_schema.csv` 预留了 manpower/combat/fatigue/morale/ammo 字段。  
补充数据后可在 loader 层合并到 unit summary。

---

## Keyboard shortcuts

- `/` 聚焦全局搜索
- `g` 切到 MAP
- `o` 切到 OOB
- `d` 切到 DETAILS
- `Esc` 清空选中并重置搜索

---

## License & attribution

See `CREDITS.md` for data/map licensing details.

> 如果你将本项目在线发布，必须保留署名信息与许可条款（尤其 Wikimedia 地图的 CC BY-SA 3.0 要求）。
