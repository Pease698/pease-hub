## 基本信息

文章标题：[MMedAgent: Learning to Use Medical Tools with Multi-modal Agent](https://arxiv.org/abs/2407.02483)

代码链接：[GitHub - Wangyixinxin/MMedAgent: Learning to Use Medical Tools with Multi-modal Agent · GitHub](https://github.com/Wangyixinxin/MMedAgent)

作者：Binxu Li、Tiankai Yan、Yuanting Pan、Jie Luo、Ruiyang Ji、Jiayuan Ding、Zhe Xu、Shilong Liu、Haoyu Dong、Zihao Lin、Yixin Wang

时间：2024-10

## 文章概述

### 研究目标

专有模型难以同时完成面对多模态影像的多类任务，同时通用模型在各个问题上的专业性并不够。本论文系统给主 agent 配置多个专业工具，以使系统能处理多类任务的同时保持较高的专业性

### 主要内容

**系统架构**：

MMedAgent 使用 LLaVA-Med 7B 60K-IM 作为主 agent，主要负责工具调度和结果汇总，共配置 6 类工具处理 7 类任务：
1. **grounding**，基于 Grounding DINO，根据文本提示词找到图中对应位置 bounding-box
2. **B-Seg**，基于 MedSAM，使用 bounding-box 提示，在对应位置分割异常区域
3. **G-Seg**，使用 grounding + B-Seg 组合，根据文本提示词先找到 bounding-box 随后分割异常区域
4. **classification**，基于 BiomedCLIP，可以基于提前设置好的标签进行分类打分
5. **MRG**，基于 ChatCAD，主要针对胸部 X-ray 生成医学报告
6. **RAG**，基于 ChatCAD+
7. **VQA**，由主 agent 完成

**模型运行和训练**：

主 agent 运行时需要依次输出三个标签：
- thoughts，对问题的思考、后续需要进行的工具调用等
- actions，工具调用，无则表示不进行调用
- value，对工具调用的说明或对问题的回答

使用共 48K 数据微调主 agent，主要目的是让 agent 学会使用工具和汇总结果。使用 GPT-4o 自动化生成微调数据，给出从公开数据集中收集到的数据标注，并给出基本提示词和 one-shot 示例，由 LLM 自动生成问题和回答用于微调

## 启发

**可参考的内容**：
1. 使用主 agent + 多个专业工具的结构，增强多问题的专业能力
2. 对主 agent 使用指令微调学习工具调用，同时微调数据由 LLM 自动化生成

**可能存在的不足**：
1. 工具选择由任务驱动，agent 观察对工具调用的影响很小
2. VQA 规模较小（仅 70 题），且评价标准为相对 GPT-4o 回答的给分，该给分由 GPT-4o 生成，或许可以考虑其他标准
3. 工具调用的复杂性不高，微调数据多为单个工具调用
