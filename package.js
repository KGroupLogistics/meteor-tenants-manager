/* globals Package, Npm */
Package.describe({
  name: 'aserranom:tenants-manager',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Exploring a multi-tenant solution for Meteor.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Npm.depends({
  'simpl-schema': '1.5.0',
  camelcase: '5.0.0',
});

Package.onUse((api) => {
  api.versionsFrom('1.7.0.1');
  api.use('ecmascript');
  api.use('mongo');
  api.use('ddp');
  api.use('aldeed:collection2@3.0.0');
  api.mainModule('server_main.js', 'server');
  api.mainModule('client_main.js', 'client');
});

Package.onTest((api) => {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('aserranom:tenant');
  api.mainModule('tenant-tests.js');
});
