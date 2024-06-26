const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool: "eval-source-map",
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader" },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  devServer: {
    compress: true,
    historyApiFallback: true,
    port: 9000,
  },
};
