/**
 * Generates metadata.json file that stores metadata about:
 *
 * - events
 * - metrics
 * - modules
 * - extensions
 */
"use strict";

var debug = require("debug")("generate"),
  fs = require("fs"),
  glob = require("glob"),
  phantomas = require("../../"),
  yaml = require("js-yaml"),
  metadata = {
    events: {},
    extensions: {},
    modules: {},
    metrics: {},
    metricsCount: 0,
    modulesCount: 0,
    extensionsCount: 0,
    version: phantomas.version,
  };

function getMetricsCoveredByTests(spec) {
  const debug = require("debug")("metricsCovered");

  var covered = {};

  spec.forEach((testCase) => {
    debug(testCase.label || testCase.url);

    Object.keys(testCase.metrics || {}).forEach((metric) => {
      covered[metric] = true;
    });

    Object.keys(testCase.offenders || {}).forEach((metric) => {
      covered[metric] = true;
    });
  });

  return Object.keys(covered);
}

function getOptionsCoveredByTests(spec) {
  var covered = {};

  spec.forEach((testCase) => {
    Object.keys(testCase.options || {}).forEach((option) => {
      covered[option] = true;
    });
  });

  return Object.keys(covered).sort();
}

function getModuleMetadata(moduleFile) {
  var content = fs.readFileSync(moduleFile).toString(),
    data = {
      name: "",
      description: "",
      metrics: {},
      events: {},
    },
    matches,
    moduleName,
    metricRegEx =
      /(setMetric|setMetricEvaluate|incrMetric)\(['"]([^'"]+)['"](\)|,)(.*@desc.*$)?/gm,
    eventsRegEx = /emit\(['"]([^'"]+)['"]([^)]+).*@desc(.*)$/gm;

  data.name = moduleName = moduleFile.split("/").pop().replace(/\.js$/, "");

  const localPath = moduleFile.replace(
    fs.realpathSync(__dirname + "/../../"),
    ""
  );
  data.localPath = localPath;

  //
  // scan the source code
  //

  // look for metrics metadata
  while ((matches = metricRegEx.exec(content)) !== null) {
    var entry = {},
      metricName = matches[2],
      metricComment = matches[4],
      metricUnit = "ms",
      hasDesc = metricComment && metricComment.indexOf("@desc") > -1;

    if (typeof data.metrics[metricName] !== "undefined") {
      if (hasDesc) {
        debug(
          "Found duplicated definition of %s metric in %s module",
          metricName,
          moduleName
        );
      }
      continue;
    }

    // parse @desc
    if (hasDesc) {
      metricComment = metricComment.split("@desc").pop().trim();
      entry.desc = "";

      ["unreliable", "optional", "offenders", "gecko"].forEach(function (
        marker
      ) {
        if (metricComment.indexOf("@" + marker) > -1) {
          entry[marker] = true;
          metricComment = metricComment.replace("@" + marker, "").trim();
        }
      });

      // detect units (defaults to ms)
      if ((matches = metricComment.match(/\[([^\]]+)\]/)) !== null) {
        metricUnit = matches[1];
        metricComment = metricComment.replace(matches[0], "").trim();
      } else if (
        /^(number of|total number of|average specificity|total specificity|median of number|maximum number|maximum level)/.test(
          metricComment
        )
      ) {
        metricUnit = "number";
      } else if (
        /^(the size|size|length|total length) of/.test(metricComment)
      ) {
        metricUnit = "bytes";
      }

      // check if offenders are reported for this metric
      let offenderRegex = new RegExp(
        "phantomas.addOffender\\([\\n\\r\\s]*[\"']" + metricName + "[\"']"
      );
      if (content.search(offenderRegex) > -1) {
        entry.offenders = true;
      }

      entry.desc = metricComment;
      entry.unit = metricUnit;
    } else if (moduleName !== "scope") {
      debug(
        "Metadata missing for %s metric in %s module",
        metricName,
        moduleName
      );
    }

    entry.module = moduleName;

    // add a metric
    data.metrics[metricName] = entry;
  }

  // look for events metadata
  while ((matches = eventsRegEx.exec(content)) !== null) {
    // console.log([moduleName, matches[1], matches[2], matches[3]]);

    data.events[matches[1]] = {
      file: localPath,
      desc: matches[3].trim(),
      arguments: matches[2].replace(/^[,\s]+/g, ""),
    };
  }

  // parse modules and extensions initial commit block
  matches = /^\/\*\*([^/]+)\*\//m.exec(content);
  if (matches) {
    var desc = matches[0]
      .replace(/^[\s/]?\*+\s?/gm, "") // remove the beginning of block comment
      .replace(/\/$/gm, "") // remove the ending of block comment
      .replace(/^\s?setMetric.*$/gm, "") // remove setMetric annotations
      .trim();

    //console.log(localPath, moduleName, matches[0]);

    data.description = desc;
  }
  //console.log(data); throw new Error('foo');

  return data;
}

