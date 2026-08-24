跟着 B 站上一门 [机器学习的课](https://www.bilibili.com/video/BV1puGv6TEjV/?spm_id_from=333.1007.top_right_bar_window_default_collection.content.click&vd_source=b4b6b348eb2ec24665e87125a8cf8851) 进行学习，参考教材为周志华教授的西瓜书以及配套的南瓜书

[其他笔记请点击](/blog/machine-learning-1/MLdir)

从几何角度来看，对于一个线性可分的数据集，**支持向量机** 就是找距离正负样本都最远的超平面。相比于前面介绍的感知机，支持向量机的解是唯一的，泛化性能更好

## 超平面

对于 $\mathbf{w}^\mathrm{T}\mathbf{x}+b=0$ 定义的超平面：
- 法向量 $\mathbf{w}$ 指向的空间为正空间，带入 $\mathbf{w}^\mathrm{T}\mathbf{x}+b$ 得到结果为正数；另一半空间为负空间，带入表达式结果为负数
- 任意点 $\mathbf{x}$ 到超平面的距离公式为：$r = \frac{|\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} + b|}{\| \boldsymbol{w} \|}$

对于给定超平面 $\mathbf{w}^\mathrm{T}\mathbf{x}+b=0$ 和数据集 X，定义 X 中任意一个样本点 $(\mathbf{x}_i,\;y_i)$（其中 $y_i\in\{-1,\;1\}$）关于超平面的 **几何间隔** 为：
$$
\gamma_i = \frac{y_i(\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b)}{\| \boldsymbol{w} \|}
$$
可见
- 当正确分类时，$\gamma_i$ 为点到超平面的距离
- 当错误分类时，有 $\gamma_i<0$

另外定义数据集 X 关于超平面的几何间隔为其中所有样本点的几何间隔最小值，即 $\gamma=\min_{i=1,\;\cdots,\;m}\gamma_i$

## 支持向量机

给定 *线性可分的* 数据集 X，**支持向量机** 希望找到 X 关于超平面的几何间隔达到最大的那个超平面，并使用 sign 函数实现分类功能，即：
$$
y = \operatorname{sign}(\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} + b) = \begin{cases}
1, & \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} + b > 0 \\
-1, & \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} + b < 0
\end{cases}
$$
设 X 中几何间隔最小的样本为 $(\mathbf{x}_{min},\;y_{min})$。则可以将寻找超平面的过程看作以下有约束条件的优化问题：
$$
\begin{align*}
&\max \gamma &&s.t.\quad\gamma_i\ge\gamma \\
&\max \frac{y_{min} (\mathbf{w}^\mathrm{T}\mathbf{x}_{min}+b)}{\left\|\mathbf{w}\right\|} &&s.t.\quad\frac{y_i (\mathbf{w}^\mathrm{T}\mathbf{x}_i+b)}{\left\|\mathbf{w}\right\|}\ge\frac{y_{min} (\mathbf{w}^\mathrm{T}\mathbf{x}_{min}+b)}{\left\|\mathbf{w}\right\|} \\
&\max \frac{y_{min} (\mathbf{w}^\mathrm{T}\mathbf{x}_{min}+b)}{\left\|\mathbf{w}\right\|} &&s.t.\quad y_i (\mathbf{w}^\mathrm{T}\mathbf{x}_i+b)\ge y_{min} (\mathbf{w}^\mathrm{T}\mathbf{x}_{min}+b)
\end{align*}
$$
为了得到最优解，令 $y_{min}(\mathbf{w}^\mathrm{T}\mathbf{x}_{min}+b)=1$，则问题可以转化为：
$$
\max \frac{1}{\left\|\mathbf{w}\right\|} \qquad s.t.\quad y_i (\mathbf{w}^\mathrm{T}\mathbf{x}_i+b)\ge 1
$$
进行恒等变换：
$$
\min \frac{1}{2}\left\|\mathbf{w}\right\|^2 \qquad s.t.\quad1-y_i(\mathbf{w}^\mathrm{T}\mathbf{x}_i+b)\le0
$$
该问题为含不等式约束的凸优化问题。对于支持向量机，常采用拉格朗日对偶进行求解

