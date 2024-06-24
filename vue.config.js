const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "@/share/assets/css";`,
      },
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      }),
    ],
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "ServiceDesk";
      return args;
    });
  },
  pwa: {
    workboxOptions: {
      skipWaiting: true,
    },
  },
  devServer: {
    allowedHosts: ["uitest.anocct.ru", "testui.anocct.ru", "fulljs.ru", "www.fulljs.ru"],
    client: {
      webSocketURL: {
        hostname: "0.0.0.0",
        pathname: "/ws",
        port: 443,
        protocol: "wss",
      },
    },
  },
});
