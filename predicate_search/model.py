import pymc3 as pm
import scipy.stats as st
import numpy as np

class RobustNormal:

    def __init__(self, nu=5):
        self.nu = nu

    def fit(self, X):
        with pm.Model() as model:
            packed_L = pm.LKJCholeskyCov('packed_L', n=X.shape[1], eta=2., sd_dist=pm.HalfCauchy.dist(2.5))
            L = pm.expand_packed_triangular(X.shape[1], packed_L)
            cov = pm.Deterministic('cov', L.dot(L.T))
            mean = pm.Normal('mean', mu=0, sigma=10, shape=X.shape[1])
            obs = pm.MvStudentT('obs', nu=self.nu, mu=mean, chol=L, observed=X)
        self.params = pm.find_MAP(model=model)
        self.mean = self.params['mean']
        self.cov = self.params['cov']

    def score(self, X, dims=None):
        if dims is None:
            return st.multivariate_normal(self.mean, self.cov).logpdf(X)
        else:
            cov = self.cov[:, dims][dims]
            mean = self.mean[dims]
            return st.multivariate_normal(mean, cov).logpdf(X[dims])

def det_dot(a, b):
    return (a * b[None, :]).sum(axis=-1)

class NormalModel:

    def fit(self, X, y):
        self.X = X
        self.y = y
        model = self.model()
        self.params = pm.find_MAP(model=model)
        self.forward_params = {k: v for k, v in self.params.items() if k != 'sigma' and 'log__' not in k}
        self.sigma = self.params['sigma']

    def predict(self, X):
        predy = self.forward(X, **self.forward_params)
        return predy

    def score(self, X, y):
        predy = self.predict(X)

        return st.norm(predy, self.sigma).logpdf(y)[0]

class Linear(NormalModel):

    def __init__(self, noise='normal', nu=5, alpha=10, beta=10):
        self.noise = noise
        self.nu = nu
        self.alpha = alpha
        self.beta = beta

    def model(self):
        with pm.Model() as model:
            bias = pm.Normal('bias', mu=0, sigma=self.alpha)
            weights = pm.Normal('weights', mu=0, sigma=self.beta, shape=self.X.shape[1])
            predy = self.forward(self.X, bias, weights)

            sigma = pm.HalfCauchy('sigma', 10, testval=.1)
            if self.noise == 'normal':
                obs = pm.Normal('obs', mu=predy, sigma=sigma, observed=self.y)
            elif self.noise == 'robust':
                obs = pm.StudentT('obs', nu=self.nu, mu=predy, sigma=sigma, observed=self.y)
        return model

    def forward(self, X, bias, weights):
        return det_dot(weights, X) + bias