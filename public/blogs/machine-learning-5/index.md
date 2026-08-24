跟着 B 站上一门 [机器学习的课](https://www.bilibili.com/video/BV1puGv6TEjV/?spm_id_from=333.1007.top_right_bar_window_default_collection.content.click&vd_source=b4b6b348eb2ec24665e87125a8cf8851) 进行学习，参考教材为周志华教授的西瓜书以及配套的南瓜书

[其他笔记请点击](/blog/machine-learning-1/MLdir)

## 贝叶斯决策论

假设当前有一个 N 分类任务，定义 $\lambda_{ij}$ 为将 *真实标记* 为 $c_j$ 的样本 *误分类* 为 $c_i$ 产生的损失。定义单个样本 $\mathbf{x}$ 的 **期望损失（条件风险）** 为：
$$
R(c_i | \boldsymbol{x}) = \sum_{j=1}^{N} \lambda_{ij} P(c_j | \boldsymbol{x})
$$
其中，$P(c_j|\mathbf{x})$ 为后验概率，即将样本 $\mathbf{x}$ 归类为 $c_j$ 的概率

定义全体样本构成的 **总体风险** 为：
$$
R(h) = \mathbb{E}_x [R(h(\boldsymbol{x})|\boldsymbol{x})]
$$
其中 $h$ 为分类器。上式有一个很直观的结论：$h$ 的分类效果越准确，其条件风险以及总体风险也就越小

**贝叶斯判定准则**：为了最小化总体风险 $R(h)$，只需要在每个样本上都选择能使条件风险 $R(c|\mathbf{x})$ 最小的类别，即
$$
h^*(\boldsymbol{x}) = \operatorname*{arg\,min}_{c \in \mathcal{Y}} R(c|\boldsymbol{x})
$$
此时 $h^*$ 称为 **贝叶斯最优分类器**

一个很简单的例子为，定义误判损失 $\lambda_{ij}$ 为：
$$
\lambda_{ij} = \begin{cases}
0, & \text{if } i = j \\
1, & \text{otherwise}
\end{cases}
$$
此时单个样本 $\mathbf{x}$ 的期望损失为：
$$
R(c_i | \boldsymbol{x}) = 1 - P(c_i | \boldsymbol{x})
$$
根据贝叶斯判定准则，最优分类器的选择标准为：
$$
\begin{align*}
h^*(\boldsymbol{x}) &= \operatorname*{arg\,min}_{c \in \mathcal{Y}} R(c|\boldsymbol{x}) \\
h^*(\boldsymbol{x}) &= \operatorname*{arg\,min}_{i \in \{1,2,\ldots,N\}} 1 - P(c_i|\boldsymbol{x}) \\
h^*(\boldsymbol{x}) &= \operatorname*{arg\,max}_{c \in \mathcal{Y}} P(c|\boldsymbol{x})
\end{align*}
$$
即对样本选择后验概率 $P(c_i|\mathbf{x})$ 最大的类别 $c_i$。之前很多机器学习算法（如对数几率回归）就是为了根据样本对后验概率进行建模，从而完成分类的任务

## 朴素贝叶斯分类器

> [!note]
> **判别式模型**：给定 $\mathbf{x}$，直接建模后验概率 $P(c|\mathbf{x})$ 以预测类别 c
> 
> **生成式模型**：先对联合概率 $P(\mathbf{X},\;c)$ 建模，随后推导 $P(c|\mathbf{x})$ 进行分类
> 
> 对于生成式模型，借助贝叶斯公式，其建模思路为 $P(c|\boldsymbol{x}) = \frac{P(\boldsymbol{x}, c)}{P(\boldsymbol{x})} = \frac{P(c)P(\boldsymbol{x}|c)}{P(\boldsymbol{x})}$

为了计算 $P(\mathbf{x}|c)$，提出 **属性条件独立性假设**：对已知类别，假设所有属性相互独立，即：
$$
P(c|\boldsymbol{x}) = \frac{P(c)P(\boldsymbol{x}|c)}{P(\boldsymbol{x})} = \frac{P(c)}{P(\boldsymbol{x})} \prod_{i=1}^{d} P(x_i|c)
$$
由于 $P(\mathbf{x})$ 对所有类别相同，可以视为常量忽略，所以基于贝叶斯判定准则有：
$$
h_{nb}(\mathbf{x})= \operatorname*{arg\,max}_{c \in \mathcal{Y}} \frac{P(c)}{P(\boldsymbol{x})} \prod_{i=1}^{d} P(x_i|c)= \operatorname*{arg\,max}_{c \in \mathcal{Y}} \;P(c) \prod_{i=1}^{d} P(x_i|c)
$$
根据大数定理，当样本数量足够多时，可以使用样本分布的概率估计类别整体的概率，也即：
$$
P(c)=\frac{\left|D_c\right|}{\left|D\right|}
$$
对于 $P(x_i|c)$，若第 i 个属性为离散属性，则：
$$
P(x_i|c) = \frac{|D_{c,x_i}|}{|D_c|}
$$
其中 $D_{c,x_i}$ 表示 $D_c$ 中在第 i 属性上取值为 $x_i$ 的样本的集合。若第 i 个属性为连续属性，则（以假设属性分布为正态分布为例）：
$$
p(x_i|c) = \frac{1}{\sqrt{2\pi}\sigma_{c,i}} \exp \left( -\frac{(x_i - \mu_{c,i})^2}{2\sigma_{c,i}^2} \right)
$$
其中 $\mu_{c,i},\;\sigma^2_{c,i}$ 为 c 类样本在第 i 个属性上取值的均值和方差

## 半朴素贝叶斯分类器

![](/blogs/machine-learning-5/7_SPODE.png)

相比朴素贝叶斯分类器，**半朴素贝叶斯分类器** 适当考虑一部分属性之间的相互依赖信息。其采用 **独依赖估计 (ODE)**：假设每个属性在类别之外最多依赖于一个其他属性，即：
$$
P(c|\boldsymbol{x}) \propto P(c) \prod_{i=1}^{d} P(x_i|c, pa_i)
$$
其中，$pa_i$ 为属性 $x_i$ 依赖的属性，称为 $x_i$ 的 *父属性*

还有一种估计为 **超父独依赖估计 (SPODE)**：假设所有属性都依赖于同一个 “超父” 属性，有
$$
\begin{align*}
P(c \mid \boldsymbol{x}) &= \frac{P(\boldsymbol{x}, c)}{P(\boldsymbol{x})} = \frac{P(c, x_i) P(x_1, \dots, x_{i-1}, x_{i+1}, \dots, x_d \mid c, x_i)}{P(\boldsymbol{x})} \\
&\propto P(c, x_i) P(x_1, \dots, x_{i-1}, x_{i+1}, \dots, x_d \mid c, x_i) \\
&= P(c, x_i) \prod_{j=1}^{d} P(x_j \mid c, x_i)\qquad P(x_i|c,x_i)=1\;无影响
\end{align*}
$$
其中，$x_i$ 为 “超父” 属性

