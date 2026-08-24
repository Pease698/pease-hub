跟着 B 站上一门 [机器学习的课](https://www.bilibili.com/video/BV1puGv6TEjV/?spm_id_from=333.1007.top_right_bar_window_default_collection.content.click&vd_source=b4b6b348eb2ec24665e87125a8cf8851) 进行学习，参考教材为周志华教授的西瓜书以及配套的南瓜书

[其他笔记请点击](/blog/machine-learning-1/MLdir)

## 距离计算

**聚类** 希望将相似的样本聚集到一起，也急速使同一类簇的样本尽可能接近，不同类簇的尽可能远离

之前介绍的机器学习方法大多为有监督算法，即训练时需要样本标签告知正确答案；聚类属于无监督算法，不需要提前了解样本的标签也可以完成学习

定义常用的几种距离，当属性为连续或离散有序时，可以采用 **明可夫斯基距离**：
$$
\mathrm{dist}_{\mathrm{mk}}(\boldsymbol{x}_i, \boldsymbol{x}_j) = \left( \sum_{u=1}^{n} |x_{iu} - x_{ju}|^p \right)^{\frac{1}{p}}
$$
当 p = 2 时退化为 **欧氏距离**：
$$
\mathrm{dist}_{\mathrm{ed}}(\boldsymbol{x}_i, \boldsymbol{x}_j) = \|\boldsymbol{x}_i - \boldsymbol{x}_j\|_2 = \sqrt{\sum_{u=1}^{n} |x_{iu} - x_{ju}|^2}
$$
当 p = 1 时退化为 **曼哈顿距离**：
$$
\mathrm{dist}_{\mathrm{man}}(\boldsymbol{x}_i, \boldsymbol{x}_j) = \|\boldsymbol{x}_i - \boldsymbol{x}_j\|_1 = \sum_{u=1}^{n} |x_{iu} - x_{ju}|
$$
对于离散无序的属性，可以采用 **VDM 度量**：
$$
\mathrm{VDM}_p(a, b) = \sum_{i=1}^{k} \left| \frac{m_{u,a,i}}{m_{u,a}} - \frac{m_{u,b,i}}{m_{u,b}} \right|^p
$$
上式中，m 表示数量，u 表示某属性，a、b 表示该属性的两种不同取值，i 表示标签属性的某个取值。属性 u 的 a、b 两取值之间的距离时，会对标签属性的每种取值都进行枚举，使用以上公式计算得到结果

## kmeans

给定样本集合 D，**kmeans** 算法需要划分出 k 的簇，使得以下误差最小：
$$
E = \sum_{i=1}^{k} \sum_{\boldsymbol{x} \in C_i} \| \boldsymbol{x} - \boldsymbol{\mu}_i \|_2^2
$$
其中 $\mu_i = \frac{1}{|C_i|} \sum_{x \in C_i} x$ 为簇 $C_i$ 的均值向量

该问题实际上为 NP-hard 问题，所以一般使用迭代算法计算近似解。计算过程如下：
1. 随机选取 k 个点作为初始类中心，分别计算其他点与这 k 个点的距离，并选择距离最短的中心进行归类，得到 k 类
2. 基于初始归类分别计算每个类的中心点（也就是均值向量），将其作为新的类中心
3. 随后重新分别计算每个点到这 k 个类中心的距离，并选择最短距离进行归类，得到新的 k 类。最后回到第二步进行迭代

![](/blogs/machine-learning-7/9_kmeans.png)

## 密度聚类

密度聚类假设聚类结构能够通过样本分布的紧密程度决定，也就是考虑样本密度进行聚类。DBSCAN 就是密度聚类的典型算法

DBSCAN 使用一组邻域参数 $(\epsilon,\;MinPts)$ 刻画样本分布的紧密程度，几个相关的概念如下：
1. $\epsilon$-邻域：和样本 x 距离不超过 $\epsilon$ 的样本的集合
2. 核心对象：若样本 x 的 $\epsilon$-邻域内包含至少 MinPts 个样本，则 x 为一个核心对象
3. 密度直达：若 $x_j$ 位于核心对象 $x_i$ 的 $\epsilon$-邻域内，则称 $x_i$ 密度直达 $x_j$（密度直达不一定为对称关系）
4. 密度可达：若存在样本序列 $x_i,\;p_1,\;\cdots,\;p_n,\;x_j$，其中 $p_i$ 密度直达 $p_{i+1}$（$x_i$ 和 $p_1$ 以及 $p_n$ 和 $x_j$ 也满足这一关系），则称 $x_i$ 密度可达 $x_j$
5. 密度相连：以上序列中任意两点密度相连。严格定义为：若两个点从同一个起点密度可达，则这两点密度相连

在 DBSCAN 中，定义最大密度相连的样本集合为一个簇。其算法基本思路为：
1. 首先计算所有点的 $\epsilon$-邻域，挑出所有核心点
2. 每次随机选择一个尚未聚类的核心点。从该核心点出发，将所有密度相连且尚未聚类的点放到一个新的类中
3. 不断执行第二步直到所有点都聚类完成

![](/blogs/machine-learning-7/9_DBSCAN.png)

## 层次聚类

**层次聚类** 试图将数据划分为不同层次，其聚类结果有明显的树状结构。AGNES 为一种采用自底向上聚合的层次聚类算法，在聚类时不断合并距离最近的两个类簇，直到达到预取的聚类簇数量为止

有几种定义类簇之间距离的方式：
- 最小距离：使用两个簇中最近样本的距离
- 最大距离：使用两个簇中最远样本的距离
- 平均距离：使用两个簇中两两样本距离的均值

![](/blogs/machine-learning-7/9_AGNES.png)

