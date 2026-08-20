假设目标函数为 $f(\mathbf{x})$，等式约束为 $g_i(\mathbf{x})=0$，则可以构造拉格朗日函数：
$$
L(\mathbf{x},\;\lambda)=f(\mathbf{x})+\sum^n_{i=1}\lambda_ig_i(\mathbf{x})
$$
其中 $\lambda=(\lambda_1,\;\cdots,\;\lambda_n)^\mathrm{T}$ 为拉格朗日乘子

使用拉格朗日函数分别对 $\mathbf{x}$ 和 $\lambda$ 求偏导并令其等于 0：对 $\mathbf{x}$ 求偏导可以计算 $f(\mathbf{x})$ 极值点；对 $\lambda$ 求偏导可以保证等式约束 $g_i(\mathbf{x})=0$ 成立

下面以单个等式约束 $g(\mathbf{x})=0$ 为例进行说明，拉格朗日函数为 $L=f(\mathbf{x})+\lambda g(\mathbf{x})$

L 对 $\lambda$ 求偏导：
$$
\frac{\partial L}{\partial\lambda}=g(\mathbf{x})=0
$$
可以保证等式约束成立

L 对 $\mathbf{x}$ 求偏导：
$$
\frac{\partial L}{\partial\mathbf{x}}=\nabla f(\mathbf{x})+\lambda\nabla g(\mathbf{x})=0
$$
> [!tip]
> 函数在 $\mathbf{x}$ 的梯度可以表示为 $\nabla f(\mathbf{x})$。选取某一方向，其方向向量为 $\mathbf{d}$，则函数 $f(\mathbf{x})$ 在该方向上的一阶变化率可以使用 $\nabla f(\mathbf{x})^\mathrm{T}\mathbf{d}$ 表示
> 
> ![](/blogs/machine-learning-1/extras/pic/3_nabla.png)

> [!tip]
> 函数梯度 $\nabla f(\mathbf{x})$ 可以表示函数于此处增长最快的方向
> 
> 假设于 $\mathbf{x}$ 处向 $\mathbf{d}$ 方向移动微小距离，则使用一阶泰勒展开可以得到：
> $$
> f(\mathbf{x} + \varepsilon \mathbf{d}) \approx f(\mathbf{x}) + \varepsilon \nabla f(\mathbf{x})^{\mathrm{T}} \mathbf{d}
> $$
> 即沿 $\mathbf{d}$ 方向移动的变化速率为 $\nabla f(\mathbf{x})\mathbf{d}=\left\|\nabla f(\mathbf{x})\right\|cos\theta$（设 $\left\|\mathbf{d}\right\|=1$）。可见，若 $\nabla f(\mathbf{x})$ 与 $\mathbf{d}$ 同方向即 $\theta=0$，此时可以达到最大值；若反向则为反向最大值

在没有等式约束的可导函数求极值时，我们可以通过计算函数梯度并令其为 0 以直接计算得到极值点。该方法的原理在于：
- 当 $\nabla f(\mathbf{x}_0)\ne 0$ 时，说明函数在当前点处存在变化趋势，总可以找到一个移动方向（设可用向量 $\mathbf{d}$ 表示）使得 $\nabla f(\mathbf{x})^\mathrm{T}\mathbf{d}<0$，即沿该方向移动能使函数值更小（反之可使函数值更大），所以并非极值点
- 当 $\nabla f(\mathbf{x})=0$ 时，说明函数在当前点处各个方向移动都无法变化函数值，此时称达到了极值点

在有等式约束的极值问题中，针对约束函数，在满足 $g(\mathbf{x})=0$ 的约束条件后，函数的移动方向 $\mathbf{d}$ 也存在约束（即不能让 $g(\mathbf{x})$ 在该方向上改变函数值，此时 $\mathbf{d}$ 正是等高线切线方向，让函数值沿等高线移动），有 $\nabla g(\mathbf{x})^\mathrm{T}\mathbf{d}=0$，可以理解为 $\nabla g(\mathbf{x})$ 和 $\mathbf{d}$ 两个向量垂直

由于存在移动方向限制，目标函数 $f(\mathbf{x})$ 只需要保证在允许的方向上变化率为 0 即可，也就是存在 $\nabla f(\mathbf{x})^\mathrm{T}\mathbf{d}=0$，即同样 $\nabla f(\mathbf{x})$ 和 $\mathbf{d}$ 垂直

根据以上分析可以得知：在 $\mathbf{x}$ 处目标函数和约束函数的梯度应当平行，也就是需要满足等式 $f(\mathbf{x})=\lambda g(\mathbf{x})$。很显然和 $\frac{\partial L}{\partial\mathbf{x}}$ 等价

