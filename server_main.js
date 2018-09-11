import { TenantsManagerServer } from './tenants_manager_server';
import { TenantCollection } from './tenant_collection';

const TenantsManager = new TenantsManagerServer();

export { TenantsManager, TenantCollection };
