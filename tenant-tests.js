// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by tenant.js.
import { name as packageName } from "meteor/aserrano:tenants-manager";

// Write your tests here!
// Here is an example.
Tinytest.add('tenant - example', function (test) {
  test.equal(packageName, "tenant");
});
