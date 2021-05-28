/**
 * Tests results wrapper and asserts API
 */
var assert = require("assert"),
  Results = require("../core/results");

const { describe, it } = require("@jest/globals");

describe("Metrics", () => {
  const results = new Results();

  it("should be set to zero by default", () => {
    results.setMetric("foo");
    assert.strictEqual(results.getMetric("foo"), 0);
  });

  it("should be correctly set", () => {
    results.setMetric("foo", "bar");
    assert.strictEqual(results.getMetric("foo"), "bar");
  });

  it("avarage should be correctly calculated", () => {
    results.addToAvgMetric("foo", 2);
    results.addToAvgMetric("foo", 1);
    results.addToAvgMetric("bar", 4);
    assert.strictEqual(results.getMetric("foo"), 1.5);
    assert.strictEqual(results.getMetric("bar"), 4);
  });

  it("should be correctly set (with no casting)", () => {
    results.setMetric("bar", null);
    assert.strictEqual(results.getMetric("bar"), null);
  });

  it("should return the list of registered metrics", () => {
    assert.deepStrictEqual(results.getMetricsNames(), ["foo", "bar"]);
  });

  it("should return values of metrics", () => {
    results.setMetric("foo", "bar");
    results.setMetric("bar", 42);

    assert.deepStrictEqual(results.getMetrics(), {
      foo: "bar",
      bar: 42,
    });
  });
});

describe("Offenders", () => {
  const results = new Results();

  it("should be registered", () => {
    results.addOffender("metric", "foo");
    results.addOffender("metric", { url: "bar", size: 42 });
    results.addOffender("metric2", "test");
  });

  it("should be kept in order", () => {
    assert.deepStrictEqual(results.getOffenders("metric"), [
      "foo",
      { url: "bar", size: 42 },
    ]);
    assert.deepStrictEqual(results.getOffenders("metric2"), ["test"]);

    assert.strictEqual("undefined", typeof results.getOffenders("metric3"));
  });
});

describe("Asserts", () => {
  const results = new Results();

  it("should be correctly registered", () => {
    results.setAsserts({
      foo: 123,
      bar: 0,
    });
    assert.deepStrictEqual(results.getAsserts(), {
      foo: 123,
      bar: 0,
    });

    assert.ok(results.hasAssertion("foo"));
    assert.ok(results.hasAssertion("test") === false);

    assert.strictEqual(results.getAssertion("foo"), 123);
  });

  it("should be correctly processed", () => {
    results.setAsserts({
      foo: 123,
      bar: 0,
    });

    results.setMetric("foo", 123);
    assert.ok(results.assert("foo") === true, "foo lte 123");

    results.setMetric("foo", 124);
    assert.ok(results.assert("foo") === false, "foo is not lte 123");

    results.setMetric("test", 200);
    assert.ok(
      results.hasAssertion("test") === false,
      "no assert for test metric"
    );
    assert.ok(results.assert("test"), "no assert for test metric");
  });

  it("can be added on the fly", () => {
    results.setMetric("foo", 125);
    assert.ok(results.assert("foo") === false, "foo is lte 123");

    results.setAssert("foo", 200);
    assert.ok(results.assert("foo"), "foo is lte 200");
  });

  it("should always be meet for non-numeric values", () => {
    results.setAssert("foo", 200);

    results.setMetric("foo", "1.9.2");
    assert.ok(results.assert("foo"), "string assert");

    results.setMetric("foo", false);
    assert.ok(results.assert("foo"), "bool assert");
  });

  it("should be correctly reported", () => {
    results.setAsserts({
      foo: 123,
      bar: 0,
    });

    results.setMetric("foo", 123);
    results.setMetric("bar", 0);
    assert.deepStrictEqual(
      results.getFailedAsserts(),
      [],
      "all asserts are meet"
    );

    results.setMetric("foo", 124);
    results.setMetric("bar", 0);
    assert.deepStrictEqual(
      results.getFailedAsserts(),
      ["foo"],
      "one assert is not meet"
    );

    results.setMetric("foo", 124);
    results.setMetric("bar", 1);
    assert.deepStrictEqual(
      results.getFailedAsserts(),
      ["foo", "bar"],
      "two asserts are not meet"
    );
  });
});
