跟着 B 站上一门 [机器学习的课](https://www.bilibili.com/video/BV1puGv6TEjV/?spm_id_from=333.1007.top_right_bar_window_default_collection.content.click&vd_source=b4b6b348eb2ec24665e87125a8cf8851) 进行学习，参考教材为周志华教授的西瓜书以及配套的南瓜书

[其他笔记请点击](/blog/machine-learning-1/MLdir)

## 一元线性回归

### 最小二乘法

线性回归希望通过线性方式从特征中学习规律并预测结果。这里先从一元特征入手，其形式为：
$$
f(x)=wx+b \tag{1}
$$
一般通过均方误差最小化的方法计算上式的参数，即 **最小二乘法**。其损失函数为均方误差函数：
$$
\begin{align*}
E_{(w,\;b)}=\sum^m_{i=1}(y_i-f(x_i))^2\\
=\sum^m_{i=1}(y_i-wx_i-b)^2 \tag{2} 
\end{align*}
$$
我们的目标就是计算 $arg\min_{(w,\;b)}E_{(w,\;b)}$ 

> [!note] 极大似然估计
> 对应随机变量 X，设其概率质量函数为 $P(X;\;\theta)$（若为连续型变量则使用概率密度函数 $p(x;\;\theta)$），其中 $\theta$ 为待估计参数。若有多个样本，则联合概率可表示为：
> $$
> L(\theta)=\prod^n_{i=1}P(x_i;\;\theta)
> $$
> $L(\theta)$ 即为样本的 **似然函数**。极大似然估计就是为了计算使得 $L(\theta)$ 最大的参数分布 $\theta^*$
> 
> 为了方便计算极值，可以对似然函数取对数得到 **对数似然函数**，将连乘转为连加进行求导

> [!note] 中心极限定理
> **中心极限定理** 为：无论服从什么分布，大量相互独立的随机变量之和（或平均数）的分步总是近似服从正态分布

引入误差 $\epsilon$，可以将线性模型表示为：
$$
y=wx+b+\epsilon \tag{3}
$$
其中 $\epsilon$ 可以假设服从正态分布 $\epsilon\sim N(0,\;\sigma^2)$，因为 $\epsilon$ 由很多微小误差累计在一起，根据中心极限定理可以假设总误差 $\epsilon$ 服从正态分布。由此可以推导 y 的概率密度函数：
$$
\begin{align*}
\epsilon&=y-(wx+b)\\
p(\epsilon)&=\frac{1}{\sqrt{2\pi}\;\sigma}exp(-\frac{\epsilon^2}{2\sigma^2})\\
p(y)&=\frac{1}{\sqrt{2\pi}\;\sigma}exp(-\frac{(y-(wx+b))^2}{2\sigma^2})  \tag{4}
\end{align*}
$$
计算对数似然函数可以得到：
$$
\begin{align*}
ln\;L(w,\;b)&=\sum^m_{i=1}ln\frac{1}{\sqrt{2\pi}\;\sigma}exp(-\frac{(y_i-(wx_i+b))^2}{2\sigma^2})\\
&=m\;ln\frac{1}{\sqrt{2\pi}\;\sigma}-\frac{1}{2\sigma^2}\sum^m_{i=1}(y_i-wx_i-b)^2
\end{align*}
$$
可以发现，最大化对数似然函数 $ln\;L(w,\;b)$ 就相当于最小化 $\sum^m_{i=1}(y_i-wx_i-b)^2$ ，正是式 2 中提到的均方误差函数

### 凸函数求解

> [!note] 凸集
> 设集合 $D\subset\mathbb{R}^n$，若对任意 $x,\;y\in D$ 以及任意 $\alpha\in[0,\;1]$ 都存在
> $$
> \alpha x+(1-\alpha)y\in D
> $$
> 则称集合 D 为 **凸集**。其几何意义为：若两个点属于一凸集，则该两点连线上任意一点均属于该凸集

> [!note] 凸函数
> > [!tip]
> > 这里的定义为最优化中的凸函数，而非高等数学中的凸函数定义
> 
> 设 D 为非空凸集，f 为 D 上函数，若对任意 $x_1,\;x_2\in D,\;\alpha\in(0,\;1)$ 都有：
> $$
> f(\alpha x_1+(a-\alpha)x_2)\le\alpha f(x_1)+(1-\alpha)f(x_2)
> $$
> 则称 f 为 D 上的 **凸函数**。$f(x)=x^2$ 就是一个很典型的凸函数

> [!note] 多元函数求导
> 多元函数的一阶导数为 **梯度**：
> $$
> \nabla f(\mathbf{x}) =
> \begin{bmatrix}
> \frac{\partial f(x)}{\partial x_1} \\
> \frac{\partial f(x)}{\partial x_2} \\
> \vdots \\
> \frac{\partial f(x)}{\partial x_n}
> \end{bmatrix}
> $$
> 
> 多元函数的二阶导数为 **Hessian 矩阵**：
> $$
> \nabla^2 f(\boldsymbol{x}) = 
> \begin{bmatrix}
> \frac{\partial^2 f(\boldsymbol{x})}{\partial x_1^2} & \frac{\partial^2 f(\boldsymbol{x})}{\partial x_1 \partial x_2} & \cdots & \frac{\partial^2 f(\boldsymbol{x})}{\partial x_1 \partial x_n} \\
> \frac{\partial^2 f(\boldsymbol{x})}{\partial x_2 \partial x_1} & \frac{\partial^2 f(\boldsymbol{x})}{\partial x_2^2} & \cdots & \frac{\partial^2 f(\boldsymbol{x})}{\partial x_2 \partial x_n} \\
> \vdots & \vdots & \ddots & \vdots \\
> \frac{\partial^2 f(\boldsymbol{x})}{\partial x_n \partial x_1} & \frac{\partial^2 f(\boldsymbol{x})}{\partial x_n \partial x_2} & \cdots & \frac{\partial^2 f(\boldsymbol{x})}{\partial x_n^2}
> \end{bmatrix}
> $$

> [!note] 凸函数判定
> 设 $D\subset\mathbb{R}^n$ 为非空凸集，$f:\;D\subset\mathbb{R}^n\rightarrow\mathbb{R}$ 且 $f(x)$ 在 D 上二阶连续可微。若 $f(x)$ 的 Hessian 矩阵在 D 上位 *半正定* 的，则 $f(x)$ 为 D 上的凸函数

计算 $E_{(w,\;b)}$ 的 Hessian 矩阵：
$$
\begin{align*}
\frac{\partial E(w,\;b)}{\partial w}&=2(w\sum^m_{i=1}x_i^2-\sum^m_{i=1}(y_i-b)x_i)\\
\frac{\partial E(w,\;b)}{\partial b}&=2(mb-\sum^m_{i=1}(y_1-wx_i))\\
\nabla^2E_{(w,\;b)}&=
\begin{bmatrix}
2\sum^m_{i=1}x_i^2 & 2\sum^m_{i=1}x_i \\
2\sum^m_{i=1}x_i & 2m
\end{bmatrix}
\end{align*}
$$
> [!note] 半正定矩阵判定
> 一个半正定矩阵的判定定理为：若实对称矩阵的所有顺序主子式均非负，则该矩阵为半正定矩阵
> 
> **主子式**：从矩阵中选择编号相同的行和列得到子矩阵并求行列式。如 $3\times3$ 矩阵中同时选取 1、3 列和行构成一个 $2\times2$ 的主子式
> 
> **顺序主子式**：要求从矩阵左上角开始依次取前 1 列/行、前 2 列/行 …… 前 n 列/行 对应的行列式

可以发现一阶顺序主子式为 $|2\sum^m_{i=1}x_i^2|>0$，二阶顺序主子式为：
$$
\begin{vmatrix}
2\sum^m_{i=1}x_i^2 & 2\sum^m_{i=1}x_i \\
2\sum^m_{i=1}x_i & 2m
\end{vmatrix}
=4m\sum^m_{i=1}x_i^2-4(\sum^m_{i=1}x_i)^2
$$
注意到：
$$
\sum^m_{i=1}x_i\bar{x}=\bar{x}\cdot m\cdot\frac{1}{m}\cdot\sum^m_{i=1}x_i=m\bar{x}^2=\sum^m_{i=1}\bar{x}^2
$$
故有：
$$
\begin{align*}
4m\sum^m_{i=1}x_i^2-4(\sum^m_{i=1}x_i)^2 &= 4m\sum^m_{i=1}x_i^2-4\cdot m\cdot\frac{1}{m}\cdot(\sum^m_{i=1}x_i)^2 \\
&= 4m\sum^m_{i=1}(x_i^2-x_i\bar{x})\\
&= 4m\sum^m_{i=1}(x_i^2-x_i\bar{x}-x_i\bar{x}+x_i\bar{x})\\
&= 4m\sum^m_{i=1}(x_i^2-x_i\bar{x}-x_i\bar{x}+\bar{x}^2)\\
&= 4m\sum^m_{i=1}(x_i-\bar{x})^2 \le 0
\end{align*}
$$
故 $E_{(w,\;b)}$ 为凸函数

> [!note] 凸充分性定理
> 若 $f:\;\mathbb{R}^n\rightarrow\mathbb{R}$ 为凸函数，且 $f(x)$ 一阶连续可微，则 $x^*$ 为全局解（也就是最小值点）的充分必要条件为 $\nabla f(x^*)=0$

根据 $\frac{\partial E_{(w,\;b)}}{\partial b}=0$ 得到：
$$
b=\frac{1}{m}\sum^m_{i=1}(y_1-wx_i)=\bar{y}-w\bar{x} \tag{5}
$$
根据 $\frac{\partial E_{(w,\;b)}}{\partial w}=0$ 得到（中间带入式 5）：
$$
\begin{align*}
w \sum_{i=1}^{m} x_i^2 &= \sum_{i=1}^{m} y_i x_i - \sum_{i=1}^{m} b x_i \\
w \sum_{i=1}^{m} x_i^2 &= \sum_{i=1}^{m} y_i x_i - \sum_{i=1}^{m} (\bar{y}-w\bar{x}) x_i \\
w &= \frac{\sum_{i=1}^{m} y_i(x_i - \bar{x})}{\sum_{i=1}^{m} x_i^2 - \frac{1}{m} \left(\sum_{i=1}^{m} x_i\right)^2} \tag{6}
\end{align*}
$$
为了加速上述表达式在 python 中的计算，可以将式 6 进行向量化转化，从而利用 numpy 等库对矩阵运算的加速提高计算速度。具体来说：
$$
\begin{align*}
w &= \frac{\sum_{i=1}^{m} y_i(x_i - \bar{x})}{\sum_{i=1}^{m} x_i^2 - \frac{1}{m} \left(\sum_{i=1}^{m} x_i\right)^2} \\
&= \frac{\sum_{i=1}^{m} (y_ix_i - y_i\bar{x})}{\sum_{i=1}^{m} (x_i^2 - x_i\bar{x})} \\
&= \frac{\sum_{i=1}^{m} (y_ix_i - y_i\bar{x} - x_i\bar{y} + \bar{x}\bar{y})}{\sum_{i=1}^{m} (x_i^2 - x_i\bar{x} - x_i\bar{x} + \bar{x}^2)} \\
&= \frac{\sum_{i=1}^{m} (x_i-\bar{x}) (y_i-\bar{y})}{\sum_{i=1}^{m} (x_i - \bar{x})^2}
\end{align*}
$$
令 $\mathbf{x}=(x_1;\;\cdots;\;x_m),\;\mathbf{y}=(y_1;\;\cdots;\;y_m)$，则可以得到去均值后的向量 $\mathbf{x}_d=(x_1-\bar{x};\;\cdots;\;x_m-\bar{x}),\;\mathbf{y}_d=(y_1-\bar{y};\;\cdots;\;y_m-\bar{y})$，则可以得到：
$$
w=\frac{\mathbf{x}_d^T\mathbf{y}_d}{\mathbf{x}_d^T\mathbf{x}_d} \tag{7}
$$
> [!tip] 闭式解
> **闭式解** 指可以用有限次、明确的数学运算直接写出的解，而不是依赖迭代、搜索或数值逼近得到的解
> 
> 这里对于线性回归问题可以求得闭式解，但对一些更复杂的问题则只能求得数值解/迭代解

## 多元线性回归

若特征有多个维度，则为 **多元线性回归**，对应表达式为：
$$
f(\mathbf{x}_i)=\mathbf{w}^T\mathbf{x}_i+b \tag{8}
$$
考虑以下形式的简化表达：
$$
\begin{align*}
f(\boldsymbol{x}_i) &= \left( w_1 \quad w_2 \quad \cdots \quad w_d \right) \begin{pmatrix} x_{i1} \\ x_{i2} \\ \vdots \\ x_{id} \end{pmatrix} + b \\
&= w_1 x_{i1} + w_2 x_{i2} + \cdots + w_d x_{id} + b \cdot 1 \\
&= \begin{pmatrix} w_1 & w_2 & \cdots & w_d & w_{d+1} \end{pmatrix} \begin{pmatrix} x_{i1} \\ x_{i2} \\ \vdots \\ x_{id} \\ 1 \end{pmatrix} \\
&= \hat{\boldsymbol{w}}^{\mathrm{T}} \hat{\boldsymbol{x}}_i \tag{9}
\end{align*}
$$
由最小二乘法：
$$
E_{\hat{\mathbf{w}}}=\sum^m_{i=1}(y_i-\hat{\mathbf{w}}^T\hat{\mathbf{x}_i})^2
$$
向量化可以得到：
$$
E_{\hat{\mathbf{w}}}=(\mathbf{y}-\mathbf{X}\hat{\mathbf{w}})^T(\mathbf{y}-\mathbf{X}\hat{\mathbf{w}}) \tag{10}
$$
其中：$\mathbf{y}=(y_1;\;\cdots;\;y_m),\;X= \begin{pmatrix} \mathbf{x}^T_1 & 1 \\ \vdots & \vdots \\ \mathbf{x}^T_m & 1 \\ \end{pmatrix}$

下尝试证明该损失函数为凸函数，并利用凸函数性质求解 $\hat{\mathbf{w}}$。有：
$$
\frac{\partial E_{\hat{\boldsymbol{w}}}}{\partial \hat{\boldsymbol{w}}} = - \frac{\partial \boldsymbol{y}^{\mathrm{T}}\boldsymbol{X}\hat{\boldsymbol{w}}}{\partial \hat{\boldsymbol{w}}} - \frac{\partial \hat{\boldsymbol{w}}^{\mathrm{T}} \boldsymbol{X}^{\mathrm{T}}\boldsymbol{y}}{\partial \hat{\boldsymbol{w}}} + \frac{\partial \hat{\boldsymbol{w}}^{\mathrm{T}} \boldsymbol{X}^{\mathrm{T}}\boldsymbol{X}\hat{\boldsymbol{w}}}{\partial \hat{\boldsymbol{w}}}
$$
> [!note] 矩阵微分
> 标量对向量求导涉及 **矩阵微分** 方面知识，这里给出相关的维基百科：[矩阵微积分 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E7%9F%A9%E9%98%B5%E5%BE%AE%E7%A7%AF%E5%88%86)，其基本形式为：
> $$
> \frac{\partial f(\boldsymbol{x})}{\partial \boldsymbol{x}} = 
> \begin{bmatrix}
> \frac{\partial f(\boldsymbol{x})}{\partial x_1} \\
> \frac{\partial f(\boldsymbol{x})}{\partial x_2} \\
> \vdots \\
> \frac{\partial f(\boldsymbol{x})}{\partial x_n}
> \end{bmatrix}
> $$
> 
> 还有两个常用的矩阵微分公式：
> $$
> \begin{align*}
> \frac{\partial \boldsymbol{x}^{\mathrm{T}} \boldsymbol{a}}{\partial \boldsymbol{x}} &= \frac{\partial \boldsymbol{a}^{\mathrm{T}} \boldsymbol{x}}{\partial \boldsymbol{x}} = \boldsymbol{a} \\
> \frac{\partial \boldsymbol{x}^{\mathrm{T}} \boldsymbol{A} \boldsymbol{x}}{\partial \boldsymbol{x}} &= (\boldsymbol{A} + \boldsymbol{A}^{\mathrm{T}}) \boldsymbol{x}
> \end{align*}
> $$

可以计算得到：
$$
\begin{align*}
\frac{\partial E_{\hat{\boldsymbol{w}}}}{\partial \hat{\boldsymbol{w}}} &= 2\boldsymbol{X}^{\mathrm{T}} (\boldsymbol{X}\hat{\boldsymbol{w}} - \boldsymbol{y}) \\
\nabla^2E_{\hat{\mathbf{w}}}&=2\mathbf{X}^T\mathbf{X}
\end{align*}
$$
其中 $\mathbf{X}^T\mathbf{X}$ 为半正定矩阵，若 $\mathbf{X}$ 满秩则为正定矩阵。损失函数为凸函数

根据 $\nabla E_{\hat{\mathbf{w}}}=0$ 可以得到：
$$
\hat{\boldsymbol{w}}^* = (\boldsymbol{X}^{\mathrm{T}} \boldsymbol{X})^{-1} \boldsymbol{X}^{\mathrm{T}} \boldsymbol{y} \tag{11}
$$
## 对数几率回归

对于二分类任务，我们希望根据特征得到该样本属于正例或反例的概率 p。前面线性回归计算得到的结果属于实数集 R，所以可以在线性回归计算的基础上将结果映射到 $(0,\;1)$ 上作为分类概率。常用的映射函数就是 **对数几率函数**（一种 sigmoid 函数）：
$$
y=\frac{1}{1+e^{-z}} \tag{12}
$$
![](/blogs/machine-learning-1/3_sigmoid.png)

> [!tip] sigmoid 函数
> **sigmoid 函数** 并非这一种函数，而是 “像 S 形状” 的函数的代称。这类函数一般左侧趋于某下界、右侧趋于某上界、中间快速变化

带入前面的线性回归表示（公式 9），有（注意 $p(y=0)=1-p(y=1)$）：
$$
\begin{align*}
p(y = 1 | \hat{\boldsymbol{x}}; \boldsymbol{\beta}) &= \frac{e^{\boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}}}{1 + e^{\boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}}} = p_1(\hat{\boldsymbol{x}}; \boldsymbol{\beta}) \\
p(y = 0 | \hat{\boldsymbol{x}}; \boldsymbol{\beta}) &= \frac{1}{1 + e^{\boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}}} = p_0(\hat{\boldsymbol{x}}; \boldsymbol{\beta})
\end{align*}
$$
其中 $\mathbf{\beta}=\hat{\mathbf{w}}$

