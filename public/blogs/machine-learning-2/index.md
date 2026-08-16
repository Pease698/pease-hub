跟着 B 站上一门 [机器学习的课](https://www.bilibili.com/video/BV1puGv6TEjV/?spm_id_from=333.1007.top_right_bar_window_default_collection.content.click&vd_source=b4b6b348eb2ec24665e87125a8cf8851) 进行学习，参考教材为周志华教授的西瓜书以及配套的南瓜书

 决策树可以看作一堆 `if-else` 语句的组合。它希望通过特征特征越分越 “纯”。以下是 “判断一个西瓜是否为好瓜” 的决策树示意图
 
![](/blogs/machine-learning-2/4_decisionTree.png)

## ID3 决策树

> [!note] 条件熵
> **条件熵** 即 Y 的信息熵关于概率分布 X 的期望，可以用于描述在已知 X 后 Y 的不确定性。其表达式为（H 表示信息熵）：
> $$
> H(Y \mid X) = \sum_{x} p(x) H(Y \mid X = x)
> $$
> 

> [!note] 样本 “纯度”
> 之前提到可以使用信息熵衡量一个随机变量的不确定性。如果将目标从随机变量变为包含多个样本的集合，则可以使用信息熵衡量该集合内样本的 “纯度”
> 
> 计算时将概率 $p_k$ 的含义变为集合内某类样本出现的概率，此时表达式为：
> $$
> \operatorname{Ent}(D) = -\sum_{k=1}^{|\mathcal{Y}|} p_k \log_2 p_k
> $$
> 其中 $\mathcal{Y}$ 表示该集合中样本的种类数量

> [!note]
> 同样可以将条件熵的概念放到集合划分中。设特征 a 有 V 中不同取值 $\{ a^1,\;\cdots,\;a^V \}$，使用 $D^v$ 表示属性 a 为 $a^v$ 的样本集合，同时使用 $\frac{\left| D^v \right|}{\left| D \right|}$ 表示 $D^v$ 中样本数量的占比。则根据属性 a 进行划分后，样本集合 D 的条件熵（或可以说本次划分的有效性）可以使用以下公式表示：
> $$
> \sum_{v=1}^{V} \frac{|D^v|}{|D|} \operatorname{Ent}(D^v)
> $$

对于 ID3 决策树，其定义 **信息增益** 为根据特征 a 进行划分后不确定性减少的量，即：
$$
\operatorname{Gain}(D, a) = \operatorname{Ent}(D) - \sum_{v=1}^{V} \frac{|D^v|}{|D|} \operatorname{Ent}(D^v) \tag{1}
$$
在 ID3 决策树中，若当前样本集合仍有划分的必要（即样本包含不同类别），则计算每个候选特征的信息增益并选择得分最高的特征进行划分，得到若干子集合后对每个子集合分别执行同样的操作，以完成整个决策树的递归构建

> [!tip]
> 若特征取值为离散的，则直接根据不同离散取值进行划分即可；
> 
> 若特征取值为连续的，则可以定义一个阈值并划分为 $x\le t,\;x>t$ 两类

## C4.5 决策树

在 ID3 决策树中，其会偏好取值可能性较多的特征进行划分，其本质原因在于更多种取值的特征划分得到的子集种样本数量更少，更有利于得到 “纯” 的集合。但这种策略很可能导致决策树的复杂度冗余

C4.5 决策树引入 **信息增益率** 帮助选择特征，其公式为：
$$
\operatorname{Gain\_ratio}(D, a) = \frac{\operatorname{Gain}(D, a)}{\operatorname{IV}(a)} \tag{2}
$$
其中 $IV(a)$ 为特征 a 的固有值。a 的可能取值越多，其固有值通常也越大。其计算公式为：
$$
\operatorname{IV}(a) = - \sum_{v=1}^{V} \frac{|D^v|}{|D|} \log_2 \frac{|D^v|}{|D|} \tag{3}
$$
但信息增益率对可能取值较少的特征会有所偏好，所以 C4.5 采用的策略为：先选择信息增益高于平均水平的特征，随后再使用信息增益率选择最好的特征进行划分

## CART 决策树

也可以使用 **基尼值** 度量集合纯度，其含义为：从样本集合 D 中随机抽取两个样本，其类别不一致的概率。基尼值越小，说明集合中抽到的两个样本异类的可能性越小，集合纯度越高
$$
\begin{align*}
\operatorname{Gini}(D) &= \sum_{k=1}^{|\mathcal{Y}|} p_k (1 - p_k) \\
&= 1 - \sum_{k=1}^{|\mathcal{Y}|} p_k^2 \tag{4}
\end{align*}
$$
其中 $|\mathcal{Y}|$ 表示集合中样本类别的数量

定义特征 a 的 **基尼指数**：
$$
\operatorname{Gini\_index}(D, a) = \sum_{v=1}^{V} \frac{|D^v|}{|D|} \operatorname{Gini}(D^v) \tag{5}
$$
在构造 CART 决策树时，无论特征为连续还是离散，每次进行划分时都需要为二叉的。具体来说，每次划分的步骤为：
1. 针对特征 a 的每个可能取值 v，将集合按照 $a=v,\;a\ne v$ 划分为两部分并计算基尼指数，即 $\operatorname{Gini\_index}(D, a) = \frac{|D^{a=v}|}{|D|} \operatorname{Gini}(D^{a=v}) + \frac{|D^{a \neq v}|}{|D|} \operatorname{Gini}(D^{a \neq v})$
2. 选择基尼指数最小的属性以及最优划分点进行划分
3. 对子集合迭代完成以上划分，直到满足停止条件

