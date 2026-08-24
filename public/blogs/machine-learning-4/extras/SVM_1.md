## 凸优化问题

对于一般的约束优化问题：
$$
\begin{align*}
\min \quad & f(\boldsymbol{x}) \\
\text{s.t.} \quad & g_i(\boldsymbol{x}) \le 0, \quad i = 1, 2, \ldots, m \\
& h_j(\boldsymbol{x}) = 0, \quad j = 1, 2, \ldots, n
\end{align*}
$$
 若要称该问题为一个 **凸优化问题**，则要求：
 - $f(x)$ 为凸函数
 - $g_i(x)$ 为凸函数
 - $h_j(x)$ 为线性函数

在支持向量机中，目标函数  $\frac{1}{2}\left\|\mathbf{w}\right\|^2$ 为凸函数，不等式约束同样为凸函数，故其为一个凸优化问题

## 拉格朗日对偶

$$
\begin{align*}
\min \quad & f(\boldsymbol{x}) \\
\text{s.t.} \quad & g_i(\boldsymbol{x}) \le 0, \quad i = 1, 2, \ldots, m \\
& h_j(\boldsymbol{x}) = 0, \quad j = 1, 2, \ldots, n
\end{align*}
$$
针对一般约束优化问题（不一定为凸优化问题），称该优化问题的定义域 D 为目标函数和各约束函数的定义域之交集，同时定义可行集 $\bar{D} = \{ \boldsymbol{x} \mid \boldsymbol{x} \in D, g_i(\boldsymbol{x}) \leqslant 0, h_j(\boldsymbol{x}) = 0 \}$，最优值 $p^*=\min \{ f(\tilde{x}) \}$（其中 $\tilde{x}$ 表示 x 在可行集中）

定义该问题的 *拉格朗日函数* 为：
$$
L(\boldsymbol{x}, \boldsymbol{\mu}, \boldsymbol{\lambda}) = f(\boldsymbol{x}) + \sum_{i=1}^{m} \mu_i g_i(\boldsymbol{x}) + \sum_{j=1}^{n} \lambda_j h_j(\boldsymbol{x})
$$
其中 $\boldsymbol{\mu} = (\mu_1, \mu_2, \ldots, \mu_m)^{\mathrm{T}}, \; \boldsymbol{\lambda} = (\lambda_1, \lambda_2, \ldots, \lambda_n)^{\mathrm{T}}$

进一步定义 **拉格朗日对偶函数** $\Gamma(\boldsymbol{\mu}, \boldsymbol{\lambda})$ 为 $L(\boldsymbol{x}, \boldsymbol{\mu}, \boldsymbol{\lambda})$ 关于 $\mathbf{x}$ 的下确界，即：
$$
\Gamma(\boldsymbol{\mu}, \boldsymbol{\lambda}) = \inf_{\boldsymbol{x} \in D} L(\boldsymbol{x}, \boldsymbol{\mu}, \boldsymbol{\lambda}) = \inf_{\boldsymbol{x} \in D} \left( f(\boldsymbol{x}) + \sum_{i=1}^{m} \mu_i g_i(\boldsymbol{x}) + \sum_{j=1}^{n} \lambda_j h_j(\boldsymbol{x}) \right)
$$
对偶函数 $\Gamma(\boldsymbol{\mu}, \boldsymbol{\lambda})$ 存在性质：
- 无论优化问题是否为凸优化问题，对偶函数恒为 **凹函数**
- 当 $\boldsymbol{\mu} \succeq 0$ 时（也就是每个分量都大于等于 0），$\Gamma(\boldsymbol{\mu}, \boldsymbol{\lambda})$ 构成上述优化问题最优值 $p^*$ 的下界，即 $\Gamma(\boldsymbol{\mu}, \boldsymbol{\lambda})\le p^*$

> [!note]
> 设 $\tilde{x}\in\tilde{D}$ 为优化问题的可行点，则当 $\boldsymbol{\mu}\succeq0$ 时存在（因为 $g_i(\tilde{x})\le0$ 且 $h_j(\tilde{x})=0$）：
> $$
> \sum_{i=1}^{n} \mu_i g_i(\tilde{x}) + \sum_{j=1}^{m} \lambda_j h_j(\tilde{x}) \leqslant 0
> $$
> 进一步有：
> $$
> \begin{align*}
> \Gamma(\boldsymbol{\mu}, \boldsymbol{\lambda}) &= \inf_{x \in D} L(\boldsymbol{x}, \boldsymbol{\mu}, \boldsymbol{\lambda}) \leqslant L(\tilde{x}, \boldsymbol{\mu}, \boldsymbol{\lambda}) \leqslant f(\tilde{x}) \\
> \Gamma(\boldsymbol{\mu}, \boldsymbol{\lambda}) &\leqslant \min\{ f(\tilde{x}) \} = p^{\ast}
> \end{align*}
> $$
> 证毕

定义满足 $\boldsymbol{\mu}\succeq0$ 约束条件求对偶函数最大值的优化问题为 **拉格朗日对偶问题**（原问题称为主问题），也就是：
$$
\begin{align*}
\max \quad & \Gamma(\boldsymbol{\mu}, \boldsymbol{\lambda}) \\
\text{s.t.} \quad & \boldsymbol{\mu} \succeq 0
\end{align*}
$$
设该优化问题的最优值为 $d^*$，根据前面的性质有 $d^*\le p^*$，此时称 **弱对偶性** 成立；若 $d^*=p^*$，则称 **强对偶性** 成立，此时可以通过解对偶问题完成对主问题的求解。需要注意：
- 当主问题满足某些充分条件时强对偶性成立。常见的有 *Slater 条件*：若主问题为凸优化问题，且可行集 $\tilde{D}$ 中存在一点能使所有不等式约束成立，则强对偶性成立
- 无论主问题是否为凸优化问题，对偶问题都为凸优化问题。对偶函数恒为凹函数，可改变符号变为凸函数；约束条件 $\boldsymbol{\mu}\succeq0$ 恒为凸集

设 $f(x),\;g_i(x),\;h_j(x)$ 一阶偏导连续，且 $\mathbf{x}^*,\;(\boldsymbol{\mu}^*,\;\boldsymbol{\lambda}^*)$ 分别为主问题和对偶问题的最优解。若强对偶性成立，则 $\mathbf{x}^*,\;\boldsymbol{\mu}^*,\;\boldsymbol{\lambda}^*$ 一定满足 **KKT 条件**：
$$
\begin{cases}
\nabla_{\boldsymbol{x}} L(\boldsymbol{x}^*, \boldsymbol{\mu}^*, \boldsymbol{\lambda}^*) = \nabla f(\boldsymbol{x}^*) + \sum_{i=1}^{m} \mu_i^* \nabla g_i(\boldsymbol{x}^*) + \sum_{j=1}^{n} \lambda_j^* \nabla h_j(\boldsymbol{x}^*) = 0 \\
h_j(\boldsymbol{x}^*) = 0 \\
g_i(\boldsymbol{x}^*) \leqslant 0 \\
\mu_i^* \geqslant 0 \\
\mu_i^* g_i(\boldsymbol{x}^*) = 0
\end{cases}
$$