**极大似然估计推导损失函数**：

由于 y 只有 0 或 1 两种离散的取值，所以可以表示随机变量 y 的概率质量函数为：
$$
p(y|\hat{\boldsymbol{x}}; \boldsymbol{\beta}) = y \cdot p_1(\hat{\boldsymbol{x}}; \boldsymbol{\beta}) + (1 - y) \cdot p_0(\hat{\boldsymbol{x}}; \boldsymbol{\beta}) \qquad y\in\{0,\;1\} \tag{13}
$$
> [!tip]
> 这里也可以表示为第二种形式 $p(y|\hat{\boldsymbol{x}}; \boldsymbol{\beta}) = [p_1(\hat{\boldsymbol{x}}; \boldsymbol{\beta})]^y [p_0(\hat{\boldsymbol{x}}; \boldsymbol{\beta})]^{1-y}$，下面使用第一种形式进行推导

则对数似然函数可以表示为：
$$
\begin{align*}
L(\boldsymbol{\beta}) &= \prod_{i=1}^{m} p(y_i | \hat{\boldsymbol{x}}_i; \boldsymbol{\beta}) \\
\ell(\boldsymbol{\beta}) &= \ln L(\boldsymbol{\beta}) = 
\sum_{i=1}^{m} \ln \left( y_i p_1(\hat{\boldsymbol{x}}_i; \boldsymbol{\beta}) + (1 - y_i) p_0(\hat{\boldsymbol{x}}_i; \boldsymbol{\beta}) \right)
\end{align*}
$$
带入 $p_1$ 和 $p_0$ 可以化简得到：
$$
\ell(\boldsymbol{\beta}) = \sum_{i=1}^{m} \left[ \ln \left( y_i e^{\boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}_i} + 1 - y_i \right) - \ln \left( 1 + e^{\boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}_i} \right) \right]
$$
由于 y 只能离散的取 0 或 1，可以进一步化简得到：
$$
-\ell(\boldsymbol{\beta}) = \sum_{i=1}^{m} \left( -y_i \boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}_i + \ln\left(1 + e^{\boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}_i}\right) \right) \tag{14}
$$
目标是最大化似然函数，也就是最小化上面的 $-\ell(\beta)$ 函数

