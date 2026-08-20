跟着 B 站上一门 [机器学习的课](https://www.bilibili.com/video/BV1puGv6TEjV/?spm_id_from=333.1007.top_right_bar_window_default_collection.content.click&vd_source=b4b6b348eb2ec24665e87125a8cf8851) 进行学习，参考教材为周志华教授的西瓜书以及配套的南瓜书

[其他笔记请点击](/blog/machine-learning-1/MLdir)

## M-P 神经元

**M-P 神经元** 可以接受一个输入向量（一般来自其他神经元），并对该向量计算加权平均，于自身阈值 $\theta$ 进行比较（也就是做减法），最后经过激活函数处理得到输出
$$
y = f\left( \sum_{i=1}^{n} w_i x_i - \theta \right) = f(\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} + b) \tag{1}
$$
感知机（使用 sgn 作为激活函数）以及对数几率回归（使用 sigmoid 函数作为激活函数）可以看作单个 M-P 神经元；神经网络则由多个 M-P 神经元组成

## 感知机

**感知机** 使用 **sgn 阶跃函数** 作为激活函数，其中：
$$
sgn(x)=
\begin{cases}
1,\quad&x\ge0\\
0,&x<0
\end{cases}
$$
带入式 1，得到感知机的数学表达式：
$$
y = \operatorname{sgn}(\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} - \theta) = \begin{cases}
1, & \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} - \theta \ge 0 \\
0, & \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} - \theta < 0
\end{cases} \tag{2}
$$
感知机可以用于分类工作，将数据分为正样本（结果为 1）和负样本（结果为 0）两类

> [!tip]
> 从几何角度看，给定一个 *线性可分* 的数据集，感知机的目标就是学习得到能将该数据集中的数据完全正确划分的超平面，$\mathbf{w}^\mathrm{T}\mathbf{x}-\theta$ 就是 n 维超平面方程
> 
> 需要注意的是，法向量 $\mathbf{w}$ 垂直于超平面且指向的为正空间，另一侧为负空间

训练感知机时，可以先随机初始化 $\mathbf{w}$ 和 $\theta$，随后针对所有的 *误分类样本*，只存在下面两种情况：
- $\mathbf{w}^\mathrm{T}\mathbf{x}-\theta\ge0$ 即分类输出 $\hat{y}=1$，但真实标签 $y=0$；
- $\mathbf{w}^\mathrm{T}\mathbf{x}-\theta<0$ 即分类输出 $\hat{y}=0$，但真实标签 $y=1$；

这两种情况都满足以下表达式：
$$
(\hat{y} - y)(\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} - \theta) \ge 0
$$
定义损失函数：
$$
L(\boldsymbol{w}, \theta) = \sum_{\boldsymbol{x} \in M} (\hat{y} - y)(\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} - \theta) \tag{3}
$$
该损失函数非负；没有误分类点时损失函数为 0（因为 $\hat{y}=y$），误分类点越少、离超平面越近则损失函数越小

为简化计算：$-\theta=-1\cdot w_{n+1}=x_{n+1}w_{n+1}$，将 $-\theta$ 合并到前面的向量乘法中，得到需要最小化的目标函数：
$$
\min_{\boldsymbol{w}} L(\boldsymbol{w}) = \min_{\boldsymbol{w}} \sum_{\boldsymbol{x}_i \in M} (\hat{y}_i - y_i) \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}_i
$$
> [!note] 梯度下降
> 为了调整自变量以最小化某函数 $f(\mathbf{x})$，可以计算函数于当前位置的梯度 $\nabla f(\mathbf{x})$，并使用以下公式对 $\mathbf{x}$ 进行迭代（因为负梯度为函数减小最快的方向）：
> $$
> \mathbf{x}_{t+1}=\mathbf{x}_{t}-\eta\nabla f(\mathbf{x}_t)
> $$
> 使用梯度下降法调整参数时，需要将参数作为函数自变量进行调整，以实现在样本不变的情况下最好的拟合效果
> 
> 假设训练集有 N 个样本，根据每次计算梯度使用样本数量可以分为三种方法：
> - **Batch Gradient Descent**，每次计算梯度时使用全部样本处梯度取平均进行更新
> - **Stochastic Gradient Descent (SGD)**，每次随机选择一个样本计算梯度并进行更新
> - **Mini-batch Gradient Descent**，每次使用一小批数据计算平均梯度并更新，为现代深度学习中最常使用的方法

