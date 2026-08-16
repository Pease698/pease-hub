可以使用 $\mathbf{w}^T\Sigma\mathbf{w}$（其中 $\Sigma=\sum_{x\in X}{(\mathbf{x}-\mu)(\mathbf{x}-\mu)^T}$）表示同类样本投影后的偏差方差，相关推导如下：

假设 $\mathbf{x}$ 表示样本，$\mu$ 表示该类样本的中心。则高维向量样本和中心投影到一维后的结果分别可以表示为：
$$
z=\mathbf{w}^T\mathbf{x}\quad \mu_z=\mathbf{w}^T\mu
$$
则经过投影后，样本相较于中心的偏差可以表示为：
$$
z-\mu_z=\mathbf{w}^T(\mathbf{x}-\mu)
$$
则偏差的方差可以表示为（$E[z-\mu_z]=0$）：
$$
\begin{align*}
Var(z)&=E[(z-\mu_z)^2]\\
&=E[(\mathbf{w}^T(\mathbf{x}-\mu))^2]
\end{align*}
$$
将上述表达式的平方展开，同时将常量移出仅关注样本：
$$
Var(z)=\mathbf{w}E[(\mathbf{x}-\mu)(\mathbf{x}-\mu)^T]\mathbf{w}
$$
对于这里的期望部分 $E=\frac{1}{m}\sum_m{(\mathbf{x}-\mu)(\mathbf{x}-\mu)^T}$，忽略前面的系数，就可以得到我们的目标函数了：
$$
\mathbf{w}^T\Sigma\mathbf{w}=\mathbf{w}^T\sum_{x\in X}{(\mathbf{x}-\mu)(\mathbf{x}-\mu)^T}\mathbf{w}
$$
