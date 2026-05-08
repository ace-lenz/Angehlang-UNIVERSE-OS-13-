// Plan Item ID: TI-1
import webpack from 'webpack';
import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { EsbuildPlugin } from 'esbuild-loader';
import CompressionPlugin from 'compression-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force esbuild to detect platform correctly
process.env.ESBUILD_BINARY_PATH = process.platform === 'win32' 
  ? 'node_modules/esbuild/bin/esbuild.exe' 
  : 'node_modules/esbuild/bin/esbuild';

export default (env, argv) => {
  const isProduction = argv.mode === 'production';
  const analyze = env.analyze === 'true';

  return {
    entry: './src/main.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: true,
      publicPath: '/',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      fallback: {
        "fs": false,
        "path": false,
        "crypto": false
      }
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx',
            target: 'es2022',
          },
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack', 'svgo-loader'],
        },
      ],
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new EsbuildPlugin({
          target: 'es2022',
          css: true,
          // Exclude already minified files and the corrupted libs directory
          exclude: [/libs[\\/]/, /\.min\.js$/],
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react.vendor',
            priority: 40,
          },
          threeVendor: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three.vendor',
            priority: 30,
          },
          commonVendor: {
            test: /[\\/]node_modules[\\/](clsx|uuid|tone|lucide-react)[\\/]/,
            name: 'common.vendor',
            priority: 20,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
          spatial: {
            test: /[\\/]src[\\/](storage|components[\\/]explorer)[\\/]/,
            name: 'spatial',
            priority: 15,
          },
          spectral: {
            test: /[\\/]src[\\/](agents|engine[\\/]PhotonicLogicArray)[\\/]/,
            name: 'spectral',
            priority: 10,
          },
          quantum: {
            test: /[\\/]src[\\/](memory|engine[\\/]QuantumBuilder)[\\/]/,
            name: 'quantum',
            priority: 5,
          },
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: isProduction ? './public/index-prod.html' : './index.html',
        filename: 'index.html',
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
        } : false,
        inject: 'body',
        scriptLoading: 'defer',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public', to: '', globOptions: { ignore: ['**/sw.js', '**/index-prod.html'] } },
          { from: 'public/sw.js', to: 'sw.js' },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env.PRODUCTION_LATTICE': JSON.stringify(isProduction),
        'process.env.SOVEREIGN_MODE': JSON.stringify('TRILLION-X'),
        'process.env.PHOTONIC_CORE_ACTIVE': JSON.stringify(true),
        'process.env.ZERO_HALLUCINATION_GATE': JSON.stringify(true),
      }),
      ...(isProduction ? [new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|svg|html)$/,
        compressionOptions: { level: 11 },
        threshold: 10240,
        minRatio: 0.8,
      })] : []),
      ...(analyze ? [new BundleAnalyzerPlugin()] : []),
    ],
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'public'),
        },
        {
          directory: path.join(__dirname, 'src'),
          publicPath: '/src',
        }
      ],
      compress: true,
      port: 3001,
      historyApiFallback: true,
      hot: true,
    },
    cache: {
      type: 'filesystem',
    },
    ignoreWarnings: [
      {
        module: /node_modules[\\/]typescript[\\/]lib[\\/]typescript\.js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ],
    performance: {
      hints: 'warning',
      maxAssetSize: 10 * 1024 * 1024, // 10MB
      maxEntrypointSize: 10 * 1024 * 1024, // 10MB
    },
    devtool: isProduction ? 'hidden-source-map' : 'eval-cheap-module-source-map',
  };
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
