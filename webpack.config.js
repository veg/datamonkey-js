const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    datamonkey: ["./src/entry.js"],
  },
  output: {
    path: path.resolve(__dirname, "public/assets/js/"),
    filename: "[name].js",
    clean: false, // Cleans output directory before building
  },
  devtool: process.env.NODE_ENV === "production" ? false : "source-map",
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: "vendors~datamonkey",
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
        },
      },
    },
  },
  externals: {
    jsdom: "window",
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: { implementation: require("sass") },
          },
        ],
      },
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg|jpg|gif)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/[hash][ext][query]",
        },
      },
      {
        test: require.resolve("jquery"),
        use: [
          {
            loader: "expose-loader",
            options: { exposes: ["$", "jQuery"] },
          },
        ],
      },
      {
        test: require.resolve("underscore"),
        use: [
          {
            loader: "expose-loader",
            options: { exposes: ["_"] },
          },
        ],
      },
      {
        enforce: "pre",
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {},
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "../css/[name].css",
      chunkFilename: "../css/[id].css",
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      $: "jquery",
      jQuery: "jquery",
      d3: "d3",
      _: "underscore",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "node_modules/hivtrace-viz/dist/hivtrace.js" },
        { from: "node_modules/hivtrace-viz/dist/vendor.js", to: "hivtrace-vendor.js" },
      ],
    }),
  ],
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      process: require.resolve("process"),
    },
    alias: {
      dc: path.resolve(__dirname, "node_modules/dc/dc.min.js"),
      "dc.css": path.resolve(__dirname, "node_modules/dc/dc.min.css"),
      "phylotree.css": path.resolve(__dirname, "node_modules/phylotree/phylotree.css"),
    },
    extensions: [".json", ".js", ".jsx", ".scss"],
  },
};

if (process.env.NODE_ENV === "production") {
  config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
}

module.exports = config;
