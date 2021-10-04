var path = require("path"),
  webpack = require("webpack"),
  cloneDeep = require("lodash.clonedeep"),
  CopyWebpackPlugin = require("copy-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PreloadWebpackPlugin = require("preload-webpack-plugin");

config = {
  devtool: "source-map",
  mode: "production",
  entry: {
    datamonkey: ["./src/entry.js"],
  },
  output: {
    path: path.resolve(__dirname, "public/assets/js/"),
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
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
          "style-loader",
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
        loaders: "babel-loader",
        query: {
          presets: ["@babel/preset-env"],
        },
      },
      {
        test: require.resolve("jquery"),
        use: [
          {
            loader: "expose-loader",
            query: "jQuery",
          },
          {
            loader: "expose-loader",
            query: "$",
          },
        ],
      },
      {
        test: require.resolve("d3"),
        use: [
          {
            loader: "expose-loader",
            query: "d3",
          },
        ],
      },
      {
        test: require.resolve("underscore"),
        use: [
          {
            loader: "expose-loader",
            query: "_",
          },
        ],
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader",
        options: { limit: 10000, mimetype: "application/font-woff" },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader",
        options: { limit: 10000, mimetype: "application/octet-stream" },
      },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loaders: "file-loader" },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loaders: "url-loader",
        options: { limit: 10000, mimetype: "image/svg+xml" },
      },
      {
        test: /\.jpg(\?v=\d+\.\d+\.\d+)?$/,
        loaders: "url-loader",
        options: { limit: 10000, mimetype: "image/jpg" },
      },
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {},
      },
    ],
  },
  plugins: [
    //new PreloadWebpackPlugin(),
    new webpack.LoaderOptionsPlugin({ debug: true }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      path: path.resolve(__dirname, "public/assets/css/"),
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new webpack.ProvidePlugin({
      "window.$": "jquery",
      $: "jquery",
      jQuery: "jquery",
      d3: "d3",
      io: "socket.io-client",
      crossfilter: "crossfilter",
      dc: "dc",
      datamonkey: "datamonkey",
      _: "underscore",
    }),
    new CopyWebpackPlugin(
      [
        // {output}/file.txt
        { from: "node_modules/hivtrace-viz/dist/hivtrace.js" },
      ],
      {
        // By default, we only copy modified files during
        // a watch or webpack-dev-server build. Setting this
        // to `true` copies all files.
        copyUnmodified: true,
      }
    ),
    new CopyWebpackPlugin(
      [
        // {output}/file.txt
        {
          from: "node_modules/hivtrace-viz/dist/vendor.js",
          to: "hivtrace-vendor.js",
        },
      ],
      {
        // By default, we only copy modified files during
        // a watch or webpack-dev-server build. Setting this
        // to `true` copies all files.
        copyUnmodified: true,
      }
    ),
    new webpack.IgnorePlugin(/jsdom$/),
  ],
  resolve: {
    alias: {
      dc: __dirname + "/node_modules/dc/dc.min.js",
      "dc.css": __dirname + "/node_modules/dc/dc.min.css",
      "phylotree.css": __dirname + "/node_modules/phylotree/phylotree.css",
    },
    modules: ["src", "node_modules"],
    extensions: [".json", ".js", ".jsx", ".scss"],
  },
};

if (process.env.NODE_ENV === "production") {
  config.devtool = false;
  config.debug = false;
  config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = [config];
