import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'TD SDK',
  description: 'TD 聚合 SDK 对接文档 · Android / iOS',
  lang: 'zh-CN',
  srcDir: '../TD_SDK_对接文档',
  srcExclude: ['README.md'],
  cleanUrls: true,
  ignoreDeadLinks: [
    /TD_SDK_一期二期/,
    /project\/demo/,
  ],
  lastUpdated: true,
  themeConfig: {
    siteTitle: 'TD SDK',
    logo: undefined,
    nav: [
      { text: '开始', link: '/' },
      { text: 'Android', link: '/02_Android集成' },
      { text: 'iOS', link: '/03_iOS集成' },
      { text: '广告格式', link: '/05_激励视频' },
      { text: 'FAQ', link: '/13_FAQ' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '概述', link: '/' },
          { text: '后台配置', link: '/01_后台配置' },
        ],
      },
      {
        text: '集成 SDK',
        items: [
          { text: 'Android 集成', link: '/02_Android集成' },
          { text: 'iOS 集成', link: '/03_iOS集成' },
          { text: '初始化与隐私', link: '/04_初始化与隐私' },
        ],
      },
      {
        text: '广告格式',
        items: [
          { text: '激励视频', link: '/05_激励视频' },
          { text: '插屏广告', link: '/06_插屏广告' },
          { text: '开屏广告', link: '/07_开屏广告' },
          { text: '横幅广告', link: '/08_横幅广告' },
          { text: '原生广告', link: '/09_原生广告' },
        ],
      },
      {
        text: '参考',
        items: [
          { text: '自定义参数与尺寸', link: '/10_自定义参数与尺寸' },
          { text: '回调与错误码', link: '/11_回调与错误码' },
          { text: '测试验收', link: '/12_测试验收' },
          { text: 'FAQ', link: '/13_FAQ' },
          { text: '隐私合规', link: '/隐私合规' },
        ],
      },
    ],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '外观',
    lastUpdated: { text: '更新于' },
  },
  head: [
    ['meta', { name: 'theme-color', content: '#2563eb' }],
  ],
})
