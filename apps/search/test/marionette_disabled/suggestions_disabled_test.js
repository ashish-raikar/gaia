'use strict';

var Rocketbar = require('../../../system/test/marionette/lib/rocketbar.js');
var Server = require('../../../../shared/test/integration/server');

marionette('Search - Suggestions disabled', function() {

  var client = marionette.client({
    profile: require(__dirname + '/client_options.js'),
    desiredCapabilities: { raisesAccessibilityExceptions: false }
  });
  var search, rocketbar, system, server;

  var providers;

  suiteSetup(function(done) {
    Server.create(__dirname + '/fixtures/', function(err, _server) {
      server = _server;
      done();
    });
  });

  setup(function() {
    system = client.loader.getAppClass('system');
    search = client.loader.getAppClass('search');
    rocketbar = new Rocketbar(client);
    system.waitForFullyLoaded();

    providers = {
      version: search.searchDataVersion(),
      providers: {
        'first': {
          title: 'first',
          searchUrl: server.url('sample.html'),
          suggestUrl: server.url('suggestions_one.json')
        },
        'second': {
          title: 'second',
          searchUrl: server.url('sample.html'),
          suggestUrl: server.url('suggestions_two.json')
        }
      }
    };

    client.settings.set('search.suggestions.enabled', false);
    client.settings.set('search.cache', providers);
    client.settings.set('search.provider', 'first');
  });

  test('Test switching suggestion provider', function() {

    rocketbar.homescreenFocus();
    search.triggerFirstRun(rocketbar);

    rocketbar.enterText('sometext');
    search.goToResults();
    client.waitFor(function() {
      return client.findElements(search.Selectors.suggestions).length === 1;
    });

    var select = search.switchProvidersSelect;
    client.helper.tapSelectOption(select, 'second');

    client.switchToFrame();
    search.goToResults();
    client.waitFor(function() {
      return client.findElements(search.Selectors.suggestions).length === 1;
    });
  });

});
