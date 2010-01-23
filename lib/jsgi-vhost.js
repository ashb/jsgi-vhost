/**
 *  Vhost multiple JSGI apps. Optionally set a default app, and change the root
 *  (`scriptName`) of an app.
 *
 *      require('jsgi-vhoster').middleware( {
 *        "site1.co.uk": jsgi_app,
 *        "site2.co.uk": { app: jsgi_app, default: true }
 *      } )
 *
 *  Keys are the host names to vhost on. The values must be either a function,
 *  or an object with at least an `app` key. The full list of keys understood
 *  is:
 *
 *  - app (`Function`): the JSGI app to run on this host.
 *  - default (`Boolean`): the default vhost if no host header is present, or
 *    if it doesn't match anything
 *  - scriptName (`String`): script name at which to root the app rather than
 *    the default behaviour of `/`
 **/
exports.middleware = function vhoster( sites ) {
  var def,
      explicit_default_set = false;

  // Normalize and process sites.
  for ( var i in sites ) {
    if (typeof sites[ i ] == "function")
      sites[ i ] = { app: sites[ i ] }

    // No default yet - default to taking the first item
    if ( !def ) {
      def = i;   
      if ( sites[ i ].default ) explicit_default_set = true;
    }
    else if ( sites[ i ].default ) {
      if ( explicit_default_set )
        throw new Error("Explicit default already set to " + def);
      def = i;
      explicit_default_set = true;
    }

    if ( "scriptName" in sites ) {
      sites.scriptName = sites.scriptName.replace( /\/$/, '' );
    }
  }

  var res_404 = {
    status: 404,
    headers: { "content-type": "text/html" },
    body: [ "<h1>404 Not Found</h1>" ]
  }

  return function( req ) {

    var conf,
        host = "host" in req.headers
             ? req.headers.host.replace( /:\d+$/, '')
             : req.host;

    if ( host in sites )
      conf = sites[ host ]
    else if ( def ) {
      conf = sites[ def ];
      host = def;
    }
    else
      return res_404;

    // App has requested to live under a non '/' root.
    // TODO: might want some way of specifying multiple apps under a single
    //       host. I don't need it now though.
    if ( conf.scriptName ) {
      var path = req.scriptName + req.pathInfo;
      if ( path.indexOf(conf.scriptName + "/") != 0 && path != conf.scriptName )
        // No match - 404!
        return res_404;

      req.scriptName = conf.scriptName;
      req.pathInfo = path.substr( conf.scriptName.length );
    }

    // Aaand finally, run the app
    return conf.app( req );
  }
}
