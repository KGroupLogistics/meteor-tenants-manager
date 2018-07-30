import { TenantsManagerCommon } from './tenants_manager_common';

class TenantsManagerClient extends TenantsManagerCommon {
  constructor() {
    super();

    this._tenantsHandle = this.connection.subscribe('tenant');
  }
}

export { TenantsManagerClient };
