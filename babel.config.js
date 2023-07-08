module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            crypto: "expo-crypto",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
