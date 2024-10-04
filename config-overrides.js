const {
  override,
  addBabelPlugin,
  addLessLoader,
} = require('customize-cra');

module.exports = override(
  // Add Ant Design to Babel plugins
  addBabelPlugin([
    'import',
    { libraryName: 'antd', libraryDirectory: 'es', style: true },
  ]),

  // Add LESS language support
  addLessLoader({
    // modifyVars: { '@primary-color': '#1DA57A' },
    javascriptEnabled: true, // Required by Ant Design but is a security problem
  }),
);