**信息论推导损失函数**：

> [!note] 自信息
> 定义随机变量的 **自信息** 为：
> $$
> I(X)=-\log_bp(x)
> $$
> 当 b 为 2 时，单位为 bit；b 为 e 时，单位为 nat

> [!note] 信息熵
> 定义 **信息熵** 为自信息的期望，即（离散型）：
> $$
> H(X)=E[I(X)]=-\sum_xp(x)\log_bp(x)
> $$
> 随机变量 X 越不确定，其信息熵越大
> 
> 

> [!note] 相对熵和交叉熵
> 可以使用 **相对熵（KL 散度）** 度量两个分布的差异。一个典型场景是度量理想分布 $p(x)$ 和模拟分布 $q(x)$ 之间的差异，其公式为：
> $$
> \begin{align*}
> D_{\mathrm{KL}}(p\|q) &= \sum_{x} p(x) \log_b \left( \frac{p(x)}{q(x)} \right) \\
> &= \sum_{x} p(x) \log_b p(x) - \sum_{x} p(x) \log_b q(x)
> \end{align*}
> $$
> 其中 $-\sum_{x} p(x) \log_b q(x)$ 为 **交叉熵**

在机器学习中，我们希望模拟分布能尽量接近理想分布，也就是相对熵能尽可能小。而理想分布是固定的，即 $p(x)\log_bp(x)$ 为定值，所以只需要最小化交叉熵 $-\sum_{x} p(x) \log_b q(x)$ 即可

