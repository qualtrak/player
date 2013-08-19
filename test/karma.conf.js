// Karma configuration
// Generated on Sun Aug 18 2013 19:49:07 GMT+0100 (GMT Daylight Time)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: "",

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      '../libs/jquery/*.js',
      '../libs/angular/*.js',
      '../libs/kendoui/kendo.all.min.js',
      '../libs/bootstrap/*.js',
      '../app/js/player.js',
      //'../app/templates/directives/player.html',
      'lib/angular/*.js',
      'lib/sinon/*.js',
      'spec/*[Ss]pec.js'
    ],

    /*preprocessors: {
      '../app/templates/directives/player.html': 'html2js'
    },*/

    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};