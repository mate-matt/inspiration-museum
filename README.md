# 灵感博物馆 / Inspiration Museum

每日阅读用的输入源清单：长访谈、权威站点、计算艺术、中文耐读。纯静态页面，GitHub Pages 直接从仓库根目录提供，不需要构建。

A daily reading list of high-density creative and art inputs. Static HTML, CSS, and JS. GitHub Pages serves the repository root. No build step.

**Pages:** https://mate-matt.github.io/inspiration-museum/

仓库保持私有。私有仓库的 Pages 站点在 GitHub 允许时仍可被公开访问。推送到 `main` 之后，页面通常要 1–10 分钟才会更新。

The repository stays private. A Pages site from a private repo is still publicly reachable when GitHub allows it. After a push to `main`, the live site often takes 1–10 minutes to update.

## 新增一条卡片 / Add a source

1. 编辑 `data/sources.json`，在 `sources` 数组末尾追加一条。
2. Commit，并 push 到 `main`。

Edit `data/sources.json`, append one object to `sources`, then commit and push to `main`.

```json
{
  "id": "short-unique-id",
  "category": "长访谈 / 频道",
  "title": "来源名称",
  "url": "https://example.com/",
  "note": "一句中文说明",
  "tags": ["访谈"]
}
```

`category` 用下面四个名字之一（或对应的 `id`）。写一个新名字会自动多出一个分区和筛选芯片。`tags` 可以省略。

| 分区 | id |
| --- | --- |
| 长访谈 / 频道 | `talks` |
| 权威站点 / 期刊 | `journals` |
| 计算艺术 / 创意系统 | `systems` |
| 中文耐读 | `zh` |

Use one of those category titles (or its id). A new name becomes its own section and filter chip. `tags` is optional.

## 本地预览 / Preview locally

```bash
python3 -m http.server 8080
```

打开 http://localhost:8080 。不要用 `file://` 直接双击 `index.html`，浏览器会拦住对 JSON 的读取。

Open http://localhost:8080 . Do not open `index.html` via `file://`; the browser blocks the JSON fetch.
