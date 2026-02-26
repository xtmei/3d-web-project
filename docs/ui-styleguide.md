# UI Styleguide

## Visual language
- 主题：dark staff-console / military archive。
- 纹理：低透明噪点 + 极弱扫描线。
- 字体：IBM Plex Sans + IBM Plex Mono（数字/表格对齐）。

## Tokens
- 背景层：`--bg0 --bg1 --bg2`
- 文字层：`--fg0 --fg1 --fg2`
- 分割线：`--line0 --line1`
- 强调色：`--accent`（单一克制色）
- 阵营色：`--soviet --axis`

## Component rules
- Button/Input/Panel/Badge/Popover/Tooltip 统一边框与圆角（2/4/6）。
- 可交互项统一 focus ring。
- 表格数字列右对齐 + monospaced。

## Table rules
- SummaryTable: 缺失值显示 `—`。
- CompanyTable: sticky 表头，虚拟滚动，支持密度切换。
- provenance 列必须给出 source/generated 与 confidence。
