# JSGI VHost middleware

Vhost multiple JSGI apps. Optionally set a default app, and change the root
(`scriptName`) of an app.

    require('jsgi-vhoster').middleware( {
      "site1.co.uk": jsgi_app,
      "site2.co.uk": { app: jsgi_app, default: true }
    } )

Keys are the host names to vhost on. The values must be either a function,
or an object with at least an `app` key. The full list of keys understood
is:

- app (`Function`): the JSGI app to run on this host.
- default (`Boolean`): the default vhost if no host header is present, or
  if it doesn't match anything
- scriptName (`String`): script name at which to root the app rather than
  the default behaviour of `/`

