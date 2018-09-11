# meteor-tenant-manager

# 🚫🚫🚫🚫🚫 Proof of Concept: Not production intended 🚫🚫🚫🚫🚫
I'm just playing around with some ideas. 

Current issues:
- [ ] No defined way to manage a tenant's user authentication: I'm not seeing much future for this since Accounts doesn't keep the context when calling the loginWith* methods (thus TenantCollection is unable to retrieve the caller's subdomain)...
- [x] Still too much overhead to use a tenant's Collections on publications and methods: *Solved this by creating the TenantCollection class. TenantCollection extends Mongo.Collection and overwrites the _collection property, with a generalized, getter version of the original code that recalculates the collection's driver with the one that corresponds to the caller's subdomain.*
- [ ] Make it work with websockets
- [ ] ...

I don't intend to work on this proof of concept anymore given the hacks needed make this work. Plus, theres no clear view to tenantify Accounts.

## Inspiration

Lack of tenant solutions for Meteor with a **_Database per Tenant_** approach.

See [Securing MongoDB to Serve an AWS-Based, Multi-Tenant, Security-Fanatic SaaS Application](https://www.mongodb.com/presentations/securing-mongodb-to-serve-an-aws-based-multi-tenant-security-fanatic-saas-application)

![Mongo](https://i.imgur.com/9Wbi7Mo.jpg)

## Usage

### Setup

* Install `meteor add aserrano:tenants-manager`.
* Use DISABLE_WEBSOCKETS=1 environment variable (ie: `DISABLE_WEBSOCKETS=1 meteor`).
* Setup subdomains for your app (eg: 'tenant1'). _If you want to try this locally I suggest you setup your `/etc/hosts` file with a row per tenant of the form: `127.0.0.1 tenant1.testing-app.com`, and then on your browser go to `tenant1.testing-app.com:3000`._

### Creating a tenant

Create a tenant on the server via the `TenantsManager`'s `createTenant` method, you'll need to provide the `subdomain` and the `databaseName`.

```javascript
import { TenantsManager } from 'meteor/aserrano:tenants-manager';

TenantsManager.createTenant({ subdomain: 'tenant1', databaseName: 'tenant1' });
```

### Creating a tenanted collection

The client is not aware of the tenant structure on the server, so we create a collection as we usually do.
However the server must add the tenanted collection via `TenantCollection`.

```javascript
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { TenantCollection } from 'meteor/aserrano:tenants-manager';

export const Experiments = Meteor.isClient ? new Mongo.Collection('experiments') :
  new TenantCollection('experiments');
```

### Using a collection (inside a Meteor Method or Publication)

On a server method/publication you can use the collection as usual.
The manager will automatically get the collection for the subdomain that is making the request (only when using DISABLE_WEBSOCKETS=1 flag).

```javascript
import { Meteor } from 'meteor/meteor';

// eslint-disable-next-line prefer-arrow-callback
Meteor.publish('experiments', function publishExperiments() {
  return Experiments.find();
});
```

### Subscriptions

Straightforward as long as the user is accessing your app from its tenant's subdomain (eg: 'tenant1.app.com')

```javascript
import { Meteor } from 'meteor/meteor';
 
Meteor.subscribe('experiments');
```
