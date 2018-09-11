/* globals MongoInternals */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { DDP } from 'meteor/ddp';
import camelCase from 'camelCase';

import { TenantsManagerCommon } from './tenants_manager_common';

// [*] Tenant collection.
// [*] Tenant collection publication.
// [*] Detect subdomain automatically.
// [*] Handle dynamic subdomain generation.
// [*] Handle tenant creation.
// [!] Support Oplog: Works but super slow ... should try on a production db and not a local instance.
// [*] Handle tenant destuction & cleanup.
// [*] Handle tenant's collections list.
// [*] Support getCollection for an specific tenant.
// [ ] Use Meteor.EnviromentVariable to scope subdomain for non client originated functions.
// [ ] Alternatives to subdomain based tenants
// [*] Find an easier way to retrieve a tenant's collection, in methods and publications...
//     For example Shoes = new TenantedCollection('shoes');
//     Shoes.find() --> changes Shoes instance's _driver to point to tenant's db. However changing that instance
//     will affect all other tenants...

class TenantsManagerServer extends TenantsManagerCommon {
  constructor() {
    super();

    this._server = Meteor.server;
    // Connection listener used to determine and set the subdomain.
    this._server.onConnection((connection) => {
      const { httpHeaders: { host } } = connection;
      connection.subdomain = host.split(':')[0].split('.').slice(0, -2).join('.');
    });
    this._collectionsNames = [];

    this._initTenants();
    this._initServerPublications();
  }

  get subdomain() {
    const currentInvocation = DDP._CurrentMethodInvocation.get() ||
      DDP._CurrentPublicationInvocation.get();
    if (!currentInvocation) {
      throw new Meteor.Error('Subdomain can only be invoked in method calls or publications.');
    }
    return currentInvocation.connection.subdomain;
  }

  _initTenants() {
    this._initializedTenants = this.tenants.find().map(tenant => ({
      ...tenant,
      connection: new MongoInternals.RemoteCollectionDriver(tenant.db, {
        oplogUrl: Meteor.isProduction && 'mongodb://localhost:3001/local',
      }),
      collections: {},
    }));
  }

  _initServerPublications() {
    const tenantsManager = this;
    // eslint-disable-next-line prefer-arrow-callback
    this._server.publish('tenant', function publishTenant() {
      const { subdomain } = tenantsManager;
      return tenantsManager.tenants.find({ subdomain }, { fields: { subdomain: 1 } });
    });
  }

  getCurrentTenant() {
    const tenantsManager = this;
    const { subdomain: currentSubdomain } = tenantsManager;
    return tenantsManager._initializedTenants.find(({ subdomain }) =>
      subdomain === currentSubdomain);
  }

  getCollection({ collectionName, tenant }) {
    const { _id } = tenant || this.tenants.findOne({ subdomain: this.subdomain });
    const { collections } = this._initializedTenants.find(initializedTenant =>
      initializedTenant._id === _id);
    return collections[collectionName];
  }

  addCollection({ collectionName }) {
    if (this._collectionsNames.indexOf(collectionName) !== -1) {
      throw new Meteor.Error('Collection name is already present in manager.');
    }
    this._initializedTenants.forEach((tenant) => {
      tenant.collections[collectionName] = new Mongo.Collection(camelCase(collectionName), {
        _driver: tenant.connection,
        _suppressSameNameError: true,
      });
    });
    this._collectionsNames.push(collectionName);
  }

  removeCollection({ collectionName }) {
    this._initializedTenants.forEach((tenant) => {
      const collection = tenant.collections[collectionName];
      if (collection) {
        delete tenant.collections[collectionName];
      }
    });
    const collectionIndex = this._collectionsNames.indexOf(collectionName);
    this._collectionsNames.splice(collectionIndex, 1);
  }

  createTenant({ subdomain, databaseName }) {
    const tenantId = this.tenants.insert({
      subdomain,
      db: `mongodb://127.0.0.1:3001/${databaseName}`,
    });

    const tenant = this.tenants.findOne(tenantId);

    const connection = new MongoInternals.RemoteCollectionDriver(tenant.db, {
      // this is ultra slow with oplog tailing ...
      oplogUrl: Meteor.isProduction && 'mongodb://localhost:3001/local',
    });

    const collections = {};
    this._collectionsNames.forEach((collectionName) => {
      collections[collectionName] = new Mongo.Collection(collectionName, {
        _driver: connection,
        _suppressSameNameError: true,
      });
    });

    this._initializedTenants.push({
      ...tenant,
      connection,
      collections,
    });

    return tenantId;
  }

  removeTenant({ subdomain }) {
    const { _id } = this.tenants.findOne({ subdomain });
    const index = this._initializedTenants.findIndex(initializedTenant =>
      initializedTenant._id === _id);
    this._initializedTenants.splice(index, 1);
    this.tenants.remove(_id);
  }
}

export { TenantsManagerServer };
