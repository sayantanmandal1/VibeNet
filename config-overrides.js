// config-overrides.js
module.exports = function override(config, env) {
    config.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
    };

    // Fix webpack dev server deprecation warnings
    if (env === 'development') {
        config.devServer = {
            ...config.devServer,
            setupMiddlewares: (middlewares, devServer) => {
                // Custom middleware setup can go here
                return middlewares;
            },
        };
        
        // Remove deprecated options if they exist
        if (config.devServer) {
            delete config.devServer.onBeforeSetupMiddleware;
            delete config.devServer.onAfterSetupMiddleware;
        }
    }

    return config;
};