使用前面的概率表达式替换 $q(x)$ 作为模拟分布，理想分布由于其确定性可以认为：
$$
p(y)=
\begin{cases}
y\quad&y=1 \\
1-y&y=0
\end{cases}
$$
同时令 b=e，可以得到：
$$
\sum_{i=1}^{m} \left( -y_i \boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}_i + \ln\left(1 + e^{\boldsymbol{\beta}^{\mathrm{T}} \hat{\boldsymbol{x}}_i}\right) \right)
$$
和公式 14 完全一致

由于引入了非线性函数，所以直接计算对数几率回归的闭式解比较困难，一般使用一些算法计算近似解

## 二分类线性判别分析

**线性判别分析 LDA** 的基本思想为：将样例投影到一条直线上，使得同类样例投影点尽可能靠近（也就是方差尽可能小）、异类样例投影点尽可能远离（也就是中心点距离尽可能大）。下图为二分类 LDA 问题示意图：

![](/blogs/machine-learning-1/3_FisherLDA.png)

定义：
- $X_0$ 表示类别 0 的样本点，$X_1$ 表示类别 1 的样例点
- $\mu_0$ 表示类别 0 的点的中心点，即 $\mu_0=\frac{1}{m}\sum^m_{i=1}x_i$；$\mu_1$ 同理
- $\Sigma_0=\sum_{x\in X_0}{(\mathbf{x}-\mathbf{\mu}_0)(\mathbf{x}-\mathbf{\mu}_0)^T}$，$\Sigma_1$ 同理

