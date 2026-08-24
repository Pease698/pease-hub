跟着 B 站上一门 [机器学习的课](https://www.bilibili.com/video/BV1puGv6TEjV/?spm_id_from=333.1007.top_right_bar_window_default_collection.content.click&vd_source=b4b6b348eb2ec24665e87125a8cf8851) 进行学习，参考教材为周志华教授的西瓜书以及配套的南瓜书

[其他笔记请点击](/blog/machine-learning-1/MLdir)

## 集成学习

集成学习系统集合多个个体学习器的结果以提升预测的准确性和泛化能力。这里的个体学习器包括前面的线性回归、SVM、决策树等

![](/blogs/machine-learning-6/8_ensemble.png)

集成学习要求每个个体学习器至少 **比随即预测的结果要好一些**；同时又要求每个学习器有一定的 **差异性**

集成学习的收敛性保证可以用以下式子表示：
$$
\begin{align*}
P(H(\boldsymbol{x}) \neq f(\boldsymbol{x})) &= \sum_{k=0}^{\lfloor T/2 \rfloor} \binom{T}{k} (1-\epsilon)^k \epsilon^{T-k} \\
&\leqslant \exp \left( -\frac{1}{2}T(1-2\epsilon)^2 \right)
\end{align*}
$$
其中
- $H(x)$ 表示多个个体学习器预测结果整体，$f(x)$ 表示样本的真实标签。上述式子即表示集成学习预测失败的概率
- T 为个体学习器数量，$\epsilon$ 为每个学习器的预测误差。当预测正确的个体学习器数量小于半数时，我们认为预测失败。$\binom{T}{k}$ 为排列组合，$(1-\epsilon)^k$ 表示 k 个学习器预测正确的概率（k 小于半数），$\epsilon^{T-k}$ 表示剩余学习器预测错误的概率（数量多余半数）
- 根据不等式可以发现，集成个体学习器的收敛速率随着数量 T 快速下降；且只有 $\epsilon=0.5$ 的个体集成器对收敛没有作用，$\epsilon<0.5$ 或 $\epsilon>0.5$ 都可以收敛

> [!tip]
> 当 $\epsilon>0.5$ 时，可以通过将个体学习器的预测结果取反实现收敛

## Adaboost

**Adaboost** 算法希望学习 T 的个体学习器 $h_t$，同时给每个个体学习器分配一个权重 $\alpha_t$ 以进行集成：
$$
H(x)=\sum^T_{t=1}\alpha_th_t(x)
$$
其损失函数可以表示为（$\mathcal{D}$ 为样本分布）：
$$
\ell_{\mathrm{exp}}(H \mid \mathcal{D})=\mathbb{E}[e^{-f(x)H(x)}]
$$
每个个体学习器的预测结果为 $\{1,\;-1\}$，故最后可以将 $H(x)$ 的正负看作对结果的预测。当 $H(x)$ 结果和真实标签 $f(x)$ 不同时（也就是异号），损失 $e^{-f(x)H(x)}>1$，反之若预测正确则损失小于 1

为了进行对多个个体学习器进行学习，Adaboost 采用 *前向分布求解算法*，也就是每一轮仅学习一个学习器 $h_t$ 以及对应的权重 $\alpha_t$。在学习第 t 轮时，假设前 t-1 个学习器和权重都已经学习完成，有：
$$
(\alpha_t, h_t) = \operatorname*{arg\,min}_{\alpha, h} \;\ell_{\text{exp}}(H_{t-1} + \alpha h \mid \mathcal{D})
$$
带入前面的损失函数有（$\mathcal{D}(x_i)$ 表示样本 $x_i$ 出现的频率）：
$$
\begin{align*}
\ell_{\text{exp}}(H_{t-1} + \alpha h \mid \mathcal{D}) &= \mathbb{E} \left[ e^{-f(\boldsymbol{x})(H_{t-1}(\boldsymbol{x}) + \alpha h(\boldsymbol{x}))} \right] \\
&= \sum_{i=1}^{|D|} \mathcal{D}(\boldsymbol{x}_i) e^{-f(\boldsymbol{x}_i)(H_{t-1}(\boldsymbol{x}_i) + \alpha h(\boldsymbol{x}_i))} \\
&= \sum_{i=1}^{|D|} \mathcal{D}(\boldsymbol{x}_i) e^{-f(\boldsymbol{x}_i)H_{t-1}(\boldsymbol{x}_i)} e^{-f(\boldsymbol{x}_i)\alpha h(\boldsymbol{x}_i)}
\end{align*}
$$
由于 $f(x_i),\;h(x_i)$ 仅可以取值 $\{1,\;-1\}$，由此对该表达式进一步化简：
$$
\begin{align*}
\ell_{\text{exp}}(H_{t-1} + \alpha h \mid \mathcal{D}) &= \sum_{i=1}^{|D|} \mathcal{D}(\boldsymbol{x}_i) e^{-f(\boldsymbol{x}_i)H_{t-1}(\boldsymbol{x}_i)} \left( e^{-\alpha} + (e^{\alpha} - e^{-\alpha}) \mathbb{I}(f(\boldsymbol{x}_i) \neq h(\boldsymbol{x}_i)) \right) \\
&= \sum_{i=1}^{|D|} \mathcal{D}(\boldsymbol{x}_i) e^{-f(\boldsymbol{x}_i)H_{t-1}(\boldsymbol{x}_i)} e^{-\alpha} + \sum_{i=1}^{|D|} \mathcal{D}(\boldsymbol{x}_i) e^{-f(\boldsymbol{x}_i)H_{t-1}(\boldsymbol{x}_i)} (e^{\alpha} - e^{-\alpha}) \mathbb{I}(f(\boldsymbol{x}_i) \neq h(\boldsymbol{x}_i))
\end{align*}
$$
其中 $x\;\mathbb{I}\;c$ 表示若条件 c 成立则取 x，否则为 0。使用 $\mathcal{D}_t'(\mathbf{x}_i)$ 表示 $\mathcal{D}(\boldsymbol{x}_i) e^{-f(\boldsymbol{x}_i)H_{t-1}(\boldsymbol{x}_i)}$，则有：
$$
\ell_{\exp} \left( H_{t-1} + \alpha h \mid \mathcal{D} \right) = e^{-\alpha} \sum_{i=1}^{|\mathcal{D}|} \mathcal{D}'_t \left( \mathbf{x}_i \right) + \left( e^{\alpha} - e^{-\alpha} \right) \sum_{i=1}^{|\mathcal{D}|} \mathcal{D}'_t \left( \mathbf{x}_i \right) \mathbb{I} \left( f \left( \mathbf{x}_i \right) \neq h \left( \mathbf{x}_i \right) \right)
$$
**求解 $h_t$**：

即我们的目标为（由于 $\alpha>0$，所以 $e^\alpha+e^{-\alpha}>0$ 也可省略）：
$$
h_t = \arg\min_h\sum_{i=1}^{|\mathcal{D}|} \mathcal{D}'_t(\mathbf{x}_i) \mathbb{I}(f(\mathbf{x}_i) \neq h(\mathbf{x}_i))
$$
对于 $\mathcal{D}_t'(\mathbf{x}_i)$，其仅和前 t - 1 轮的学习有关，在新一轮学习中不会改变。可以将其看作样本 i 在第 t 轮学习时的 *权重分布*，之前分类错误的样本此时权重会更高，而之前分类正确的样本此时权重会相对较低，*所以 Adaboost 在每轮学习时会越来越关注分类错误的样本*

这里的 $\mathcal{D}_t'(\mathbf{x}_i)$ 为未归一化的样本权重，可以通过 $\mathcal{D}_t(x_i) = \frac{\mathcal{D}'_t(x_i)}{\sum_{i=1}^{|D|} \mathcal{D}'_t(x_i)}$ 进行进行归一化。t +1 轮的样本权重可以通过第 t 轮的权重计算得到：
$$
\begin{align*}
\mathcal{D}'_{t+1}(x_i) &= \mathcal{D}(x_i) e^{-f(x_i) H_t(x_i)} \\
&= \mathcal{D}(x_i) e^{-f(x_i)(H_{t-1}(x_i) + \alpha_t h_t(x_i))} \\
&= \mathcal{D}(x_i) e^{-f(x_i) H_{t-1}(x_i)} e^{-f(x_i) \alpha_t h_t(x_i)} \\
&= \mathcal{D}_t(x_i) e^{-f(x_i) \alpha_t h_t(x_i)}
\end{align*}
$$
**求解 $\alpha_t$**：

将损失函数对 $\alpha_t$ 计算偏导有：
$$
\begin{align*}
\frac{\partial \ell_{\exp}(H_{t-1} + \alpha h_t \mid D)}{\partial \alpha} 
&= \frac{\partial \left( e^{-\alpha} \sum_{i=1}^{|D|} D'_t(x_i) + (e^{\alpha} - e^{-\alpha}) \sum_{i=1}^{|D|} D'_t(x_i) \mathbb{I}(f(x_i) \neq h(x_i)) \right)}{\partial \alpha} \\
&= -e^{-\alpha} \sum_{i=1}^{|D|} D'_t(x_i) + (e^{\alpha} + e^{-\alpha}) \sum_{i=1}^{|D|} D'_t(x_i) \mathbb{I}(f(x_i) \neq h(x_i))
\end{align*}
$$
令导数为 0，可以得到：
$$
\frac{e^{-\alpha}}{e^{\alpha} + e^{-\alpha}} = \sum_{i=1}^{|D|} D_t(x_i) \mathbb{I}(f(x_i) \neq h(x_i)) 
= \mathbb{E}[\mathbb{I}(f(x_i) \neq h(x_i))] 
= \epsilon_t
$$
其中 $\mathbb{E}[\mathbb{I}(f(x_i) \neq h(x_i))]$ 表示预测错误时根据样本权重计算的期望，也就是在第 t 步时的个体学习器预测误差 $\epsilon_t$

根据上式可以得到：
$$
\alpha_t=\frac{1}{2}ln(\frac{1-\epsilon_t}{\epsilon_t})
$$
## Gradient Boosting

Adaboost 算法限制问题为二分类问题，且对损失函数进行了规定。如果解除这些约束，得到的框架就是 **Gradient Boosting**

定义损失函数的一般形式：
$$
\begin{align*}
\ell(H_t \mid D) &= \mathbb{E}_{x \sim D}[\text{err}(H_t(x), f(x))] \\
&= \mathbb{E}_{x \sim D}[\text{err}(H_{t-1}(x) + \alpha_t h_t(x), f(x))]
\end{align*}
$$
对该表达式在 $H_{t-1}(x)$ 进行一阶泰勒展开（也就是 $f(x)=f(x_0)+f(x_0)'(x-x_0)$）：
$$
\begin{align*}
\ell (H_t | \mathcal{D}) &\approx \mathbb{E}_{\boldsymbol{x} \sim \mathcal{D}} \left[ \text{err}(H_{t-1}(\boldsymbol{x}), f(\boldsymbol{x})) + \left. \frac{\partial \text{err}(H_t(\boldsymbol{x}), f(\boldsymbol{x}))}{\partial H_t(\boldsymbol{x})} \right|_{H_t(\boldsymbol{x})=H_{t-1}(\boldsymbol{x})} (H_t(\boldsymbol{x}) - H_{t-1}(\boldsymbol{x})) \right] \\
&= \mathbb{E}_{\boldsymbol{x} \sim \mathcal{D}} \left[ \text{err}(H_{t-1}(\boldsymbol{x}), f(\boldsymbol{x})) + \left. \frac{\partial \text{err}(H_t(\boldsymbol{x}), f(\boldsymbol{x}))}{\partial H_t(\boldsymbol{x})} \right|_{H_t(\boldsymbol{x})=H_{t-1}(\boldsymbol{x})} \alpha_t h_t(\boldsymbol{x}) \right] \\
&= \mathbb{E}_{\boldsymbol{x} \sim \mathcal{D}} \left[ \text{err}(H_{t-1}(\boldsymbol{x}), f(\boldsymbol{x})) \right] + \mathbb{E}_{\boldsymbol{x} \sim \mathcal{D}} \left[ \left. \frac{\partial \text{err}(H_t(\boldsymbol{x}), f(\boldsymbol{x}))}{\partial H_t(\boldsymbol{x})} \right|_{H_t(\boldsymbol{x})=H_{t-1}(\boldsymbol{x})} \alpha_t h_t(\boldsymbol{x}) \right]
\end{align*}
$$
由于前一部分期望为常数，所以我们只需要最小化后半部分即可。也就是：
$$
\begin{align*}
h_t(\boldsymbol{x}) &= \underset{h}{\arg\min} \mathbb{E}_{\boldsymbol{x}\sim\mathcal{D}} \left[ \left. \frac{\partial \text{err}(H_t(\boldsymbol{x}), f(\boldsymbol{x}))}{\partial H_t(\boldsymbol{x})} \right|_{H_t(\boldsymbol{x})=H_{t-1}(\boldsymbol{x})} h(\boldsymbol{x}) \right] \\
\alpha_t &= \underset{\alpha}{\arg\min} \mathbb{E}_{\boldsymbol{x} \sim \mathcal{D}} \left[ \text{err}(H_{t-1}(\boldsymbol{x}) + \alpha h_t(\boldsymbol{x}), f(\boldsymbol{x})) \right]
\end{align*}
$$
使用该推导思路也可以推出 AdaBoost 的 $h_t(\mathbf{x}),\;\alpha_t$ 表达式，这里不再详细说明

## GBDT

以 Gradient Boosting 作为基本框架，可以拓展得到 **GBDT** 算法。该算法使用 CART 作为个体学习器，可以用于解决二分类问题或回归问题

> [!tip]
> CART 包含分类树和回归树两种。其中分类树使用基尼指数进行划分，输出类别或类别概率；回归树使用平方误差作为损失函数，返回叶节点的样本均值

针对回归问题，GBDT 使用平方损失作为损失函数；针对二分类问题，采用对数似然孙树函数 $log(1+exp(-H_t(x)f(x)))$

> [!note]
> **XGBoost** 可以看作 GBDT 的一种高效实现和改进

## Bagging

Boosting 需要先完成前面的学习，后续的学习器相当于在此基础上针对错误样本进行针对性学习，为串行方式；而 **Bagging** 则让多个学习器并行学习哦那个一个任务，最终采用投票等方式将结果进行整合

相对来说，Boosting 最终预测的偏差会比 Bagging 要小；但 Bagging 中各个学习器预测的方差会比 Boosting 要小

Bagging 方法会从整体数据集中随机采样 T 个大小为 m 的子数据集（保证学习器的差异性），并行训练不同的学习器，最终将这些学习器的预测结果进行结合

> [!note] 自助采样法
> 可以采用 **自助采样法** 采样不同的数据集进行学习。对大小为 n 的数据集，有放回采样 n 次（有的样本可能被重复抽到），则最终没有被抽到的样本占比约为：
> $$
> lim_{n \to \infty} \left( 1 - \frac{1}{n} \right)^n = \frac{1}{e} \approx 36.6\%
> $$
> 通过这种方式可以保证采样到一定数量的数据集用于训练同时又保证数据集的差异性

## 随机森林

**随机森林** 为 Bagging 的一个扩展变体，在以决策树为基学习器进行集成的基础上引入决策树训练时的属性随机选择

决策树中每次选择属性进行划分时，随机森林会随机选择一部分属性作为侯选属性，其他非侯选属性则不考虑此时作为划分的属性（但可能在其他划分时被选为候选属性）

相比 Bagging，随机森林每次只需要考虑部分属性进行划分，所以训练效率更高；同时由于引入了属性的扰动，所以泛化误差也会更好

