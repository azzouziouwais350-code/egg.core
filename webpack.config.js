const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Le mode vient de la ligne de commande : `webpack --mode production` (npm run build)
// ou `webpack serve` (npm run dev, développement par défaut).
module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'bundle.js',
      clean: true, // public/ est entièrement reconstruit à chaque build
    },
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.(png|jpe?g|gif|svg|woff2?)$/i, type: 'asset/resource' },
      ],
    },
    plugins: [
      // Le modèle est dans src/ : le plugin injecte le script une seule fois et écrit
      // public/index.html, que charge Electron.
      new HtmlWebpackPlugin({ template: './src/template.html', scriptLoading: 'defer' }),
      // Icônes et manifeste copiés tels quels dans public/ (qui est vidé à chaque build)
      new CopyWebpackPlugin({
        patterns: [
          { from: 'icons', to: 'icons' },
          { from: 'src/manifest.webmanifest', to: 'manifest.webmanifest' },
        ],
      }),
    ],
    mode: isProd ? 'production' : 'development',
    // Développement : source maps rapides et fidèles au code d'origine.
    // Production : aucune source map embarquée dans l'application distribuée.
    devtool: isProd ? false : 'eval-cheap-module-source-map',
    devServer: {
      static: { directory: path.join(__dirname, 'public') },
      hot: true,
      host: '0.0.0.0',      // GitHub Codespaces : le port doit écouter hors localhost
      port: 3000,
      allowedHosts: 'all',  // l'URL de Codespaces n'est pas "localhost"
      client: { overlay: { errors: true, warnings: false } },
    },
    performance: { hints: false },
  };
};
