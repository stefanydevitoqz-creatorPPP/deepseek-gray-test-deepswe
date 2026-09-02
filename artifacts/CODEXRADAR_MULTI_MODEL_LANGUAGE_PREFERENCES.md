# CodexRadar 多模型语言偏好分析

> 数据批次：2026-08-24四Harness累计缓存；雷达站112题。
> Harness：Codex、DSH、ZCode、Grok。
> 口径：每个`Harness / 模型@档位`独立统计，不合并跨Harness同名模型。
> 偏好指数：某语言累计通过率减去该配置总体累计通过率，单位为百分点（pp）。

## 一、核心结论

1. **最稳定的跨模型结构是“Go强、TypeScript弱”。** GPT-5.6 Sol、Pro0813、DeepSeek Flash、Grok 4.6和GLM-5.3高档位都重复出现这一模式。
2. **GPT-5.6相对Pro0813的优势是全语言提升，不是单语言特化。** 三个大样本语言中，GPT分别领先Go 8.5pp、Python 7.1pp、TypeScript 4.4pp；最大稳定增益在Go和Python。
3. **Pro0813相对偏Go，明显避Rust。** Go比自身总体高8.5pp；Rust低14.8pp。TypeScript也低6.7pp。
4. **GPT-5.6 Sol@max偏Go、弱TypeScript。** Go高9.7pp，TypeScript低9.6pp；Python基本等于总体。
5. **GLM-5.3语言分化最强。** max档Go高20.4pp、TypeScript低27.0pp，Go/Python很强，但前端类型生态显著薄弱。
6. **Terra和GPT-5.5更均衡。** Terra@max与GPT-5.5@xhigh在Go/Python/TypeScript三大语言间的差距只有约7pp，远小于Sol@max和GLM。
7. **JavaScript和Rust只能视为风险信号。** 题库分别只有6题和5题；即使累计运行数不少，任务多样性仍很低，单题会显著改变结论。

## 二、Pro0813与GPT-5.6的语言偏好对比

| 指标 | GPT-5.6 Sol@max（Codex） | Pro0813@max（DSH） | GPT领先 |
|---|---:|---:|---:|
| 总体 | 1354/2035，**66.5%** | 186/314，**59.2%** | **+7.3pp** |
| Go | 449/589，**76.2%**（+9.7） | 63/93，**67.7%**（+8.5） | **+8.5pp** |
| Python | 425/635，66.9%（+0.4） | 55/92，59.8%（+0.5） | **+7.1pp** |
| TypeScript | 347/609，57.0%（-9.6） | 51/97，52.6%（-6.7） | **+4.4pp** |
| JavaScript* | 78/114，68.4%（+1.9） | 9/14，64.3%（+5.1） | +4.1pp |
| Rust* | 55/88，62.5%（-4.0） | 8/18，44.4%（-14.8） | +18.1pp |

括号为相对各自总体的偏好指数。

### GPT-5.6 Sol@max

- **明确偏好Go**：76.2%，高于自身总体9.7pp。
- **Python是中性语言**：66.9%，几乎等于总体。
- **TypeScript是稳定短板**：57.0%，低9.6pp。
- JS略强、Rust略弱，但两者任务数太小，结论不如三大语言可靠。

可概括为：**Go特化，Python正常，TypeScript拖后腿。**

### Pro0813@max

- **同样偏好Go**：67.7%，高8.5pp。
- **Python接近总体**：59.8%，高0.5pp。
- **TypeScript偏弱**：52.6%，低6.7pp。
- **Rust风险最突出**：44.4%，低14.8pp。

可概括为：**Go强，Python中性，TypeScript偏弱，Rust明显弱。**

### 两者差异

- 两者不是相反的语言取向，而是相似的“Go强/TS弱”结构；
- GPT-5.6是在相同结构上整体抬高，尤其改善Go、Python和Rust；
- TypeScript差距只有4.4pp，是两者最接近的大样本语言；
- 因此GPT的总领先主要来自Go/Python稳定增益，而不是TypeScript。

## 三、代表模型语言画像

| Harness / 模型 | 总体 | Go | Python | TypeScript | JavaScript* | Rust* | 大样本画像 |
|---|---:|---:|---:|---:|---:|---:|---|
| Codex / GPT-5.6 Terra@ultra | **67.5%** | 72.0（+4.5） | 68.7（+1.2） | 62.3（-5.2） | 51.2（-16.2） | 82.3（+14.8） | 较均衡，轻偏Go |
| Codex / GPT-5.6 Sol@ultra | **67.2%** | 75.5（+8.3） | 64.3（-2.9） | 59.1（-8.1） | 72.0（+4.8） | 77.6（+10.3） | Go强、TS弱 |
| Codex / GPT-5.6 Sol@max | **66.5%** | 76.2（+9.7） | 66.9（+0.4） | 57.0（-9.6） | 68.4（+1.9） | 62.5（-4.0） | Go特化、TS弱 |
| Grok / Grok 4.6@xhigh | **64.4%** | 71.1（+6.7） | 65.2（+0.8） | 56.1（-8.3） | 56.3（-8.1） | 69.2（+4.8） | Go强、TS弱 |
| Codex / GPT-5.5@xhigh | **63.0%** | 67.5（+4.5） | 61.9（-1.2） | 60.8（-2.2） | 57.0（-6.1） | 61.8（-1.3） | 三大语言最均衡 |
| ZCode / GLM-5.3@max | **62.3%** | 82.7（+20.4） | 70.2（+8.0） | 35.2（-27.0） | 38.9（-23.4） | 77.8（+15.5） | Go/Python强，TS断崖 |
| DSH / Pro0813@max | **59.2%** | 67.7（+8.5） | 59.8（+0.5） | 52.6（-6.7） | 64.3（+5.1） | 44.4（-14.8） | Go强、TS/Rust弱 |
| DSH / DeepSeek V4 Flash@max | **54.7%** | 60.3（+5.6） | 53.6（-1.1） | 51.5（-3.2） | 36.4（-18.4） | 63.6（+8.9） | 轻偏Go，JS风险 |