有关凸优化问题和拉格朗日对偶可见 [这里](/blog/machine-learning-4/SVM_1)

构造该问题的拉格朗日函数：
$$
\begin{align*}
L(\boldsymbol{w}, b, \boldsymbol{\alpha}) &= \frac{1}{2} \| \boldsymbol{w} \|^2 + \sum_{i=1}^{m} \alpha_i \left( 1 - y_i (\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b) \right) \\
&= \frac{1}{2} \| \boldsymbol{w} \|^2 + \sum_{i=1}^{m} \alpha_i - \sum_{i=1}^{m} \alpha_i y_i \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i - b \sum_{i=1}^{m} \alpha_i y_i
\end{align*}
$$
此时对 $\mathbf{w},\;b$ 求偏导并令其为 0，就可以得到拉格朗日对偶函数的表示：
$$
\begin{align*}
\mathbf{w}&=\sum^m_{i=1}\alpha_iy_ix_i\\
0&=\sum^m_{i=1}\alpha_iy_i
\end{align*}
$$
可以得到对偶问题为：
$$
\begin{align*}
\max_{\boldsymbol{\alpha}} \quad & \sum_{i=1}^{m} \alpha_i - \frac{1}{2} \sum_{i,j} \alpha_i \alpha_j y_i y_j \boldsymbol{x}_i^{\mathrm{T}} \boldsymbol{x}_j \\
\text{s.t.} \quad & \alpha_i \geqslant 0, \\
& \sum_{i} \alpha_i y_i = 0.
\end{align*}
$$
由于满足强对偶性，一定满足 KKT 条件：
$$
\begin{cases}
\alpha_i^* \geqslant 0 \\
y_i f(\boldsymbol{x}_i) - 1 \geqslant 0 \\
\alpha_i^* (y_i f(\boldsymbol{x}_i) - 1) = 0
\end{cases}
$$
其中 $f(\mathbf{x_i})=\mathbf{w^*}^\mathrm{T}\mathbf{x}_i+b^*$。由此可以得知若 $\alpha_i^* > 0$，则 $f(\mathbf{x}_i)=\mathbf{w^*}^\mathrm{T}\mathbf{x}_i+b^*=y_i$（因为 $y_i\in\{1,\;-1\}$），即 $b^*=y_i-\mathbf{w^*}^\mathrm{T}\mathbf{x}_i$

> [!tip]
> 选择拉格朗日对偶求解支持向量机的原因：
> 1. 对偶问题为凸优化问题，容易求解；且在特征维数远高于数据量时使用拉格朗日对偶求解更高效
> 2. 对偶问题可以很自然的引入核函数，进而推广到非线性分类问题

## 软间隔

![](/blogs/machine-learning-4/6_soft.png)

从数学角度看，**软间隔** 就是允许部分样本（但要尽可能少）不满足以下约束条件以解决非线性可分的数据集：
$$
\min \frac{1}{2}\left\|\mathbf{w}\right\|^2 \qquad s.t.\quad1-y_i(\mathbf{w}^\mathrm{T}\mathbf{x}_i+b)\le0
$$
为此需要将约束条件转化为损失函数进行优化，一个较好的损失函数需要满足下面几个特点：
- 满足约束条件时，损失函数为 0
- 不满足约束条件时，损失函数不为 0
- 不满足约束条件时，损失与违反约束条件的程度成正比（可选）

