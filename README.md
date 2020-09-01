phantomas [![npm](https://img.shields.io/npm/dt/phantomas.svg)]() [![Inline docs](http://inch-ci.org/github/macbre/phantomas.svg?branch=phantomas-v2)](http://inch-ci.org/github/macbre/phantomas)
=========

[Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)-based modular web performance metrics collector. And why phantomas? Well, [because](http://en.wikipedia.org/wiki/Fantômas) :)

## Requirements

* [NodeJS](http://nodejs.org) 12+

## Installation

```
npm install phantomas
```

> This will install [a recent version of Chromium](https://github.com/GoogleChrome/puppeteer#installation) supported by `puppeteer` module.

## Support

[![Foo](https://raw.githubusercontent.com/macbre/phantomas/devel/docs/phantomas-banner.png)](https://xscode.com/macbre/phantomas)

**You can get [support for phantomas](https://xscode.com/macbre/phantomas) via xs:code.**

## Usage example

```js
const phantomas = require('phantomas'),
    promise = phantomas('http://example.com/');

promise.
    then(results => {
        console.log('Metrics', results.getMetrics());
        console.log('Offenders', results.getAllOffenders());
    }).
    catch(res => {
        console.error(res);
    });

// events handling
promise.on('recv', response => {
    console.log('Response: %s %s [%s]', response.method, response.url, response.contentType);
});

// including the custom one emitted by phantomas modules
promise.on('domQuery', (type, query) => {
        console.log('DOM query by %s - "%s"', type, query);
});
```

Or run `./examples/index.js`.

### Development version

To get the latest development version of phantomas (and install all required dependencies):

```
git clone git@github.com:macbre/phantomas.git
npm install
```

#### Running tests

First you need to start a local nginx container that will serve static assets used by integration tests suite. Then simply run `npm t`:

```
./test/server-start.sh
npm t
```

All pull requests that are filed for this repository will have tests run via GitHub Actions.

## Having problems?

Please refer to **[/Troubleshooting.md](https://github.com/macbre/phantomas/blob/devel/Troubleshooting.md)**

## Features

* modular approach - each metric is generated by a separate "module"
* phantomas "core" acts as an events emitter that each module can hook into
* in-depth metrics such as: number of events bound via jQuery, calls to ``window.write``or [complex and duplicated CSS selectors (via analyze-css)](https://github.com/macbre/analyze-css)
* JSON and CSV as available output formats for easy integration with automated reporting / monitoring tools
* easy integration with Continuous Integration tools via TAP format and assertions handling
* metrics can be sent via StatsD or stored in elasticsearch
* easy integration with other nodejs projects via CommonJS module ([see API docs](https://github.com/macbre/phantomas/wiki/npm-module))
* metrics can be emitted from JavaScript code of the page phantomas is run against (thanks to [helper functions available in window.__phantomas](https://github.com/macbre/phantomas/wiki/Phantomas-scope))
* device profiles allow phantomas to emulate mobile or tablet (by setting a proper user agent and viewport)

## Contributors

> All the [contributors](https://github.com/macbre/phantomas/graphs/contributors)

* [macbre](https://github.com/macbre)
* [sjhcockrell](https://github.com/sjhcockrell)
* [jgonera](https://github.com/jgonera)
* [william-p](https://github.com/william-p)
* [gmetais](https://github.com/gmetais)
* [vgangan](https://github.com/vgangan)
* [cphoover](https://github.com/cphoover)
* [wladekb](https://github.com/wladekb)
* [iNem0o](https://github.com/iNem0o)
* [gomezd](https://github.com/gomezd)
* [stefanjudis](https://github.com/stefanjudis)

## Usage

> phantomas comes as a CommonJS module ([see API docs](https://github.com/macbre/phantomas/wiki/npm-module)) that you can use in your nodejs projects.

## Metrics

> Please refer to [`/docs/metrics.md` file](https://github.com/macbre/phantomas/blob/devel/docs/metrics.md) for **a full, up-to-date list of all available modules and metrics** that phantomas emits.

## For developers

* [`docs/` directory](https://github.com/macbre/phantomas/blob/devel/docs)
* Description of [events fired by phantomas core](https://github.com/macbre/phantomas/blob/devel/docs/events.md)
* [List of **all metrics** and modules](https://github.com/macbre/phantomas/blob/devel/docs/metrics.md)

## Let's make Web a bit faster!

* [Best Practices for Speeding Up Your Web Site](http://developer.yahoo.com/performance/rules.html) (by Yahoo!)
* [Web Performance Best Practices](https://developers.google.com/speed/docs/best-practices/rules_intro) (by Google)
* [Writing Efficient CSS](http://developer.mozilla.org/en/Writing_Efficient_CSS) (by Mozilla)
* [Planet Performance](http://www.perfplanet.com/) - news and views from the web performance blogosphere
* [Performance of 3rd Party Content](http://stevesouders.com/p3pc/) (by Steve Souders)
* [Profiling CSS for fun and profit. Optimization notes.](http://perfectionkills.com/profiling-css-for-fun-and-profit-optimization-notes/)

### Slides

* [Know Your Engines: How to Make Your JavaScript Fast](http://cdn.oreillystatic.com/en/assets/1/event/60/Know%20Your%20Engines_%20How%20to%20Make%20Your%20JavaScript%20Fast%20Presentation%201.pdf) (by David Mandelin from Mozilla)
* [Velocity Conf 2013 Workshop: Avoiding Web Performance Regression](http://www.slideshare.net/marcelduran/velocity-conf-2013) (by Marcel Duran from Twitter)

## Blogosphere

Introductions to phantomas and use cases:

* [phantomas – PhantomJS based, modular web performance metrics generator](http://calendar.perfplanet.com/2013/phantomas/) (an article for Performance Calendar)
* [How to Measure Frontend Performance With Grunt](http://4waisenkinder.de/blog/2013/12/22/how-to-measure-frontend-performance-with-phantomas-and-grunt/)
* [MaxCDN Blog - Behind The Scenes: tools.maxcdn.com](http://blog.maxcdn.com/behind-scenes-tools-maxcdn-com/)
* [Measuring frontend performance](http://www.nephila.it/en/blog/2014/10/24/measuring-frontend-performance/)
* [Performance Budgets with Phantomas and Jenkins](http://fairl.es/2014/02/02/phantomas-performance-testing-and-jenkins/)
* [phantomas introduced at npmawesome.com](http://npmawesome.com/posts/2014-12-01-phantomas/)
* [Grunt.js for the Enterprise - Vol.1: Frontend Performance with Phantomas](http://www.slideshare.net/DavidAm/grunt-js-for-the-enterprise) (by David Amend)
* [Automated Frontend Testing at DrupalCon Austin 2014](https://austin2014.drupal.org/session/automated-frontend-testing) (+video)
* [Phantomas: Fais-moi un strip !](https://wooster.checkmy.ws/2014/01/phantomas-performance-website/) (in French)

### Videos

* [Sebastian Golasch: The Glitch in the Game (Front End Ops Conference 2014)](http://youtu.be/B_kwo5V6m_w?t=12m25s)

## Utilities

Use [grunt](http://gruntjs.com/) to automate daily dev tasks, including your's application web performance, via these great tools:

* [grunt-phantomas](https://github.com/stefanjudis/grunt-phantomas)
* [juve](https://github.com/jared-stilwell/juve)
* [grunt-devperf](https://github.com/gmetais/grunt-devperf)