表内语言数值为累计通过率%，括号为相对总体Δpp。

## 四、模型族群特征

### 4.1 GPT-5.6 Sol：高档位持续偏Go

- max：Go +9.7pp，TS -9.6pp；
- xhigh：Go +8.1pp，TS -6.7pp；
- ultra：Go +8.3pp，TS -8.1pp。

高档位的语言结构非常稳定，说明“Go强、TS弱”不是某一次档位波动。high/medium后总体能力下降，Python相对退化更明显；low档TypeScript相对转正，但这是其他语言下降更快造成的相对现象，并非TS绝对能力提升。

### 4.2 GPT-5.6 Terra：更均衡

Terra@max在三大语言中的偏差约为Go +3.7pp、Python -0.1pp、TS -3.5pp，最大差距7.2pp；Terra@ultra最大差距9.7pp。它不像Sol那样强烈押注Go，适合语言混合度高的任务集。

Terra低档位出现TypeScript相对最好，但绝对通过率只有约32%–56%；应解读为Go/Python能力随档位下降更快，而不是低档位增强TS。

### 4.3 GPT-5.5：语言最均衡的代表

GPT-5.5@xhigh总体63.0%，Go67.5%、Python61.9%、TS60.8%，三大语言最大差6.7pp。它的绝对成绩略低于GPT-5.6高档，但语言选择风险更小。

### 4.4 GLM-5.3：最强语言特化

GLM-5.3@max：Go82.7%、Python70.2%、TS35.2%。Go与TS相差47.5pp，是34个配置中最极端的可靠语言分化之一。high档仍保持Go/Python约68%、TS42.7%的断层。

适合Go/Python代码库；对TypeScript/JavaScript项目风险明显。

### 4.5 Grok 4.6：高档与Sol类似

Grok@xhigh和high均表现为Go强、TS弱：xhigh Go71.1%、TS56.1%；high Go76.2%、TS54.5%。medium分化更强。low档变成Python相对最好、Go偏低，说明推理档位变化会重排语言结构。

### 4.6 DeepSeek V4 Flash：Go偏好保留，但整体更弱

DSH Flash@max总体54.7%，Go60.3%、Python53.6%、TS51.5%。与Pro0813相比，Go偏好仍在，但语言差距较小；JS仅36.4%是风险信号。Flash更像整体能力下降，而不是形成新的稳定语言专长。

## 五、跨模型聚类

### A. Go强、TypeScript弱

代表：GPT-5.6 Sol高档、Pro0813、Grok高档、DeepSeek Flash、部分Luna。

特征：Go通常高于总体5–10pp，TS低5–10pp。该模式跨Codex、DSH、Grok重复出现，是雷达站最稳定的语言结构。

### B. 大样本语言较均衡

代表：GPT-5.6 Terra@max、GPT-5.5@xhigh。

特征：Go/Python/TS最大差距约7pp。总分未必最高，但跨语言部署风险较低。

### C. Go/Python双强、TypeScript断崖

代表：GLM-5.3@max/high。

特征：Go/Python显著高于总体，TS低15–27pp。语言选择对成绩影响极大。

### D. 低档位相对TypeScript回升

代表：Terra@high/medium/low、Sol@low。

特征：TS偏好指数转正，但绝对率并不高；主要由Go/Python随档位下降更快导致，不应解释为低档位更擅长TS。

## 六、如何使用这些结果

- Go项目：优先考虑GPT-5.6 Sol高档、Grok高档或GLM-5.3高档；GLM的Go绝对率最高，但TS迁移风险最大。
- Python项目：GPT-5.6、Terra和GLM高档较强；Pro0813接近自身总体，不是特别偏Python。
- TypeScript项目：模型间差距普遍收窄，GPT-5.5@xhigh和Terra@max更均衡；不要只按总体榜单选Sol或GLM。
- 多语言仓库：优先语言离散度低的Terra@max、GPT-5.5@xhigh，而不是单项最强但偏科严重的GLM。
- Rust/JS项目：当前题目数太少，建议把雷达数据视为先验，再用目标仓库自测校准。

## 七、数据限制

1. 数据是累计trial，不是每题等权单次成绩；反复重跑难题会获得更高权重。
2. Harness差异与模型能力混杂；同名模型在不同Harness下不可直接合并。
3. 雷达缓存最新为2026-08-24；没有更晚的本地雷达抓取。
4. Go/Python/TypeScript分别约34题，结论较稳定；JavaScript仅6题、Rust仅5题。
5. 112题雷达不含本地新增的`drizzle-orm-window-function-builders`。
6. 本地灰测偏难57题不是随机样本，不能直接并入雷达全量语言率。

## 八、复核文件

- 完整34配置矩阵：`cache/radar_all_models_language_preferences.csv`
- 结构化明细：`cache/radar_all_models_language_preferences.json`
- 生成脚本：`cache/build_radar_language_preferences.mjs`
- 原始缓存：`_wipe_codex.json`、`_wipe_dsh.json`、`_wipe_zcode.json`、`_wipe_grok.json`
- 语言目录：`artifacts/tasks.csv`
