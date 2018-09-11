import { Mongo } from 'meteor/mongo';
import { TenantsManager } from 'meteor/aserrano:tenants-manager';

// [ ] Possible optimization by not opening drivers each time the _collection is accessed.

class TenantCollection extends Mongo.Collection {
  get _collection() {
    const tenant = TenantsManager.getCurrentTenant();

    const driver = tenant ? tenant.connection : this._driver;
    return driver.open(this._name, this._connection);
  }
}

export { TenantCollection };
