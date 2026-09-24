module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/instamortgage-buyer'),
      subdir: '.',
      reporters: [
        ...(process.env['CI']
          ? [{ type: 'lcovonly', subdir: '.', file: 'lcov.info' }]
          : [{ type: 'html' }, { type: 'lcov', subdir: '.', file: 'lcov.info' }]),
        { type: 'text-summary' },
      ],
      fixWebpackSourcePaths: true,
      normalizePath: true,
      includeAllSources: true,
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: Number(process.env['KARMA_PORT'] ?? 9876),
    colors: true,
    captureTimeout: 120000,
    browserDisconnectTimeout: 30000,
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 120000,
    logLevel: config.LOG_INFO,
    autoWatch: !process.env.CI,
    singleRun: !!process.env.CI,
    restartOnFileChange: !process.env.CI,
    browsers: process.env.CI ? ['ChromeHeadlessCI'] : ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--remote-debugging-port=9222',
        ],
      },
    },
  });
};
