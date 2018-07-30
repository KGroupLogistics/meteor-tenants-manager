# meteor-tenant-manager

# 🚫🚫🚫🚫🚫 Not production ready 🚫🚫🚫🚫🚫
I'm just playing around with some ideas.

Current issues:
- [ ] No defined way to manage a tenant's user authentication.
- [ ] Still too much overhead to use a tenant's Collections on publications and methods.
- [ ] Make it work with websockets
- [ ] Testing
- [ ] ...

## Inspiration

Lack of tenant solutions for Meteor with a **_Database per Tenant_** approach.

See [Securing MongoDB to Serve an AWS-Based, Multi-Tenant, Security-Fanatic SaaS Application](https://www.mongodb.com/presentations/securing-mongodb-to-serve-an-aws-based-multi-tenant-security-fanatic-saas-application)

![Mongo](https://i.imgur.com/9Wbi7Mo.jpg)

## Usage

### Setup

* Install `meteor add aserranom:tenants-manager`.
* Use DISABLE_WEBSOCKETS=1 environment variable (ie: `DISABLE_WEBSOCKETS=1 meteor`).
* Setup subdomains for your app (eg: 'tenant1'). _If you want to try this locally I suggest you setup your `/etc/hosts` file with a row per tenant of the form: `127.0.0.1 tenant1.testing-app.com`, and then on your browser go to `tenant1.testing-app.com:3000`._

### Creating a tenant

Create a tenant on the server via the `TenantsManager`'s `createTenant` method, you'll need to provide the `subdomain` and the `databaseName`.

```javascript
import { TenantsManager } from 'meteor/aserranom:tenants-manager';

TenantsManager.createTenant({ subdomain: 'tenant1', databaseName: 'tenant1' });
```

### Creating a tenanted collection

The client is not aware of the tenant structure on the server, so we create a collection as we usually do.
However the server must add the tenanted collection via the `TenantsManager`'s `addCollection` method providing only the `collectionName`.

```javascript
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { TenantsManager } from 'meteor/aserranom:tenants-manager';

if (Meteor.isClient) {
  export const Experiments = new Mongo.Collection('experiments');
}

if (Meteor.isServer) {
  TenantsManager.addCollection({
    collectionName: 'Experiments',
  });
}
```

### Using a collection (inside a Meteor Method or Publication)

On a server method/publication you must access tenanted collections via the `TenantsManager`'s `getCollection` method.
The manager will automatically get the collection for the subdomain that is making the request (only when using DISABLE_WEBSOCKETS=1 flag).

```javascript
import { Meteor } from 'meteor/meteor';
import { TenantsManager } from 'meteor/aserranom:tenants-manager';

// eslint-disable-next-line prefer-arrow-callback
Meteor.publish('experiments', function publishExperiments() {
  const Experiments = TenantsManager.getCollection({ collectionName: 'Experiments' });
  return Experiments.find();
});
```

### Subscriptions

Straightforward as long as the user is accessing your app from its tenant's subdomain (eg: 'tenant1.app.com')

```javascript
import { Meteor } from 'meteor/meteor';
 
Meteor.subscribe('experiments');
```
