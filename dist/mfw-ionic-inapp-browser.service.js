(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @module mfw-ionic.inapp-browser
   * @name mfw-ionic.inapp-browser
   *
   * @requires ionic
   * @requires ngCordova
   *
   * @description
   * # Description
   *
   * This module provides an abstraction of ngCordova's {@link http://ngcordova.com/docs/plugins/inAppBrowser/ `$cordovaInAppBrowser` plugin}.
   *
   * # Plugins
   *
   * This module requires the following Cordova plugins:
   *
   * * {@link https://github.com/apache/cordova-plugin-inappbrowser cordova-plugin-inappbrowser}
   * * {@link https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller cordova-plugin-safariviewcontroller}
   *
   * # Features
   *
   * **iOS**
   *
   * * Uses {@link https://developer.apple.com/reference/safariservices/sfsafariviewcontroller `SFSafariViewController`}
   * when available, {@link https://developer.apple.com/reference/uikit/uiviewcontroller `UIWebViewController`} otherwise.
   * * iOS 9+ provided {@link https://developer.apple.com/reference/webkit/wkwebview `WKWebView`} with huge performance
   * improvements over {@link https://developer.apple.com/reference/uikit/uiwebview `UIWebView`}.
   */
  var BrowserModule = angular.module('mfw-ionic.inapp-browser', [
    'ionic',
    'ngCordova'
  ]);


  /**
   * RUN section.
   *
   * Initialize service.
   */
  BrowserModule.run(initService);
  initService.$inject = ['$ionicPlatform', '$mwfiBrowser', '$window'];
  function initService($ionicPlatform, $mwfiBrowser, $window) {
    $ionicPlatform.ready(function () {
      _safariWebViewPolyfill();
      $mwfiBrowser.init();
    });

    /**
     *
     * @private
     */
    function _safariWebViewPolyfill() {
      if (angular.isUndefined($window.SafariViewController)) {
        $window.SafariViewController = {
          isAvailable: function (cb) {
            cb(false);
          },
          show: angular.noop,
          hide: angular.noop
        };
      }
    }
  }


  /**
   * @ngdoc service
   * @name mfw-ionic.inapp-browser.$mwfiBrowserProvider
   *
   * @description
   * Provider of {@link mfw-ionic.inapp-browser.service:$mwfiBrowser `$mwfiBrowser`} service.
   */
  BrowserModule.provider('$mwfiBrowser', BrowserProvider);
  BrowserProvider.$inject = ['$cordovaInAppBrowserProvider'];
  function BrowserProvider($cordovaInAppBrowserProvider) {
    var defaultOptions = {
      // Common
      target: '_blank',

      // SafariViewController
      hidden: false, // default false. You can use this to load cookies etc in the background (see issue #1 for details).
      animated: true, // default true, note that 'hide' will reuse this preference (the 'Done' button will always animate though)
      transition: 'curl', // (this only works in iOS 9.1/9.2 and lower) unless animated is false you can choose from: curl, flip, fade, slide (default)
      //enterReaderModeIfAvailable: readerMode, // default false
      tintColor: '#ff0000' // default is ios blue
    };

    /**
     * @ngdoc function
     * @name mfw-ionic.inapp-browser.$mwfiBrowserProvider#config
     * @methodOf mfw-ionic.inapp-browser.$mwfiBrowserProvider
     *
     * @description
     * Configure generic options to be used on each new browser launched.
     *
     * @param {object} options Options
     *    Use settings of both plugins:
     *
     *    * [InAppBrowser](https://github.com/apache/cordova-plugin-inappbrowser#cordovainappbrowseropen)
     *    * [SafariViewController](https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller/wiki#options)
     * @param {string} options.target Default target
     */
    this.config = function (options) {
      defaultOptions = angular.extend({}, defaultOptions, options || {});
      $cordovaInAppBrowserProvider.setDefaultOptions(defaultOptions);
    };

    this.$get = ['$log', '$q', '$window', '$cordovaInAppBrowser', function ($log, $q, $window, $cordovaInAppBrowser) {
      var isSafariBrowserAvailable = false;

      /**
       * @ngdoc service
       * @name mfw-ionic.inapp-browser.service:$mwfiBrowser
       *
       * @description
       * InApp browser service that allows you to open external URLs using native browser or embedded webviews.
       */
      var service = {
        init: init,
        open: open
      };
      return service;

      ////////////////////

      /**
       * @ngdoc method
       * @name mfw-ionic.inapp-browser.service:$mwfiBrowser#init
       * @methodOf mfw-ionic.inapp-browser.service:$mwfiBrowser
       * @private
       *
       * @description
       * Initializer method, to be called when module is loaded.
       *
       * It detects whether {@link https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller#4-usage `SafariViewController`} is available or not.
       */
      function init() {
        $window.SafariViewController.isAvailable(function (available) {
          isSafariBrowserAvailable = available;
        });
      }

      /**
       * @ngdoc method
       * @name mfw-ionic.inapp-browser.service:$mwfiBrowser#open
       * @methodOf mfw-ionic.inapp-browser.service:$mwfiBrowser
       *
       * @description
       * Open a new browser window with given URL, target and options.
       *
       * Internally, this method calls {@link https://github.com/apache/cordova-plugin-inappbrowser `InAppBrowser`} or
       * {@link https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller/wiki#documentation `SafariViewController`}
       * depending on its availability (iOS 9+).
       *
       * @param {string} url URL to open
       * @param {string=} target The target in which to load the URL, an optional parameter that defaults to configured
       *    {@link mfw-ionic.inapp-browser.$mwfiBrowserProvider#config `options.target`} if set or `_self`.
       *    * `_self`: Opens in the Cordova WebView if the URL is in the white list, otherwise it opens in the `InAppBrowser`.
       *    * `_blank`: Opens in the `InAppBrowser`.
       *    * `_system`: Opens in the system's web browser app.
       * @param {object=} options {@link https://github.com/apache/cordova-plugin-inappbrowser#cordovainappbrowseropen InAppBrowser options}
       *    for the `InAppBrowser` and/or {@link https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller/wiki#options SafariViewController options}.
       *
       * @returns {Promise<InAppBrowser>} Promise that will resolve when browser is opened. It will resolve with new
       *    {@link https://github.com/apache/cordova-plugin-inappbrowser#inappbrowser `InAppBrowser`} instance if using
       *    target `_blank`.
       */
      function open(url, target, options) {
        var defer = $q.defer();

        // Default target
        target = target || defaultOptions.target;
        options = angular.extend({}, defaultOptions, options);

        // Use SafariViewController or $cordovaInAppBrowser
        if (target === '_blank' && isSafariBrowserAvailable) {
          _openWithSafariBrowser(url, target, options, defer);
        } else {
          _openWithInAppBrowser(url, target, options, defer);
        }

        return defer.promise;
      }

      /**
       * @description
       * Uses `$cordovaInAppBrowser.open` with given parameters.
       * When done, resolves the action promise.
       *
       * @param {string} url URL to open
       * @param {string} target Target
       * @param {string} options Open options
       * @param {Promise<InAppBrowser>} defer Promise
       *
       * @private
       */
      function _openWithInAppBrowser(url, target, options, defer) {
        // Return new window reference
        var newWindow = $cordovaInAppBrowser.open(url, target, options);
        defer.resolve(newWindow);
      }

      /**
       * @description
       * Uses `SafariViewController`
       *
       * @param {string} url URL to open
       * @param {string} target Ignored as it's always `_blank`
       * @param {string} options Open options
       * @param {Promise<InAppBrowser>} defer Promise
       *
       * @private
       */
      function _openWithSafariBrowser(url, target, options, defer) {
        $window.SafariViewController.show(angular.extend({url: url}, defaultOptions, options),
          function (result) {
            // this success handler will be invoked for the lifecycle events 'opened', 'loaded' and 'closed'
            defer.notify(result);
            if (result === 'closed') {
              defer.resolve(result);
            }
          },
          function (msg) {
            defer.reject(msg);
          });
      }
    }];
  }
})();
