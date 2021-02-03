const fs = require('fs');
const path = require('path');
const withCss = require('@zeit/next-css');
const withLess = require('next-antd-aza-less');
const lessToJS = require('less-vars-to-js');

// antd custom theme
const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, './styles/antd.theme.less'), 'utf8')
);

module.exports = withCss(
  withLess({
    cssModules: true,
    lessLoaderOptions: {
      javascriptEnabled: true,
      modifyVars: themeVariables, // make your antd custom effective
    },
    webpack: (config, { isServer }) => {
      if (isServer) {
        const antStyles = /antd\/.*?\/style.*?/;
        const origExternals = [...config.externals];
        config.externals = [
          (context, request, callback) => {
            if (request.match(antStyles)) return callback();
            if (typeof origExternals[0] === 'function') {
              origExternals[0](context, request, callback);
            } else {
              callback();
            }
          },
          ...(typeof origExternals[0] === 'function' ? [] : origExternals),
        ];

        config.module.rules.unshift({
          test: antStyles,
          use: 'null-loader',
        });
      }
      return config;
    },
  })
);
