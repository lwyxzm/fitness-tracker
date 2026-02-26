const { getDefaultConfig } = require('expo/metro-config');

// 获取默认配置
const config = getDefaultConfig(__dirname);

// 限制 watchFolders 只在当前项目
config.watchFolders = [__dirname];

module.exports = config;