为了实现 LDA 的两个目标，分别定义两个目标函数：
$$
\max \left\| \boldsymbol{w}^{\mathrm{T}} \boldsymbol{\mu}_0 - \boldsymbol{w}^{\mathrm{T}} \boldsymbol{\mu}_1 \right\|_2^2
$$
用于使异类样本中心尽可能远；
$$
\begin{align*}
\min \boldsymbol{w}^{\mathrm{T}} \boldsymbol{\Sigma}_0 \boldsymbol{w} &= \boldsymbol{w}^{\mathrm{T}} \left( \sum_{\boldsymbol{x} \in X_0} (\boldsymbol{x} - \boldsymbol{\mu}_0)(\boldsymbol{x} - \boldsymbol{\mu}_0)^{\mathrm{T}} \right) \boldsymbol{w} \\
&= \sum_{\boldsymbol{x} \in X_0} (\boldsymbol{w}^{\mathrm{T}} \boldsymbol{x} - \boldsymbol{w}^{\mathrm{T}} \boldsymbol{\mu}_0)(\boldsymbol{x}^{\mathrm{T}} \boldsymbol{w} - \boldsymbol{\mu}_0^{\mathrm{T}} \boldsymbol{w})
\end{align*}
$$
用于使同类样本偏差方差尽可能小

