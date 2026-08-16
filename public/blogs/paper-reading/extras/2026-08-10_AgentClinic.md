## 基本信息

文章标题：[AgentClinic: a multimodal agent benchmark to evaluate AI in simulated clinical environments](https://arxiv.org/abs/2405.07960)

代码链接：[AgentClinic: a multimodal benchmark for tool-using clinical AI agents](https://agentclinic.github.io/)

作者：Samuel Schmidgall, Rojin Ziaei, Carl Harris, Ji Woong Kim, Eduardo Reis, Jeffrey Jopling, Michael Moor

时间：2025-05

## 文章概述

### 研究目标

现有医学智能体 benchmark 一次性提供所有信息进行问答，缺乏真实性。本论文希望通过医生和患者多轮交流病情的形式提高 benchmark 对智能体在真实环境中诊断能力的体现

### 主要内容

**整体架构**：

系统整体共由四个 agent 组成：
1. **patient agent**：输入病人相关信息，让智能体扮演病人与 doctor agent 进行交互
2. **doctor agent**：被测试 agent。需要在最大轮数限制（一般为 20 轮）下通过向 patient agent 询问病情、调用 measurement agent 获得检查结果、调用外部工具完成诊断
3. **measurement agent**：根据准备好的检查结果，在 doctor agent 需要进行检查时将结果返回
4. **moderator agent**：在 doctor agent 完成诊断后，根据标准答案对诊断结果进行评估

系统会提前构建好一个病人的完整信息，包括基本信息、症状描述、各种诊断的结果（可能为原始影像，也可能为文本描述）、病情的标准答案。在测试时会将完整信息拆分为不同部分，分别输入给 patient agent（基本信息、症状描述等）、doctor agent（基本信息、诊断目标等）、measurement agent（各种检查对应的结果）、moderator agent（标准答案）并进行测试

**测试数据**：

系统的测试病例从四个数据集挑选构建：
1. MedQA：标准化考试病例，内容相对规范，主要为文本形式
2. MIMIC-IV：电子健康记录，信息可能更分散，主要为文本形式
3. NEJM：经过专家整理得到的病例，可能包含检查的原始影像，为多模态数据
4. MedMCQA：构建了 9 种专科测试病例，包括药理学、内科、精神病学、眼科、耳鼻喉科、儿科、妇科等

构建测试数据时，首先通过 LLM 将原始数据拆分为不同类别并组装成标准 JSON 文件，随后人工核对以得到一个病例的完整信息，并进行后续测试

**其他**：

AgentClinic 除了对医院问诊流程进行模拟外，还尝试模拟了医生和病人的偏见（通过提示词显式给出）、不同语言版本的测试等

## 启发

**可参考的内容**：
1. 可以使用该框架以及 Agent-Clinic-NEJM 测试数据测试多模态智能体系统的诊断水平。需要将系统替代 doctor agent 并进行一定的适配调整
2. 构建 benchmark 时考虑了真实情况，且考虑了偏见、多语言等对诊断的影响
3. notebook 工具可以让 doctor agent 将诊断过程总结为经验并在后续进行查询，实现自我进化

**可能存在的不足**：
1. moderator agent 评分可能不够可靠。一个更严格的验证方法可以有：  
	1. 由专业医生人工复核一部分结果，并报告 moderator 和专家评估的结果一致性
	2. 使用多个独立 moderator agent 进行评估
	3. 尝试直接使用标准术语匹配，用代码硬编码匹配规则，模糊答案再使用 agent 或专家评估（但感觉这种方式有漏洞）
2. measurement agent 可能产生幻觉。在 doctor agent 安排检查后，measurement agent 可能理解错 doctor agent 的请求或将需要返回的结果进行错误加工（如进行不合理补全、改变原有结果等）。可以尝试以 tool 调用的形式调用数据库工具以直接提供原结果  
3. 不确定是否存在数据泄露。大模型可能将 MedQA 等作为训练数据进行训练，导致这里的测试无法反映模型真实能力

