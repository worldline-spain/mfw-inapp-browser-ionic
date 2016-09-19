# MFW Ionic InApp Browser v1.0.0

This AngularJS module provides a way to open external URLs using internal browser as part of **Mobile FrameWork (MFW)** for **Ionic** applications.



## Features


This module offers an abstraction of ngCordova's [`$cordovaInAppBrowser`](http://ngcordova.com/docs/plugins/inAppBrowser/).

Furthermore, iOS users can take advantage of newest [`SFSafariViewController`](https://developer.apple.com/reference/safariservices/sfsafariviewcontroller),
when available, by using [cordova-plugin-safariviewcontroller](https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller) plugin.



## Installation

### Plugins

This module requires the following Cordova plugins:

* [cordova-plugin-inappbrowser](https://github.com/apache/cordova-plugin-inappbrowser)
* [cordova-plugin-safariviewcontroller](https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller): _optional_ but extremely recommended


### Via Bower

Get module from Bower registry.

```shell
$ bower install --save mfw-inapp-browser-ionic
```


### Other

Download source files and include them into your project sources.



### Dependency

Once dependency has been downloaded, configure your application module(s) to require:

* `mfw-ionic.inapp-browser` module: provider and service to register for push notifications.

```js
angular
  .module('your-module', [
      // Your other dependencies
      'mfw-ionic.inapp-browser'
  ]);
```

Now you can inject `$mwfiBrowser` service.


> For further documentation, please read the generated `ngDocs` documentation inside `docs/` folder.


## Usage

### Configure

Configure default options for both plugins:

* [InAppBrowser](https://github.com/apache/cordova-plugin-inappbrowser#cordovainappbrowseropen)
* [SafariViewController](https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller/wiki#options)

```js
angular
  .module('your-module')
  .config(configInAppBrowser);

configInAppBrowser.$inject = ['$mwfiBrowserProvider'];
function configInAppBrowser($mwfiBrowserProvider) {
  $mwfiBrowserProvider.config({
    /*
     * InAppBrowser
     */
    // Common
    target: '_blank',
    location: 'no',

    // Android
    zoom: 'no',

    // iOS
    allowInlineMediaPlayback: 'yes',
    presentationstyle: 'pagesheet',
    transitionstyle: 'crossdissolve',
    toolbar: 'yes',
    toolbarposition: 'top',
    //closebuttoncaption: 'Ok'

    // Windows Phone
    // ...

    /*
     * SafariViewController
     */
    enterReaderModeIfAvailable: true,
    tintColor: "#000000", // default is ios blue
    barColor: "#eaeaea", // on iOS 10+ you can change the background color as well
    controlTintColor: "#ffffff" // on iOS 10+ you can override the default tintColor
  });
}
```


### Open links

```js
Controller.$inject = ['$mwfiBrowser'];
function Controller($mwfiBrowser) {
  // Open in InApp browser
  $mwfiBrowser.open('https://github.com', '_blank');
}
```


## Development

* Use Gitflow
* Update package.json version
* Tag Git with same version numbers as NPM
* Check for valid `ngDocs` output inside `docs/` folder

> **Important**: Run `npm install` before anything. This will install NPM and Bower dependencies.

> **Important**: Run `npm run deliver` before committing anything. This will build documentation and distribution files.
> It's a shortcut for running both `docs` and `build` scripts.


### NPM commands

* Bower: install Bower dependencies in `bower_components/` folder:

```shell
$ npm run bower
```

* Build: build distributable binaries in `dist/` folder:

```shell
$ npm run build
```

* Documentation: generate user documentation (using `ngDocs`):

```shell
$ npm run docs
```

* Linting: run *linter* (currently JSHint):

```shell
$ npm run lint
```

* Deliver: **run it before committing to Git**. It's a shortcut for `docs` and `build` scripts:

```shell
$ npm run deliver
```