一种损失函数为：
$$
\min_{w,b} \frac{1}{2} \|\boldsymbol{w}\|^2 + C \sum_{i=1}^{m} \ell_{0/1} \left( y_i \left( \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b \right) - 1 \right)
$$
其中 $C>0$ 为常数，用于调节损失的权重（当 $C\rightarrow+\infty$ 时，问题退化为硬间隔问题）；$\ell_{0/1}$ 为 *0/1 损失函数*，有：
$$
\ell_{0/1}(z) = \begin{cases}
1, & \text{if } z < 0 \\
0, & \text{if } z \geqslant 0
\end{cases}
$$
但由于 0/1 损失函数的数学性质不好，所以常使用 **hinge（合页）损失** 进行替代：
$$
\ell_{\text{hinge}}(z) = \max(0, 1 - z)
$$
于是有：
$$
\min_{w,b} \frac{1}{2} \|\boldsymbol{w}\|^2 + C \sum_{i=1}^{m} \max(0, 1 - y_i (\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b))
$$
引入 *松弛变量* $\xi_i$，则上式等价于以下优化问题：
$$
\begin{align*}
& \min_{w,b,\xi_i} \quad \frac{1}{2} \|\boldsymbol{w}\|^2 + C \sum_{i=1}^{m} \xi_i \\
& \text{s.t.} \quad y_i \left( \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b \right) \geqslant 1 - \xi_i \\
& \phantom{\text{s.t.} \quad} \xi_i \geqslant 0, \quad i = 1, 2, \ldots, m
\end{align*}
$$
> [!note]
> 令 $\max \left(0, 1 - y_i \left( \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b \right) \right) = \xi_i$，显然有 $\xi_i\ge0$
> 
> 当 $1 - y_i \left( \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b \right)>0$ 时，有 $\xi_i=1 - y_i \left( \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b \right)$；反之则有 $\xi_i=0$。故 $1 - y_i \left( \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b \right)\le\xi_i$，即
> $$
> y_i \left( \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i + b \right)\ge1-\xi_i
> $$

## 支持向量回归

![](/blogs/machine-learning-4/6_SVR.png)

线性回归直接使用一条线对样本进行拟合；**支持向量回归 (SVR)** 采用以 $f(\mathbf{x})$ 为中心、宽 $2\epsilon$ 的间隔带进行拟合

对于落在间隔带内的样本不计算损失；处于间隔带外的样本点使用距离间隔带的偏差作为损失

SVR 的优化问题可以表示为：
$$
\min_{w,b} \frac{1}{2} \|\boldsymbol{w}\|^2 + C \sum_{i=1}^{m} \ell_{\epsilon} (f(\boldsymbol{x}_i) - y_i)
$$
其中 $\ell_\epsilon(z)$ 为 $\epsilon$ 不敏感损失函数：
$$
\ell_{\epsilon}(z) = \begin{cases}
0, & \text{if } |z| \le \epsilon \\
|z| - \epsilon, & \text{if } |z| > \epsilon
\end{cases}
$$
这里的 $\frac{1}{2}\left\|\mathbf{w}\right\|^2$ 为 L2 正则项（防止过拟合）。这里引入正则项除了进行正则化，还可以和软间隔 SVM 问题保持形式一致，方便导出对偶问题和引入核函数

同样引入松弛变量 $\xi_i$，有：
$$
\ell_{\epsilon}(f(\boldsymbol{x}_i) - y_i) = \xi_i
$$
根据前面的证明思路，可以将 SVR 优化问题改写为：
$$
\begin{align*}
\min_{w,b,\xi_i} \quad & \frac{1}{2} \|\boldsymbol{w}\|^2 + C \sum_{i=1}^{m} \xi_i \\
\text{s.t.} \quad & -\epsilon - \xi_i \le f(\boldsymbol{x}_i) - y_i \le \epsilon + \xi_i \\
& \xi_i \ge 0, \quad i = 1, 2, \ldots, m
\end{align*}
$$
甚至可以考虑两侧采用不同的松弛程度，有：
$$
\begin{align*}
\min_{w,b,\xi_i,\hat{\xi}_i} \quad & \frac{1}{2} \|\boldsymbol{w}\|^2 + C \sum_{i=1}^{m} (\xi_i + \hat{\xi}_i) \\
\text{s.t.} \quad & -\epsilon - \hat{\xi}_i \leqslant f(\boldsymbol{x}_i) - y_i \leqslant \epsilon + \xi_i \\
& \xi_i \geqslant 0, \quad \hat{\xi}_i \geqslant 0, \quad i = 1, 2, \ldots, m
\end{align*}
$$
