module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Naša jednoúčelová funkcia (kozmetička)
      function() {
        return {
          visitor: {
            MemberExpression(path) {
              if (path.matchesPattern("import.meta")) {
                path.replaceWithSourceString("undefined");
              }
            }
          }
        };
      }
    ],
  };
};