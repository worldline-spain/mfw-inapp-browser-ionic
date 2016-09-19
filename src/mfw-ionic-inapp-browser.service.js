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
   * Add a {@link https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller/wiki#documentation
   * `SafariViewController`} polyfill when it's not available (browser) that confirms it's not available.
   */
  BrowserModule.run(safariWebViewPolyfill);
  safariWebViewPolyfill.$inject = ['$ionicPlatform', '$window'];
  function safariWebViewPolyfill($ionicPlatform, $window) {
    $ionicPlatform.ready(function () {
      if (angular.isUndefined($window.SafariViewController)) {
        $window.SafariViewController = {
          isAvailable: function (cb) {
            cb(false);
          },
          show: angular.noop,
          hide: angular.noop
        };
      }
    });
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
      target: '_blank'
    };

    /**
     * @ngdoc function
     * @name mfw-ionic.inapp-browser.$mwfiBrowserProvider#config
     * @methodOf mfw-ionic.inapp-browser.$mwfiBrowserProvider
     *
     * @description
     * Configure generic options to be used on each new browser launched.
     *
     * Read {@link https://github.com/apache/cordova-plugin-inappbrowser#cordovainappbrowseropen official docs} for
     * more options.
     *
     * @param {object} options Options
     * @param {boolean} options.enabled Whether push notifications are enabled (won't try to register if disabled).
     */
    this.config = function (options) {
      defaultOptions = angular.extend({}, defaultOptions, options || {});
      $cordovaInAppBrowserProvider.config(defaultOptions);
    };

    this.$get = ['$log', '$q', '$cordovaInAppBrowser', function ($log, $q, $cordovaInAppBrowser) {
      /**
       * @ngdoc service
       * @name mfw-ionic.inapp-browser.service:$mwfiBrowser
       *
       * @description
       * Push service for Ionic applications.
       *
       * It wraps all events broadcasted to `$rootScope` and offers a callback-based API.
       */
      var service = {
        open: open
      };
      return service;

      ////////////////////

      /**
       * @ngdoc method
       * @name mfw-ionic.inapp-browser.service:$mwfiBrowser#open
       * @methodOf mfw-ionic.inapp-browser.service:$mwfiBrowser
       *
       * @description
       * Open a new browser window with given URL, target and options. Think of this method as a replacement
       * of {@link http://www.w3schools.com/jsref/met_win_open.asp `window.open()`}.
       *
       * Internally, this method calls {@link https://github.com/apache/cordova-plugin-inappbrowser `InAppBrowser`} or
       * {@link https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller/wiki#documentation `SafariViewController`}
       * depending on its availability (iOS 9+).
       *
       * @param {string} url URL to open
       * @param {string=} target The target in which to load the URL, an optional parameter that defaults to `_self`.
       *    * `_self`: Opens in the Cordova WebView if the URL is in the white list, otherwise it opens in the `InAppBrowser`.
       *    * `_blank`: Opens in the `InAppBrowser`.
       *    * `_system`: Opens in the system's web browser.
       * @param {string} options {@link https://github.com/apache/cordova-plugin-inappbrowser#cordovainappbrowseropen Options}
       *    for the `InAppBrowser`.
       *
       * @returns {Promise<InAppBrowser>} Promise that will resolve when browser is opened. It will resolve with new
       *    {@link https://github.com/apache/cordova-plugin-inappbrowser#inappbrowser `InAppBrowser`} instance if using
       *    target `_blank`.
       */
      function open(url, target, options) {
        var defer = $q.defer();

        // Default target
        target = target || defaultOptions.target;

        if (target === '_blank') {
          // Use SafariViewController or $cordovaInAppBrowser
          SafariViewController.isAvailable(function (available) {
            if (available) {
              _openWithSafariBrowser(url, target, options, defer);
            } else {
              _openWithInAppBrowser(url, target, options, defer);
            }
          });
        } else {
          _openWithInAppBrowser(url, target, options, defer);
        }

        return defer.promise;

        ////////////////
      }

      /**
       * @description
       * Uses `$cordovaInAppBrowser.open` with given parameters.
       * When done, resolves the action promise.
       *
       * @param {string} url
       * @param {string} target
       * @param {string} options
       * @param {Promise<InAppBrowser>} defer
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
       * @param {string} url
       * @param {string} target
       * @param {string} options
       * @param {Promise<InAppBrowser>} defer
       *
       * @private
       */
      function _openWithSafariBrowser(url, target, options, defer) {
        SafariViewController.show({
            url: url,
            hidden: false, // default false. You can use this to load cookies etc in the background (see issue #1 for details).
            animated: false, // default true, note that 'hide' will reuse this preference (the 'Done' button will always animate though)
            transition: 'curl', // (this only works in iOS 9.1/9.2 and lower) unless animated is false you can choose from: curl, flip, fade, slide (default)
            //enterReaderModeIfAvailable: readerMode, // default false
            tintColor: "#ff0000" // default is ios blue
          },
          // this success handler will be invoked for the lifecycle events 'opened', 'loaded' and 'closed'
          function (result) {
            defer.resolve(result);
          },
          function (msg) {
            defer.reject(msg);
          });
      }
    }];
  }
})();