关于同样本方差的目标函数的 [解释](/blog/machine-learning-1/linear_1)

为了同时兼顾两个目标，定义需要最大化的目标函数 J：
$$
\begin{align*}
J&=\frac{\left\| \boldsymbol{w}^{\mathrm{T}} \boldsymbol{\mu}_0 - \boldsymbol{w}^{\mathrm{T}} \boldsymbol{\mu}_1 \right\|_2^2}{\boldsymbol{w}^{\mathrm{T}} \boldsymbol{\Sigma}_0 \boldsymbol{w} + \boldsymbol{w}^{\mathrm{T}} \boldsymbol{\Sigma}_1 \boldsymbol{w}}\\
&= \frac{\boldsymbol{w}^{\mathrm{T}}(\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1)(\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1)^{\mathrm{T}}\boldsymbol{w}}{\boldsymbol{w}^{\mathrm{T}}(\boldsymbol{\Sigma}_0 + \boldsymbol{\Sigma}_1)\boldsymbol{w}}
\end{align*}
$$
定义 $\mathbf{S}_b=(\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1)(\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1)^{\mathrm{T}},\;\mathbf{S}_w=\boldsymbol{\Sigma}_0 + \boldsymbol{\Sigma}_1$，则目标函数为：
$$
J=\frac{\mathbf{w}^\mathrm{T}\mathbf{S}_b\mathbf{w}}{\mathbf{w}^\mathrm{T}\mathbf{S}_w\mathbf{w}}
$$
固定分母 $\mathbf{w}^\mathrm{T}\mathbf{S}_w\mathbf{w}$ 为 1，最小化分子相反数 $-\mathbf{w}^\mathrm{T}\mathbf{S}_b\mathbf{w}$ 即可。此时就转化为有等式约束条件的优化问题，可以使用 [拉格朗日乘子法](/blog/machine-learning-1/linear_2) 解决

