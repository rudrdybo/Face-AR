const path = require('path');

module.exports = {
  entry: {
    // 'dybo-image': './src/image-target/index.js',
    // 'dybo-image-aframe': './src/image-target/aframe.js',
    // 'dybo-image-three': './src/image-target/three.js',
    'dybo-face': './src/face-target/index.js',
    'dybo-face-aframe': './src/face-target/aframe.js',
    'dybo-face-three': './src/face-target/three.js',
    'dybo-face-three-controller':'./src/face-target/controller.js'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist-dev'),
    publicPath: ''
  },
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            inline: true,
            name: '[name].js'
          },
        },
      },
      {
	test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
	  'sass-loader'
        ]
      },
      {
	test: /\.html$/i,
        use: 'html-loader',
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
      crypto: false
    }
  }
};
