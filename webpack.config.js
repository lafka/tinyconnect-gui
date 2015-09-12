var
  webpack = require('webpack'),
  ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
    entry: [
      'webpack/hot/only-dev-server',
      "./lib/app.jsx"
    ],

    output: {
        path: __dirname + '/dist',
        filename: "dist/bundle.js"
    },

    module: {
        loaders: [
            {test: /\.jsx?$/,                   loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
            {test: /\.js$/,                     loader:  'babel-loader', exclude: /node_modules/ },
            {test: /\.css$/,                    loader:  ExtractTextPlugin.extract('style', 'css-loader') },
            {test: /\.s[ca]ss$/,                loader:  ExtractTextPlugin.extract('style', 'css-loader!sass-loader') },
            {test: /\.(woff|woff2)$/,           loader:  'url-loader?limit=100000' },
            {test: /\.(ttf|eot)$/,              loader:  'file-loader' },
            {test: /\.(png|jpg|jpeg|gif|svg)$/, loader:  'url-loader?limit=10000' }
        ]
    },

    plugins: [
      new webpack.NoErrorsPlugin(),
      new ExtractTextPlugin("dist/bundle.css")
    ]

};