约束函数为 $\mathbf{w}^\mathrm{T}\mathbf{S}_w\mathbf{w}-1$，拉格朗日函数为：
$$
L(\boldsymbol{w}, \lambda) = -\boldsymbol{w}^{\mathrm{T}} \boldsymbol{S}_b \boldsymbol{w} + \lambda \left( \boldsymbol{w}^{\mathrm{T}} \boldsymbol{S}_w \boldsymbol{w} - 1 \right)
$$
计算偏导可以得到：
$$
\frac{\partial L(\boldsymbol{w}, \lambda)}{\partial \boldsymbol{w}}= -(\boldsymbol{S}_b + \boldsymbol{S}_b^{\mathrm{T}})\boldsymbol{w} + \lambda (\boldsymbol{S}_w + \boldsymbol{S}_w^{\mathrm{T}})\boldsymbol{w}
$$
由于 $\mathbf{S}_b$ 和 $\mathbf{S}_w$ 都是对称矩阵，所以有：
$$
\frac{\partial L(\boldsymbol{w}, \lambda)}{\partial \boldsymbol{w}}= -2\boldsymbol{S}_b\boldsymbol{w} + 2\lambda \boldsymbol{S}_w\boldsymbol{w}
$$
令偏导为 0，可以得到：
$$
\boldsymbol{S}_b\boldsymbol{w} = \lambda \boldsymbol{S}_w\boldsymbol{w}
$$
> [!note] 广义特征值
> 设 $A,\;B$ 为 n 阶方阵，若存在 $\lambda$ 使 $A\mathbf{x}=\lambda B\mathbf{x}$ 存在非零解，则称 $\lambda$ 为 A 相对于 B 的 **广义特征值**，$\mathbf{x}$ 为 A 相对于 B 的属于 $\lambda$ 的特征向量
> 
> 当 $B=I$ 时，广义特征值问题退化为标准特征值问题。上面提到的 $\boldsymbol{S}_b\boldsymbol{w} = \lambda \boldsymbol{S}_w\boldsymbol{w}$ 就是一个广义特征值问题

