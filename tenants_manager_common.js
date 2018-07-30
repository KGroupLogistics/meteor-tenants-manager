import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

class TenantsManagerCommon {
  constructor() {
    this.tenants = new Mongo.Collection('tenants');

    this.connection = Meteor.connection;
  }
}

export { TenantsManagerCommon };
