var path = require("path"),
  webpack = require("webpack"),
  cloneDeep = require("lodash.clonedeep"),
  ExtractTextPlugin = require("extract-text-webpack-plugin"),
  CopyWebpackPlugin = require("copy-webpack-plugin");

config = {
  devtool: "source-map",
  entry: {
    datamonkey: ["./src/entry.js"],
    vendor: [
      "tether",
      "jquery",
      "jquery-ui-bundle",
      "jquery-file-upload",
      "bootstrap",
      "moment",
      "phylotree",
      "react",
      "underscore"
    ]
  },
  output: {
    path: path.resolve(__dirname, "public/assets/js/"),
    filename: "[name].js"
  },
  externals: {
    jsdom: "window"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        loaders: "babel-loader",
        query: {
          presets: ["react", "stage-1"]
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: require.resolve("jquery"),
        use: [
          {
            loader: "expose-loader",
            query: "jQuery"
          },
          {
            loader: "expose-loader",
            query: "$"
          }
        ]
      },
      {
        test: require.resolve("d3"),
        use: [
          {
            loader: "expose-loader",
            query: "d3"
          }
        ]
      },
      {
        test: require.resolve("underscore"),
        use: [
          {
            loader: "expose-loader",
            query: "_"
          }
        ]
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader",
        options: { limit: 10000, mimetype: "application/font-woff" }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader",
        options: { limit: 10000, mimetype: "application/octet-stream" }
      },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loaders: "file-loader" },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loaders: "url-loader",
        options: { limit: 10000, mimetype: "image/svg+xml" }
      },
      {
        test: /\.jpg(\?v=\d+\.\d+\.\d+)?$/,
        loaders: "url-loader",
        options: { limit: 10000, mimetype: "image/jpg" }
      },
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {}
      },
      {
        test: /\.scss?$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        })
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({ debug: true }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js"
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      d3: "d3",
      io: "socket.io-client",
      crossfilter: "crossfilter",
      dc: "dc",
      datamonkey: "datamonkey",
      _: "underscore"
    }),
    new CopyWebpackPlugin(
      [
        // {output}/file.txt
        { from: "node_modules/hivtrace-viz/dist/hivtrace.js" }
      ],
      {
        // By default, we only copy modified files during
        // a watch or webpack-dev-server build. Setting this
        // to `true` copies all files.
        copyUnmodified: true
      }
    ),
    new CopyWebpackPlugin(
      [
        // {output}/file.txt
        {
          from: "node_modules/hivtrace-viz/dist/vendor.js",
          to: "hivtrace-vendor.js"
        }
      ],
      {
        // By default, we only copy modified files during
        // a watch or webpack-dev-server build. Setting this
        // to `true` copies all files.
        copyUnmodified: true
      }
    ),
    new webpack.IgnorePlugin(/jsdom$/),
    new ExtractTextPlugin("[name].css")
  ],
  resolve: {
    alias: {
      dc: __dirname + "/node_modules/dc/dc.min.js",
      "dc.css": __dirname + "/node_modules/dc/dc.min.css",
      "phylotree.css": __dirname + "/node_modules/phylotree/phylotree.css"
    },
    modules: ["src", "node_modules"],
    extensions: [".json", ".js", ".jsx", ".scss"]
  }
};

if (process.env.NODE_ENV === "production") {
  config.devtool = false;
  config.debug = false;
  config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = [config];