> [!note] 广义瑞利商
> 设 $A,\;B$ 为 n 阶厄密矩阵（即厄密转置等于自身的矩阵），且 B 为正定矩阵，则称 $R(\mathbf{x})=\frac{\mathbf{x}^\mathrm{H}A\mathbf{x}}{\mathbf{x}^\mathrm{H}B\mathbf{x}}\quad(\mathbf{x}\ne0)$（H 即表示厄密转置）为 A 相对于 B 的 **广义瑞利商**
> 
> 当 $B=I$ 时，广义瑞利商退化为瑞利商问题
> 
> 设 $\lambda_i,\;\mathbf{x}_i$ 为 A 相对于 B 的广义特征值和特征向量，且 $\lambda_1\le\cdots\le\lambda_n$，则存在：
> $$
> \begin{align*}
> \min_{x \neq 0} R(x) &= \frac{x^{\mathrm{H}} A x}{x^{\mathrm{H}} B x} = \lambda_1, \quad x^* = x_1 \\
> \max_{x \neq 0} R(x) &= \frac{x^{\mathrm{H}} A x}{x^{\mathrm{H}} B x} = \lambda_n, \quad x^* = x_n
> \end{align*}
> $$
> 
> 当固定广义瑞利商分母 $\mathbf{x}^\mathrm{H}B\mathbf{x}=1$ 时，使用拉格朗日乘子法可以得到类似 $A\mathbf{x}=\lambda B\mathbf{x}$ 的广义特征值问题，所有满足等式的解分别对应每组广义特征值和特征向量

将 $\mathbf{S}_b$ 展开得到：
$$
(\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1)(\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1)^{\mathrm{T}} \boldsymbol{w} = \lambda \boldsymbol{S}_w \boldsymbol{w}
$$
令 $(\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1)^{\mathrm{T}} \boldsymbol{w}=\gamma$，则有（假设 $\mathbf{S}_w$ 有逆）;
$$
\boldsymbol{w} = \frac{\gamma}{\lambda} \boldsymbol{S}_w^{-1} (\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1)
$$
由于这里我们仅关心 $\mathbf{w}$ 的方向而不关心大小，所以可以忽略前面的系数（若 $\gamma\ne0$），得到：
$$
\boldsymbol{w} = \boldsymbol{S}_w^{-1} (\boldsymbol{\mu}_0 - \boldsymbol{\mu}_1) \tag{15}
$$
实际上对于二分类 LDA 问题，这里的 $\mathbf{w}$ 只有两组解：分别对应 $\gamma=0$ 以及 $\gamma\ne0$ 的情况

> [!tip]
> 除了计算最后的解以分析解的数量，还可以通过矩阵的秩直接推理
> 
> 对于 $\mathbf{S}_b\mathbf{w}=\lambda\mathbf{S}_w\mathbf{w}$ 问题，若 $\mathbf{S}_w$ 有逆，则可以改写为 $\mathbf{S}_w^{-1}\mathbf{S}_b\mathbf{w}=\lambda\mathbf{w}$。由于 $\mathbf{S}_b=(\boldsymbol{\mu}_0-\boldsymbol{\mu}_1)(\boldsymbol{\mu}_0-\boldsymbol{\mu}_1)^\mathrm{T}$ 的秩为 1（也就是只有 $\boldsymbol{\mu}_0-\boldsymbol{\mu}_1$ 这一个有效行向量），所以 $rank(\mathbf{S}_w^{-1}\mathbf{S}_b)=1$，解得的非零特征值最多只有一个

根据前面的分析，最终 $\lambda$ 的情况为 $\lambda_1>0,\;\lambda_2=\cdots=\lambda_n=0$。根据广义瑞利商性质，$J=\frac{\mathbf{w}^\mathrm{T}\mathbf{S}_b\mathbf{w}}{\mathbf{w}^\mathrm{T}\mathbf{S}_w\mathbf{w}}$ 的取值范围为 $0\le J\le\lambda_1$，且当 $\mathbf{w}$ 为 $\lambda_1$ 对应的特征向量时取得我们需要的最大值