感知机采用 **随机梯度下降** 方法，每次随机选取一个误分类样本进行参数更新。可以计算得到函数关于 $\mathbf{w}$ 的梯度为：
$$
\nabla_{\boldsymbol{w}} L(\boldsymbol{w}) = \sum_{\boldsymbol{x}_i \in M} (\hat{y}_i - y_i) \boldsymbol{x}_i
$$
故每次随机选择误分类样本后，参数 $\mathbf{w}$ 的更新公式为：
$$
\begin{align*}
\boldsymbol{w} &\leftarrow \boldsymbol{w} + \Delta \boldsymbol{w}\\
\Delta \boldsymbol{w} &= -\eta(\hat{y}_i - y_i)\boldsymbol{x}_i = \eta(y_i - \hat{y}_i)\boldsymbol{x}_i
\end{align*}
$$
## 神经网络

> [!note] 通用近似定理
> 只需要一个包含足够多神经元的隐层，多层前馈网络就可以以任意精度逼近任意复杂度的连续函数

### 多层前馈神经网络

**多层前馈神经网络（又称多层感知机 MLP）**：每层神经元与下一层神经元全部互连，但同层神经元之间不存在连接，也不存在跨层神经元的连接

![](/blogs/machine-learning-3/5_MLP.png)

可以将神经网络看作一个特征加工函数（其会自动学习有用的特征），最终输出层的结果为 $\mathbf{y}=\mathbf{x}^*$
- 若需要完成回归任务，可以在输出层后接一个 $\mathbb{R}^l \to \mathbb{R}$ 的神经元，如没有激活函数的神经元：$y = \boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}^* + b$
- 若需要完成分类任务，可以在输出层后接一个 $\mathbb{R}^l\rightarrow[0,\;1]$ 的神经元，如使用 sigmoid 作为激活函数的神经元：$y = \frac{1}{1 + e^{-(\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x}^* + b)}}$

> [!tip]
> 神经网络对应的函数一般都为非凸函数，难以直接计算闭式解，所以一般通过梯度下降等方法计算近似解

### BP 算法

**误差逆传播算法（BP 算法）** 为基于随机梯度下降的参数更新算法。设多层前馈网络中的激活函数全部为 sigmoid 函数（求导存在 $f'(x)=f(x)(1-f(x))$），且目标任务为回归任务所以采用均方误差作为损失函数。对于某样本 $(\mathbf{x}_k,\;\mathbf{y}_k)$，设多层前馈网络输出为 $\hat{\mathbf{y}}_k=(\hat{y}^k_1,\;\cdots,\;\hat{y}^k_l)$，则单样本的损失函数为：
$$
E_k = \frac{1}{2} \sum_{j=1}^{l} (\hat{y}_j^k - y_j^k)^2
$$
由于采用随机梯度下降，所以每次随机选取一个误分类样本进行更新：
$$
\begin{align*}
w &\leftarrow w + \Delta w \\
\Delta w &= -\eta \nabla_w E
\end{align*}
$$
![](/blogs/machine-learning-3/5_MLP.png)

根据上图，假设隐层的阈值为 $\gamma_i$，输出层的阈值为 $\theta_i$。则损失函数梯度计算为：
$$
\begin{align*}
\frac{\partial E_k}{\partial v_{ih}} &= \sum_{j=1}^{l} \frac{\partial E_k}{\partial \hat{y}_j^k} \cdot \frac{\partial \hat{y}_j^k}{\partial \beta_j} \cdot \frac{\partial \beta_j}{\partial b_h} \cdot \frac{\partial b_h}{\partial \alpha_h} \cdot \frac{\partial \alpha_h}{\partial v_{ih}} \\
&= \sum_{j=1}^{l} (-g_j) \cdot w_{hj} \cdot f'(\alpha_h - \gamma_h) \cdot x_i \\
&= -b_h(1 - b_h) \cdot \sum_{j=1}^{l} g_j \cdot w_{hj} \cdot x_i \\
&= -e_h \cdot x_i
\end{align*}
$$
其中，
$$
\begin{align*}
g_j &= - \frac{\partial E_k}{\partial \hat{y}_j^k} \cdot \frac{\partial \hat{y}_j^k}{\partial \beta_j} \\
&= - (\hat{y}_j^k - y_j^k)\;f'(\beta_j - \theta_j) \\
&= (y_j^k - \hat{y}_j^k)\;f(\beta_j-\theta_j)\;(1 - f(\beta_j-\theta_j))\\
&= \hat{y}_j^k\;(1 - \hat{y}_j^k)\;(y_j^k - \hat{y}_j^k)
\end{align*}
$$
由于最后 $x_i$ 与下标 j 无关，所以可以将前面所有计算都打包为一个 “误差项”：$e_h=b_h(1 - b_h) \cdot \sum_{j=1}^{l} g_j \cdot w_{hj}$