// read the YAML spec file
const raw = fs
    .readFileSync(__dirname + "/../../test/integration-spec.yaml")
    .toString(),
  spec = yaml.load(raw);

// find all metrics covered by integration tests (take a look into integration-spec.yaml)
const coveredMetrics = getMetricsCoveredByTests(spec);

debug(
  "Found %d metrics covered by integration-spec.yaml...",
  coveredMetrics.length
);

// find all options covered by integration tests (take a look into integration-spec.yaml)
const coveredOptions = getOptionsCoveredByTests(spec);

debug(
  "Found %d options covered by integration-spec.yaml: --%s",
  coveredOptions.length,
  coveredOptions.join(", --")
);

// find all modules
var dir = phantomas.path;
debug("Looking for modules in %s...", dir);

[]
  .concat(
    glob.sync(dir + "/core/modules/**/*.js"),
    glob.sync(dir + "/modules/**/*.js"),
    glob.sync(dir + "/extensions/**/*.js"),
    glob.sync(dir + "/lib/*.js")
  )
  .forEach(function (moduleFile) {
    const data = getModuleMetadata(moduleFile);

    // skip scope.js files when listing metrics
    if (
      moduleFile.indexOf("/scope.js") === -1 &&
      moduleFile.indexOf("/lib/") === -1
    ) {
      Object.keys(data.metrics).forEach(function (metricName) {
        metadata.metricsCount++;
        metadata.metrics[metricName] = data.metrics[metricName];
        metadata.metrics[metricName].testsCovered =
          coveredMetrics.indexOf(metricName) > -1;
      });
    }

    // modules ...
    if (
      moduleFile.indexOf("/scope.js") === -1 &&
      moduleFile.indexOf("/modules/") > -1
    ) {
      metadata.modules[data.name] = {
        file: data.localPath,
        desc: data.description,
        events: Object.keys(data.events),
        metrics: Object.keys(data.metrics),
      };

      metadata.modulesCount++;
    }

    // ... and extensions
    if (moduleFile.indexOf("/extensions/") > -1) {
      metadata.extensions[data.name] = {
        file: data.localPath,
        desc: data.description,
        options: [],
      };

      metadata.extensionsCount++;
    }

    Object.keys(data.events).forEach(function (eventName) {
      metadata.events[eventName] = data.events[eventName];
    });
  });

// store metadata
var filename = __dirname + "/metadata.json",
  content = JSON.stringify(metadata, null, "  ");

debug("Storing metadata in %s...", filename);
fs.writeFile(filename, content, function (err) {
  if (err) {
    debug("Storing failed: %s", err);
  } else {
    debug("Done");
  }
});

debug(
  "Metrics found: %d (tests coverage: %s%)",
  metadata.metricsCount,
  ((coveredMetrics.length / metadata.metricsCount) * 100).toFixed(2)
);
