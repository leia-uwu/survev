webpackJsonp([0], {
  /***/
  "27uc": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: "<% if (loading) { %>\n    <!-- Loading game data -->\n    <div class=\"col-12 spinner-wrapper-match-data\">\n        <div class=\"spinner\"></div>\n    </div>\n<% } else if (error || !data || data.length == 0) {%>\n    <!-- Error loading data -->\n    <div class='col-lg-10'>\n        <div class='m-3'>Error loading content, please try again.</div>\n    </div>\n<% } else { %>\n    <div class='match-header-wrapper'>\n        <table class='match-table'>\n            <thead>\n                <tr class='match-headers'>\n                    <th class='match-header-rank' scope=\"col\" data-l10n='stats-rank' data-caps='true'>RANK</th>\n                    <th class='match-header-icon hide-xs' scope=\"col\"></th>\n                    <th class='match-header-player' scope=\"col\" data-l10n='stats-player' data-caps='true'>PLAYER</th>\n                    <th class='match-header-stat' scope=\"col\" data-l10n='stats-kills' data-caps='true'>KILLS</th>\n                    <th class='match-header-stat hide-xs' scope=\"col\" data-l10n='stats-damage' data-caps='true'>DAMAGE</th>\n                    <th class='match-header-stat' scope=\"col\" data-l10n='stats-survived' data-caps='true'>SURVIVED</th>\n                </tr>\n            </thead>\n        </table>\n    </div>\n    <div class='match-table-wrapper'>\n        <table class='match-table'>\n          <thead>\n              <tr class='match-headers'>\n                <th class='match-header-rank'></th>\n                <th class='match-header-icon hide-xs'></th>\n                <th class='match-header-player'></th>\n                <th class='match-header-stat'></th>\n                <th class='match-header-stat hide-xs'></th>\n                <th class='match-header-stat'></th>\n            </tr>\n          </thead>\n          <tbody class='match-values'>\n            <% var team_id = 0;\n               var teamIdx = 0; %>\n            <% for (var i = 0; i < data.length; i++) { %>\n                <%\n                    var d = data[i];\n                    var showRank = false;\n                    if (team_id != d.team_id) {\n                        team_id = d.team_id;\n                        teamIdx += 1;\n                        showRank = true;\n                    }\n                %>\n                <tr class='main single-player <%= teamIdx % 2 == 0 ? 'match-row-dark' : 'match-row-light' %> <%= d.player_id == localId ? 'match-row-local' : '' %>'>\n                    <% if (showRank) { %>\n                        <td class='data-rank' scope=\"row\">#<%= d.rank %></td>\n                    <% } else { %>\n                        <td></td>\n                    <% } %>\n                    <td class='data-player-status hide-xs'>\n                        <% if (localId != 0 && d.killer_id == localId) { %>\n                            <div class='player-icon player-kill'></div>\n                        <% } %>\n                        <% var killed_ids = d.killed_ids || []; %>\n                        <% for (var j = 0; j < killed_ids.length; j++) { %>\n                            <% if (localId != 0 && killed_ids[j] == localId) { %>\n                                <div class='player-icon player-death'></div>\n                                <% break %>\n                            <% } %>\n                        <% } %>\n                    </td>\n                    <td class='data-player-names'>\n                        <span class='player-name'>\n                        <% if (d.slug) { %>\n                            <a class='player-slug' href=\"/stats/<%= d.slug %>\"><%= d.username %></a>\n                        <% } else { %>\n                            <%= d.username %>\n                        <% } %>\n                        </span>\n                    </td>\n                    <td><%= d.kills %></td>\n                    <td class='hide-xs'><%= d.damage_dealt %></td>\n                    <td>\n                        <%\n                            var timeAlive = d.time_alive;\n                            var minutes = Math.floor(timeAlive / 60) % 60;\n                            var seconds = Math.floor(timeAlive) % 60;\n                            if (seconds < 10) {seconds = \"0\" + seconds};\n                            var timeSurv = '';\n                            timeSurv += minutes + ':';\n                            timeSurv += seconds;\n                        %>\n                        <%= timeSurv %>\n                    </td>\n\n                </tr>\n            <% } %>\n          </tbody>\n        </table>\n    </div>\n<% } %>\n",
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push("");
                      __stack.lineno = 1;
                      if (loading) {
                          buf.push('\n    <!-- Loading game data -->\n    <div class="col-12 spinner-wrapper-match-data">\n        <div class="spinner"></div>\n    </div>\n');
                          __stack.lineno = 6;
                      } else if (error || !data || data.length == 0) {
                          buf.push("\n    <!-- Error loading data -->\n    <div class='col-lg-10'>\n        <div class='m-3'>Error loading content, please try again.</div>\n    </div>\n");
                          __stack.lineno = 11;
                      } else {
                          buf.push("\n    <div class='match-header-wrapper'>\n        <table class='match-table'>\n            <thead>\n                <tr class='match-headers'>\n                    <th class='match-header-rank' scope=\"col\" data-l10n='stats-rank' data-caps='true'>RANK</th>\n                    <th class='match-header-icon hide-xs' scope=\"col\"></th>\n                    <th class='match-header-player' scope=\"col\" data-l10n='stats-player' data-caps='true'>PLAYER</th>\n                    <th class='match-header-stat' scope=\"col\" data-l10n='stats-kills' data-caps='true'>KILLS</th>\n                    <th class='match-header-stat hide-xs' scope=\"col\" data-l10n='stats-damage' data-caps='true'>DAMAGE</th>\n                    <th class='match-header-stat' scope=\"col\" data-l10n='stats-survived' data-caps='true'>SURVIVED</th>\n                </tr>\n            </thead>\n        </table>\n    </div>\n    <div class='match-table-wrapper'>\n        <table class='match-table'>\n          <thead>\n              <tr class='match-headers'>\n                <th class='match-header-rank'></th>\n                <th class='match-header-icon hide-xs'></th>\n                <th class='match-header-player'></th>\n                <th class='match-header-stat'></th>\n                <th class='match-header-stat hide-xs'></th>\n                <th class='match-header-stat'></th>\n            </tr>\n          </thead>\n          <tbody class='match-values'>\n            ");
                          __stack.lineno = 39;
                          var team_id = 0;
                          var teamIdx = 0;
                          buf.push("\n            ");
                          __stack.lineno = 41;
                          for (var i = 0; i < data.length; i++) {
                              buf.push("\n                ");
                              __stack.lineno = 42;
                              var d = data[i];
                              var showRank = false;
                              if (team_id != d.team_id) {
                                  team_id = d.team_id;
                                  teamIdx += 1;
                                  showRank = true;
                              }
                              buf.push("\n                <tr class='main single-player ", escape((__stack.lineno = 51,
                              teamIdx % 2 == 0 ? "match-row-dark" : "match-row-light")), " ", escape((__stack.lineno = 51,
                              d.player_id == localId ? "match-row-local" : "")), "'>\n                    ");
                              __stack.lineno = 52;
                              if (showRank) {
                                  buf.push("\n                        <td class='data-rank' scope=\"row\">#", escape((__stack.lineno = 53,
                                  d.rank)), "</td>\n                    ");
                                  __stack.lineno = 54;
                              } else {
                                  buf.push("\n                        <td></td>\n                    ");
                                  __stack.lineno = 56;
                              }
                              buf.push("\n                    <td class='data-player-status hide-xs'>\n                        ");
                              __stack.lineno = 58;
                              if (localId != 0 && d.killer_id == localId) {
                                  buf.push("\n                            <div class='player-icon player-kill'></div>\n                        ");
                                  __stack.lineno = 60;
                              }
                              buf.push("\n                        ");
                              __stack.lineno = 61;
                              var killed_ids = d.killed_ids || [];
                              buf.push("\n                        ");
                              __stack.lineno = 62;
                              for (var j = 0; j < killed_ids.length; j++) {
                                  buf.push("\n                            ");
                                  __stack.lineno = 63;
                                  if (localId != 0 && killed_ids[j] == localId) {
                                      buf.push("\n                                <div class='player-icon player-death'></div>\n                                ");
                                      __stack.lineno = 65;
                                      break;
                                      buf.push("\n                            ");
                                      __stack.lineno = 66;
                                  }
                                  buf.push("\n                        ");
                                  __stack.lineno = 67;
                              }
                              buf.push("\n                    </td>\n                    <td class='data-player-names'>\n                        <span class='player-name'>\n                        ");
                              __stack.lineno = 71;
                              if (d.slug) {
                                  buf.push("\n                            <a class='player-slug' href=\"/stats/", escape((__stack.lineno = 72,
                                  d.slug)), '">', escape((__stack.lineno = 72,
                                  d.username)), "</a>\n                        ");
                                  __stack.lineno = 73;
                              } else {
                                  buf.push("\n                            ", escape((__stack.lineno = 74,
                                  d.username)), "\n                        ");
                                  __stack.lineno = 75;
                              }
                              buf.push("\n                        </span>\n                    </td>\n                    <td>", escape((__stack.lineno = 78,
                              d.kills)), "</td>\n                    <td class='hide-xs'>", escape((__stack.lineno = 79,
                              d.damage_dealt)), "</td>\n                    <td>\n                        ");
                              __stack.lineno = 81;
                              var timeAlive = d.time_alive;
                              var minutes = Math.floor(timeAlive / 60) % 60;
                              var seconds = Math.floor(timeAlive) % 60;
                              if (seconds < 10) {
                                  seconds = "0" + seconds;
                              }
                              var timeSurv = "";
                              timeSurv += minutes + ":";
                              timeSurv += seconds;
                              buf.push("\n                        ", escape((__stack.lineno = 90,
                              timeSurv)), "\n                    </td>\n\n                </tr>\n            ");
                              __stack.lineno = 94;
                          }
                          buf.push("\n          </tbody>\n        </table>\n    </div>\n");
                          __stack.lineno = 98;
                      }
                      buf.push("\n");
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),

  /***/
  "2O6T": /***/
  (function(module, exports, __webpack_require__) {

      "use strict";

      var _extends = Object.assign || function(target) {
          for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source) {
                  if (Object.prototype.hasOwnProperty.call(source, key)) {
                      target[key] = source[key];
                  }
              }
          }
          return target;
      }
      ;

      var _createClass = function() {
          function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value"in descriptor)
                      descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
              }
          }
          return function(Constructor, protoProps, staticProps) {
              if (protoProps)
                  defineProperties(Constructor.prototype, protoProps);
              if (staticProps)
                  defineProperties(Constructor, staticProps);
              return Constructor;
          }
          ;
      }();

      function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
          }
      }

      __webpack_require__("BQpi");
      __webpack_require__("hqSh");
      var $ = __webpack_require__("juYr");
      var slugify = __webpack_require__("hfYK");
      var Localization = __webpack_require__("5tYD");
      var MainView = __webpack_require__("Daeg");
      var PlayerView = __webpack_require__("vIKM");
      var Router = __webpack_require__("rSE8");
      var device = __webpack_require__("fquI");

      var templates = {
          language: __webpack_require__("oHTN")
      };

      //
      // Config
      //

      var Config = function() {
          function Config() {
              _classCallCheck(this, Config);

              this.useLocalStorage = true;
              this.config = {};
              this.onModified = [];
          }

          _createClass(Config, [{
              key: 'load',
              value: function load() {
                  var storedConfig = {};
                  try {
                      storedConfig = JSON.parse(localStorage.getItem('surviv_config'));
                  } catch (err) {
                      this.useLocalStorage = false;
                  }
                  this.config = _extends({
                      language: 'en'
                  }, storedConfig);
              }
          }, {
              key: 'store',
              value: function store() {
                  if (this.useLocalStorage) {
                      // In browsers, like Safari, localStorage setItem is
                      // disabled in private browsing mode.
                      // This try/catch is here to handle that situation.
                      try {
                          localStorage.setItem('surviv_config', JSON.stringify(this.config));
                      } catch (e) {// Ignore
                      }
                  }
              }
          }, {
              key: 'set',
              value: function set(key, value) {
                  this.config[key] = value;
                  this.store();
              }
          }, {
              key: 'get',
              value: function get(key) {
                  return this.config[key];
              }
          }]);

          return Config;
      }();

      //
      // Ads
      //

      var Ads = function() {
          function Ads() {
              _classCallCheck(this, Ads);

              this.slotIdToPlacement = {
                  'survivio_728x90_leaderboard_top': 'survivio_728x90_leaderboard',
                  'survivio_300x250_leaderboard_top': 'survivio_300x250_leaderboard',
                  'survivio_300x250_leaderboard_bottom': 'survivio_300x250_leaderboard',
                  'survivio_728x90_playerprofile_top': 'survivio_728x90_playerprofile',
                  'survivio_300x250_playerprofile_top': 'survivio_300x250_playerprofile',
                  'survivio_300x250_playerprofile_bottom': 'survivio_300x250_playerprofile'
              };
          }

          _createClass(Ads, [{
              key: 'showFreestarAds',
              value: function showFreestarAds(slotIds) {}
          }, {
              key: 'getFreestarSlotPlacement',
              value: function getFreestarSlotPlacement(slotId) {}
          }]);

          return Ads;
      }();

      var App = function() {
          function App() {
              _classCallCheck(this, App);

              this.el = $('#content');
              this.mainView = new MainView(this);
              this.playerView = new PlayerView(this);
              var router = new Router(this);
              router.addRoute('player', 'stats/([^/?#]+).*$');
              router.addRoute('main', 'stats');

              $('#search-players').on('submit', function(e) {
                  e.preventDefault();
                  var name = $('#search-players :input').val();
                  var slug = slugify(name);
                  window.location.href = '/stats/' + slug;
              });

              // Load slug for "My Profile" link
              try {
                  var config = JSON.parse(localStorage.getItem('surviv_config'));
                  if (config.profile && config.profile.slug) {
                      $('#my-profile').css('display', 'block').attr('href', '/stats/' + config.profile.slug);
                  }
              } catch (err) {}
              // Ignore

              // Load config
              this.config = new Config();
              this.config.load();

              this.localization = new Localization();
              this.localization.setLocale(this.config.get('language'));
              this.localization.localizeIndex();

              this.adManager = new Ads();
          }

          _createClass(App, [{
              key: 'setView',
              value: function setView(name) {
                  var phoneDetected = device.mobile && !device.tablet;
                  var elAdsLeaderboardTop = $('#adsLeaderBoardTop');
                  var elAdsLeaderboardBottom = $('#adsLeaderBoardBottom');
                  var elAdsPlayerTop = $('#adsPlayerTop');
                  var elAdsPlayerBottom = $('#adsPlayerBottom');
                  var premiumPass = localStorage.getItem('premium');

                  if (name == 'player') {
                      elAdsLeaderboardTop.css('display', 'none');
                      elAdsLeaderboardBottom.css('display', 'none');
                      if (phoneDetected) {
                          elAdsPlayerTop.css('display', 'none');
                          elAdsPlayerBottom.css('display', 'block');
                      } else {
                          elAdsPlayerTop.css('display', 'block');
                          elAdsPlayerBottom.css('display', 'none');
                      }
                      this.view = this.playerView;
                  } else {
                      elAdsPlayerTop.css('display', 'none');
                      elAdsPlayerBottom.css('display', 'none');

                      if (phoneDetected) {
                          elAdsLeaderboardTop.css('display', 'none');
                          elAdsLeaderboardBottom.css('display', 'block');
                      } else {
                          elAdsLeaderboardTop.css('display', 'block');
                          elAdsLeaderboardBottom.css('display', 'none');
                      }
                      this.view = this.mainView;
                  }

                  // show ads
                  var slotIds = [];
                  if (elAdsLeaderboardTop && elAdsLeaderboardTop.css('display') != 'none' && premiumPass == 'false') {
                      slotIds.push('survivio_728x90_leaderboard_top');
                      slotIds.push('survivio_300x250_leaderboard_top');
                  }
                  if (elAdsLeaderboardBottom && elAdsLeaderboardBottom.css('display') != 'none' && premiumPass == 'false') {
                      slotIds.push('survivio_300x250_leaderboard_bottom');
                  }
                  if (elAdsPlayerTop && elAdsPlayerTop.css('display') != 'none' && premiumPass == 'false') {
                      slotIds.push('survivio_728x90_playerprofile_top');
                      slotIds.push('survivio_300x250_playerprofile_top');
                  }
                  if (elAdsPlayerBottom && elAdsPlayerBottom.css('display') != 'none' && premiumPass == 'false') {
                      slotIds.push('survivio_300x250_playerprofile_bottom');
                  }
                  this.adManager.showFreestarAds(slotIds, false);

                  this.view.load();
                  this.el.html(this.view.el);
                  this.render();
              }
          }, {
              key: 'render',
              value: function render() {
                  var _this = this;

                  $('#language-select').html(templates.language({
                      code: this.localization.getLocale()
                  }));
                  // Listen for changes in language select
                  $('.dropdown-language').off('click');
                  $('.dropdown-language').on('click', function(e) {
                      var el = e.target;
                      var code = $(el).attr('value');
                      var language = $(el).html();
                      if (code) {
                          // Set the config language
                          $('#selected-language').html(code.toUpperCase());
                          _this.localization.setLocale(code);
                          _this.localization.localizeIndex();
                          _this.config.set('language', code);
                      }
                  });
              }
          }]);

          return App;
      }();

      var app = new App();

      /***/
  }
  ),

  /***/
  "5tYD": /***/
  (function(module, exports, __webpack_require__) {

      "use strict";

      var $ = __webpack_require__("juYr");

      //
      // Localization functions
      //

      function Localization() {
          this.acceptedLocales = ['en', 'es'];
          this.translations = {};
          for (var i = 0; i < this.acceptedLocales.length; i++) {
              var locale = this.acceptedLocales[i];
              var translation = {};
              try {
                    var map = {
                      "./en.js": "VdSu",
                      "./es.js": "Iic8"
                  };
                  translation = __webpack_require__("gV60")("./" + locale + '.js');
              } catch (err) {
                  console.log('localization not found', locale);
              }
              this.translations[locale] = translation;
          }
          this.locale = 'en';
      }

      Localization.prototype = {
          setLocale: function setLocale(locale) {
              this.locale = this.acceptedLocales.indexOf(locale) != -1 ? locale : 'en';
          },

          getLocale: function getLocale() {
              return this.locale;
          },

          translate: function translate(key) {
              // Also try spaces as dashes
              var spacedKey = key.replace(' ', '-');
              return this.translations[this.locale][key] || this.translations[this.locale][spacedKey] || this.translations['en'][key] || '';
          },

          localizeIndex: function localizeIndex() {
              var _this = this;

              // Go through index and replace data-l10n tagged elements
              var localizedElements = $('*[data-l10n]');
              localizedElements.each(function(idx, el) {
                  var el$ = $(el);
                  var datal10n = el$.attr('data-l10n');
                  var localizedText = _this.translate(datal10n);
                  if (localizedText) {
                      if (el$.attr('data-caps') == 'true') {
                          localizedText = localizedText.toUpperCase();
                      }
                      if (el$.attr('label')) {
                          el$.attr('label', localizedText);
                          return true;
                      }
                      if (el$.attr('placeholder')) {
                          el$.attr('placeholder', localizedText);
                          return true;
                      }
                      el$.html(localizedText);
                      if (el$.attr('data-label')) {
                          el$.attr('data-label', localizedText);
                      }
                  }
              });
          }
      };

      module.exports = Localization;

      /***/
  }
  ),

  /***/
  "Daeg": /***/
  (function(module, exports, __webpack_require__) {

      "use strict";

      var _extends = Object.assign || function(target) {
          for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source) {
                  if (Object.prototype.hasOwnProperty.call(source, key)) {
                      target[key] = source[key];
                  }
              }
          }
          return target;
      }
      ;

      var _createClass = function() {
          function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value"in descriptor)
                      descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
              }
          }
          return function(Constructor, protoProps, staticProps) {
              if (protoProps)
                  defineProperties(Constructor.prototype, protoProps);
              if (staticProps)
                  defineProperties(Constructor, staticProps);
              return Constructor;
          }
          ;
      }();

      function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
          }
      }

      var $ = __webpack_require__("juYr");
      var device = __webpack_require__("fquI");
      var helpers = __webpack_require__("UiAd");
      var battletagCensoring = __webpack_require__("OH7J");

      var templates = {
          loading: __webpack_require__("fj+T"),
          main: __webpack_require__("L1J/"),
          leaderboard: __webpack_require__("IOkT"),
          leaderboardError: __webpack_require__("KPYC")
      };

      //
      // MainView
      //

      var MainView = function() {
          function MainView(app) {
              var _this = this;

              _classCallCheck(this, MainView);

              this.app = app;

              this.loading = false;
              this.error = false;
              this.data = {};

              this.el = $(templates.main({
                  phoneDetected: device.mobile && !device.tablet,
                  gameModes: helpers.getGameModes()
              }));

              this.el.find('.leaderboard-opt').change(function() {
                  _this.onChangedParams();
              });
          }

          _createClass(MainView, [{
              key: 'load',
              value: function load() {
                  var _this2 = this;

                  this.loading = true;
                  this.error = false;

                  // Supported args so far:
                  //   type:     most_kills, most_damage_dealt, kills, wins, kpg
                  //   interval: daily, weekly, alltime
                  //   teamMode: solo, duo, squad
                  //   maxCount: 10, 100
                  var type = helpers.getParameterByName('type') || 'most_kills';
                  var interval = helpers.getParameterByName('t') || 'daily';
                  var teamMode = helpers.getParameterByName('team') || 'solo';
                  var mapId = helpers.getParameterByName('mapId') || '0';
                  // Change to most_damage_dealt if faction mode and most_kills selected
                  if (type == 'most_kills' && mapId == 3) {
                      type = 'most_damage_dealt';
                  }
                  var maxCount = 100;

                  var args = {
                      type: type,
                      interval: interval,
                      teamMode: teamMode,
                      mapId: mapId,
                      maxCount: maxCount
                  };

                  $.ajax({
                      url: '/api/leaderboard',
                      type: 'POST',
                      data: JSON.stringify(args),
                      contentType: 'application/json; charset=utf-8',
                      success: function success(data, status, xhr) {
                          _this2.data = {
                              type: type,
                              interval: interval,
                              teamMode: teamMode,
                              mapId: mapId,
                              maxCount: maxCount,
                              data: data
                          };
                      },
                      error: function error(xhr, err) {
                          _this2.error = true;
                      },
                      complete: function complete() {
                          _this2.loading = false;
                          _this2.render();
                      }
                  });

                  this.render();
              }
          }, {
              key: 'onChangedParams',
              value: function onChangedParams() {
                  var type = $('#leaderboard-type').val();
                  var time = $('#leaderboard-time').val();
                  var teamMode = $('#leaderboard-team-mode').val();
                  var mapId = $('#leaderboard-map-id').val();
                  window.history.pushState('', '', '?type=' + type + '&team=' + teamMode + '&t=' + time + '&mapId=' + mapId);
                  this.load();
              }
          }, {
              key: 'render',
              value: function render() {
                  // Compute derived values
                  var kTypeToString = {
                      'most_kills': 'stats-most-kills',
                      'most_damage_dealt': 'stats-most-damage',
                      'kills': 'stats-total-kills',
                      'wins': 'stats-total-wins',
                      'kpg': 'stats-kpg'
                  };
                  // @TODO: Refactor shared leaderboard constants with app/src/db.js
                  var kMinGames = {
                      'kpg': {
                          'daily': 15,
                          'weekly': 50,
                          'alltime': 100
                      }
                  };

                  var content = '';
                  if (this.loading) {
                      content = templates.loading({
                          type: 'leaderboard'
                      });
                  } else if (this.error || !this.data.data) {
                      content = templates.leaderboardError();
                  } else {

                      for (var i = 0; i < this.data.data.length; i++) {
                          if (this.data.data[i].username) {
                              this.data.data[i].username = battletagCensoring.getCensoredBattletag(this.data.data[i].username);
                          } else if (this.data.data[i].usernames) {
                              this.data.data[i].usernames = this.data.data[i].usernames.map(battletagCensoring.getCensoredBattletag);
                          }

                          if (this.data.data[i].slug) {
                              this.data.data[i].slug = battletagCensoring.getCensoredBattletag(this.data.data[i].slug);
                          } else if (this.data.data[i].slugs) {
                              this.data.data[i].slugs = this.data.data[i].slugs.map(battletagCensoring.getCensoredBattletag);
                          }
                      }

                      var statName = kTypeToString[this.data.type] || '';
                      var minGames = kMinGames[this.data.type] ? kMinGames[this.data.type][this.data.interval] : 1;
                      minGames = minGames || 1;

                      content = templates.leaderboard(_extends({
                          statName: statName,
                          minGames: minGames
                      }, this.data));

                      // Set the select options
                      $('#leaderboard-team-mode').val(this.data.teamMode);
                      $('#leaderboard-map-id').val(this.data.mapId);
                      $('#leaderboard-type').val(this.data.type);
                      $('#leaderboard-time').val(this.data.interval);

                      // Disable most kills option if 50v50 selected
                      var factionMode = this.data.mapId == 3;
                      if (factionMode) {
                          $('#leaderboard-type option[value="most_kills"]').attr('disabled', 'disabled');
                      } else {
                          $('#leaderboard-type option[value="most_kills"]').removeAttr('disabled');
                      }
                  }

                  this.el.find('.content').html(content);
                  this.app.localization.localizeIndex();
              }
          }]);

          return MainView;
      }();

      module.exports = MainView;

      /***/
  }
  ),

  /***/
  "IOkT": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: "<table id='leaderboard-table'>\n  <thead>\n    <tr class='leaderboard-headers'>\n      <th class='header-rank' scope=\"col\" data-l10n='stats-rank' data-caps='true'>RANK</th>\n      <th class='header-player' scope=\"col\" data-l10n='stats-player' data-caps='true'>PLAYER</th>\n      <!--\n      <th class='header-active' scope=\"col\" data-l10n='stats-active' data-caps='true'>ACTIVE</th>\n      -->\n      <th class='header-stat' scope=\"col\" data-l10n='<%= statName %>' data-caps='true'>STAT</th>\n      <% if (type != 'most_kills' && type != 'win_streak') { %>\n          <th class='header-games' scope=\"col\" data-l10n='stats-games' data-caps='true'>GAMES (><%= minGames %>)</th>\n      <% } %>\n      <th class='header-region' scope=\"col\" data-l10n='stats-region' data-caps='true'>REGION</th>\n    </tr>\n  </thead>\n  <tbody class='leaderboard-values'>\n    <% for (var i = 0; i < data.length; i++) { %>\n      <% if (Array.isArray(data[i].slugs)) { %>\n        <tr class='main multiple-players'>\n          <td class='data-rank' scope=\"row\">#<%= i + 1 %></td>\n          <td class='data-player-names'>\n            <% for (var j = 0; j < data[i].slugs.length; j++) { %>\n              <span class='player-name'>\n              <% if (data[i].slugs[j]) { %>\n                  <a href=\"/stats/<%= data[i].slugs[j] %>\"><%= data[i].usernames[j] %></a>\n              <% } else { %>\n                  <%= data[i].usernames[j] %>\n              <% } %>\n              </span>\n            <% } %>\n          </td>\n          <td><%= data[i].val %></td>\n          <td><%= data[i].region ? data[i].region.toUpperCase() : '' %></td>\n          <!--\n          <td class='<%= data[i].active ? 'active' : 'inactive' %>'></td>\n          -->\n        </tr>\n      <% } else { %>\n        <tr class='main single-player'>\n          <td class='data-rank' scope=\"row\">#<%= i + 1 %></td>\n          <td class='data-player-names'>\n            <span class='player-name'>\n            <% if (data[i].slug) { %>\n                <a href=\"/stats/<%= data[i].slug%>\"><%= data[i].username %></a>\n            <% } else { %>\n                <%= data[i].username %>\n            <% } %>\n            </span>\n          </td>\n          <!--\n          <td class='<%= data[i].active ? 'active' : 'inactive' %>'></td>\n          -->\n          <td><%= data[i].val %></td>\n          <% if (type != 'most_kills' && type != 'win_streak') { %>\n              <td><%= data[i].games %></td>\n          <% } %>\n          <td class='data-region'><%= data[i].region ? data[i].region.toUpperCase() : '' %></td>\n        </tr>\n      <% } %>\n    <% } %>\n  </tbody>\n</table>\n",
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push("<table id='leaderboard-table'>\n  <thead>\n    <tr class='leaderboard-headers'>\n      <th class='header-rank' scope=\"col\" data-l10n='stats-rank' data-caps='true'>RANK</th>\n      <th class='header-player' scope=\"col\" data-l10n='stats-player' data-caps='true'>PLAYER</th>\n      <!--\n      <th class='header-active' scope=\"col\" data-l10n='stats-active' data-caps='true'>ACTIVE</th>\n      -->\n      <th class='header-stat' scope=\"col\" data-l10n='", escape((__stack.lineno = 9,
                      statName)), "' data-caps='true'>STAT</th>\n      ");
                      __stack.lineno = 10;
                      if (type != "most_kills" && type != "win_streak") {
                          buf.push("\n          <th class='header-games' scope=\"col\" data-l10n='stats-games' data-caps='true'>GAMES (>", escape((__stack.lineno = 11,
                          minGames)), ")</th>\n      ");
                          __stack.lineno = 12;
                      }
                      buf.push("\n      <th class='header-region' scope=\"col\" data-l10n='stats-region' data-caps='true'>REGION</th>\n    </tr>\n  </thead>\n  <tbody class='leaderboard-values'>\n    ");
                      __stack.lineno = 17;
                      for (var i = 0; i < data.length; i++) {
                          buf.push("\n      ");
                          __stack.lineno = 18;
                          if (Array.isArray(data[i].slugs)) {
                              buf.push("\n        <tr class='main multiple-players'>\n          <td class='data-rank' scope=\"row\">#", escape((__stack.lineno = 20,
                              i + 1)), "</td>\n          <td class='data-player-names'>\n            ");
                              __stack.lineno = 22;
                              for (var j = 0; j < data[i].slugs.length; j++) {
                                  buf.push("\n              <span class='player-name'>\n              ");
                                  __stack.lineno = 24;
                                  if (data[i].slugs[j]) {
                                      buf.push('\n                  <a href="/stats/', escape((__stack.lineno = 25,
                                      data[i].slugs[j])), '">', escape((__stack.lineno = 25,
                                      data[i].usernames[j])), "</a>\n              ");
                                      __stack.lineno = 26;
                                  } else {
                                      buf.push("\n                  ", escape((__stack.lineno = 27,
                                      data[i].usernames[j])), "\n              ");
                                      __stack.lineno = 28;
                                  }
                                  buf.push("\n              </span>\n            ");
                                  __stack.lineno = 30;
                              }
                              buf.push("\n          </td>\n          <td>", escape((__stack.lineno = 32,
                              data[i].val)), "</td>\n          <td>", escape((__stack.lineno = 33,
                              data[i].region ? data[i].region.toUpperCase() : "")), "</td>\n          <!--\n          <td class='", escape((__stack.lineno = 35,
                              data[i].active ? "active" : "inactive")), "'></td>\n          -->\n        </tr>\n      ");
                              __stack.lineno = 38;
                          } else {
                              buf.push("\n        <tr class='main single-player'>\n          <td class='data-rank' scope=\"row\">#", escape((__stack.lineno = 40,
                              i + 1)), "</td>\n          <td class='data-player-names'>\n            <span class='player-name'>\n            ");
                              __stack.lineno = 43;
                              if (data[i].slug) {
                                  buf.push('\n                <a href="/stats/', escape((__stack.lineno = 44,
                                  data[i].slug)), '">', escape((__stack.lineno = 44,
                                  data[i].username)), "</a>\n            ");
                                  __stack.lineno = 45;
                              } else {
                                  buf.push("\n                ", escape((__stack.lineno = 46,
                                  data[i].username)), "\n            ");
                                  __stack.lineno = 47;
                              }
                              buf.push("\n            </span>\n          </td>\n          <!--\n          <td class='", escape((__stack.lineno = 51,
                              data[i].active ? "active" : "inactive")), "'></td>\n          -->\n          <td>", escape((__stack.lineno = 53,
                              data[i].val)), "</td>\n          ");
                              __stack.lineno = 54;
                              if (type != "most_kills" && type != "win_streak") {
                                  buf.push("\n              <td>", escape((__stack.lineno = 55,
                                  data[i].games)), "</td>\n          ");
                                  __stack.lineno = 56;
                              }
                              buf.push("\n          <td class='data-region'>", escape((__stack.lineno = 57,
                              data[i].region ? data[i].region.toUpperCase() : "")), "</td>\n        </tr>\n      ");
                              __stack.lineno = 59;
                          }
                          buf.push("\n    ");
                          __stack.lineno = 60;
                      }
                      buf.push("\n  </tbody>\n</table>\n");
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),

  /***/
  "KPYC": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: '<div class="leaderboard-error">\n    <h2>Unable to load, please try again.</h2>\n</div>\n',
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push('<div class="leaderboard-error">\n    <h2>Unable to load, please try again.</h2>\n</div>\n');
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),

  /***/
  "L1J/": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: '\n<!-- Overview Card -->\n<div class="container mt-3">\n  <div class="card card-leaderboard col-lg-8 col-12 p-0">\n    <div class="card-body">\n      <div class=\'row card-row-top\'>\n        <div class=\'col-12\'>\n          <div class="leaderboard-title ml-sm-3 ml-0 mr-0 mt-3" data-l10n=\'index-leaderboards\' data-caps=\'true\'>LEADERBOARDS</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- Mode selectors -->\n<div class=\'container mt-3\'>\n  <div class="row">\n    <div class=\'col-lg-2 col-3 pr-lg-3 pr-1\'>\n      <select id="leaderboard-team-mode" class="leaderboard-opt custom-select">\n        <option value="solo" data-l10n=\'stats-solo\'>Solo</option>\n        <option value="duo" data-l10n=\'stats-duo\'>Duo</option>\n        <option value="squad" data-l10n=\'stats-squad\'>Squad</option>\n      </select>\n    </div>\n    <div class=\'col-lg-2 col-3 pl-lg-0 pr-lg-3 pl-0 pr-1\'>\n      <select id="leaderboard-type" class="leaderboard-opt custom-select">\n        <option value="most_kills" data-l10n=\'stats-most-kills\'>Most kills</option>\n        <option value="most_damage_dealt" data-l10n=\'stats-most-damage\'>Most damage</option>\n        <option value="kpg" data-l10n=\'stats-kpg-full\'>Kills per game</option>\n        <option value="kills" data-l10n=\'stats-total-kills\'>Total kills</option>\n        <option value="wins" data-l10n=\'stats-total-wins\'>Total wins</option>\n      </select>\n    </div>\n    <div class=\'col-lg-2 col-3 pl-lg-0 pr-lg-3 pl-0 pr-1\'>\n      <select id="leaderboard-time" class="leaderboard-opt custom-select">\n        <option value="daily" data-l10n=\'stats-today\'>Today</option>\n        <option value="weekly" data-l10n=\'stats-this-week\'>This week</option>\n        <option value="alltime" data-l10n=\'stats-all-time\'>All time</option>\n      </select>\n    </div>\n    <div class=\'col-lg-2 col-3 pl-0\'>\n      <select id="leaderboard-map-id" class="leaderboard-opt custom-select">\n        <% for (var i = 0; i < gameModes.length; i++) { %>\n          <option value="<%= gameModes[i].mapId %>"><%= gameModes[i].desc.name%></option>\n        <% } %>\n      </select>\n    </div>\n  </div>\n</div>\n\n<div class=\'container mt-2 mb-4 p-sm-3 p-0\'>\n  <div class="row justify-content-center">\n    <div class="col-md-12">\n      <div class="content"></div>\n    </div>\n  </div>\n</div>\n',
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push('\n<!-- Overview Card -->\n<div class="container mt-3">\n  <div class="card card-leaderboard col-lg-8 col-12 p-0">\n    <div class="card-body">\n      <div class=\'row card-row-top\'>\n        <div class=\'col-12\'>\n          <div class="leaderboard-title ml-sm-3 ml-0 mr-0 mt-3" data-l10n=\'index-leaderboards\' data-caps=\'true\'>LEADERBOARDS</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- Mode selectors -->\n<div class=\'container mt-3\'>\n  <div class="row">\n    <div class=\'col-lg-2 col-3 pr-lg-3 pr-1\'>\n      <select id="leaderboard-team-mode" class="leaderboard-opt custom-select">\n        <option value="solo" data-l10n=\'stats-solo\'>Solo</option>\n        <option value="duo" data-l10n=\'stats-duo\'>Duo</option>\n        <option value="squad" data-l10n=\'stats-squad\'>Squad</option>\n      </select>\n    </div>\n    <div class=\'col-lg-2 col-3 pl-lg-0 pr-lg-3 pl-0 pr-1\'>\n      <select id="leaderboard-type" class="leaderboard-opt custom-select">\n        <option value="most_kills" data-l10n=\'stats-most-kills\'>Most kills</option>\n        <option value="most_damage_dealt" data-l10n=\'stats-most-damage\'>Most damage</option>\n        <option value="kpg" data-l10n=\'stats-kpg-full\'>Kills per game</option>\n        <option value="kills" data-l10n=\'stats-total-kills\'>Total kills</option>\n        <option value="wins" data-l10n=\'stats-total-wins\'>Total wins</option>\n      </select>\n    </div>\n    <div class=\'col-lg-2 col-3 pl-lg-0 pr-lg-3 pl-0 pr-1\'>\n      <select id="leaderboard-time" class="leaderboard-opt custom-select">\n        <option value="daily" data-l10n=\'stats-today\'>Today</option>\n        <option value="weekly" data-l10n=\'stats-this-week\'>This week</option>\n        <option value="alltime" data-l10n=\'stats-all-time\'>All time</option>\n      </select>\n    </div>\n    <div class=\'col-lg-2 col-3 pl-0\'>\n      <select id="leaderboard-map-id" class="leaderboard-opt custom-select">\n        ');
                      __stack.lineno = 43;
                      for (var i = 0; i < gameModes.length; i++) {
                          buf.push('\n          <option value="', escape((__stack.lineno = 44,
                          gameModes[i].mapId)), '">', escape((__stack.lineno = 44,
                          gameModes[i].desc.name)), "</option>\n        ");
                          __stack.lineno = 45;
                      }
                      buf.push('\n      </select>\n    </div>\n  </div>\n</div>\n\n<div class=\'container mt-2 mb-4 p-sm-3 p-0\'>\n  <div class="row justify-content-center">\n    <div class="col-md-12">\n      <div class="content"></div>\n    </div>\n  </div>\n</div>\n');
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),


  /***/
  "OH7J": /***/
  (function(module, exports, __webpack_require__) {

      "use strict";

      var EnJs = __webpack_require__("rwx0");

      // Remove some charmap translations from the default slug options
      var remove = [// currency
      '€', '₢', '₣', '£', '₤', '₥', '₦', '₧', '₨', '₩', '₪', '₫', '₭', '₮', '₯', '₰', '₱', '₲', '₳', '₴', '₵', '¢', '¥', '元', '円', '﷼', '₠', '¤', '฿', "$", '₹', // symbols
      '©', '∑', '®', '∆', '∞', '♥', '&', '|', '<', '>'];

      function getCensoredBattletag(content) {
          if (content) {
              var words = EnJs.words;

              var asterisk = '*';

              var re = new RegExp(words.join('|'),'ig');
              var newString = content.replace(re, function(matched) {
                  return asterisk.repeat(matched.length);
              });

              return newString;
          }
          return content;
      }

      module.exports = {
          getCensoredBattletag: getCensoredBattletag
      };

      /***/
  }
  ),

  /***/
  "RGMZ": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: '<div class="col-12 p-lg-3 p-0">\n  <div class="content"></div>\n</div>',
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push('<div class="col-12 p-lg-3 p-0">\n  <div class="content"></div>\n</div>');
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),

  /***/
  "UiAd": /***/
  (function(module, exports, __webpack_require__) {

      "use strict";

      var MapDefs = __webpack_require__("sfa6");

      var helpers = {
          getParameterByName: function getParameterByName(name, url) {
              if (!url)
                  url = window.location.href;
              name = name.replace(/[[\]]/g, "\\$&");
              var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
                , results = regex.exec(url);
              if (!results)
                  return undefined;
              if (!results[2])
                  return '';
              return decodeURIComponent(results[2].replace(/\+/g, " "));
          },

          getGameModes: function getGameModes() {
              var gameModes = [];

              // Gather unique mapIds and assosciated map descriptions from the list of maps
              var mapKeys = Object.keys(MapDefs);

              var _loop = function _loop(i) {
                  var mapKey = mapKeys[i];
                  var mapDef = MapDefs[mapKey];

                  if (!gameModes.find(function(x) {
                      return x.mapId == mapDef.mapId;
                  })) {
                      gameModes.push({
                          mapId: mapDef.mapId,
                          desc: mapDef.desc
                      });
                  }
              };

              for (var i = 0; i < mapKeys.length; i++) {
                  _loop(i);
              }

              gameModes.sort(function(a, b) {
                  return a.mapId - b.mapId;
              });

              return gameModes;
          }
      };

      module.exports = helpers;

      /***/
  }
  ),

  /***/
  "cZoj": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: "<div class='header-extra'>MATCH HISTORY</div>\n  <% if (error) { %>\n    <div class='col-lg-10'>\n      <div class=\"m-3\">Error loading content, please try again.</div>\n    </div>\n  <% } else if (games.length == 0) { %>\n    <div class='col-lg-10'>\n      <div class=\"m-3\">No recent games played.</div>\n    </div>\n  <% } else { %>\n    <div class='col-lg-12'>\n        <% for (var i = 0; i < games.length; i++) { %>\n\n            <div class='row row-match match-link js-match-data <%= games[i].expanded ? 'match-link-expanded' : '' %>' data-game-id='<%= games[i].summary.guid %>'>\n                <div class='match-link-mode-color match-link-mode-<%= games[i].summary.team_mode %>'></div>\n                <div class='hide-xs col-2'>\n                    <div class='match-link-player-icons'>\n                        <% for (var j = 0; j < games[i].summary.team_count; j++) { %>\n                            <div class='match-link-player-icon'></div>\n                        <% } %>\n                    </div>\n                    <div class='match-link-start-time'>\n                        <%\n                            var timeDiff = '';\n                            var timeStart = new Date(games[i].summary.end_time);\n                            var now = Date.now();\n                            var secondsPast = (now - timeStart.getTime()) / 1000;\n                            if (secondsPast < 3600) {\n                                var minutes = Math.round(secondsPast/60);\n                                timeDiff = minutes < 2 ? '1 minute ago' : minutes + ' minutes ago';\n                            } else if (secondsPast <= 86400) {\n                                var hours = Math.round(secondsPast/3600);\n                                timeDiff = hours == 1 ? 'an hour ago' : hours + ' hours ago';\n                            } else if (secondsPast > 86400 && secondsPast < 172800) {\n                                timeDiff = Math.floor(secondsPast/86400) + ' day ago';\n                            } else if (secondsPast > 86400) {\n                                timeDiff = Math.floor(secondsPast/86400) + ' days ago';\n                            }\n                        %>\n                        <%= timeDiff %>\n                    </div>\n                </div>\n                <div class='col-3'>\n                    <div class='match-link-stat'>\n                        <%\n                            var modeText = games[i].summary.team_mode;\n                            modeText = modeText.charAt(0).toUpperCase() + modeText.slice(1);\n                        %>\n                        <div class='match-link-stat-name match-link-stat-name-lg'><%= modeText %> Rank</div>\n                        <div class='match-link-stat-value match-link-stat-value-lg'>\n                            <span class='match-link-stat-rank match-link-stat-<%= games[i].summary.rank %>'>#<%= games[i].summary.rank %></span>\n                            /<%= games[i].summary.team_total || 80 %>\n                        </div>\n                    </div>\n                </div>\n                <div class='col-2 col-md-1'>\n                    <div class='match-link-stat'>\n                        <div class='match-link-stat-name match-link-stat-name-md'>Kills</div>\n                        <div class='match-link-stat-value match-link-stat-value-md'><%= games[i].summary.kills %></div>\n                    </div>\n                </div>\n                <% if (games[i].summary.team_mode != 'solo') { %>\n                    <div class='hide-xs col-md-1'>\n                        <div class='match-link-stat'>\n                            <div class='match-link-stat-name match-link-stat-name-md'>Team Kills</div>\n                            <div class='match-link-stat-value match-link-stat-value-md'><%= games[i].summary.team_kills || 0 %></div>\n                        </div>\n                    </div>\n                <% } %>\n                <div class='col-2 col-md-1 <%= games[i].summary.team_mode == 'solo' ? 'offset-md-1' : '' %>'>\n                    <div class='match-link-stat'>\n                        <div class='match-link-stat-name match-link-stat-name-md'>Damage Dealt</div>\n                        <div class='match-link-stat-value match-link-stat-value-md'><%= games[i].summary.damage_dealt %></div>\n                    </div>\n                </div>\n                <div class='col-2 col-md-1'>\n                    <div class='match-link-stat'>\n                        <div class='match-link-stat-name match-link-stat-name-md'>Damage Taken</div>\n                        <div class='match-link-stat-value match-link-stat-value-md'><%= games[i].summary.damage_taken %></div>\n                    </div>\n                </div>\n                <div class='col-2 col-md-1'>\n                    <div class='match-link-stat'>\n                        <div class='match-link-stat-name match-link-stat-name-md'>Survived</div>\n                        <div class='match-link-stat-value match-link-stat-value-md'>\n                            <%\n                                var timeAlive = games[i].summary.time_alive;\n                                var minutes = Math.floor(timeAlive / 60) % 60;\n                                var seconds = Math.floor(timeAlive) % 60;\n                                if (seconds < 10) {seconds = \"0\" + seconds};\n                                var timeSurv = '';\n                                timeSurv += minutes + ':';\n                                timeSurv += seconds;\n                            %>\n                            <%= timeSurv %>\n                        </div>\n                    </div>\n                </div>\n                <!-- Game mode icon -->\n                <div class='hide-xs col-md-1'>\n                  <% if (games[i].summary.icon) { %>\n                    <div class='match-link-stat'>\n                        <div class='game-mode-icon' style='background-image: url(/<%= games[i].summary.icon %>)'></div>\n                    </div>\n                  <% } %>\n                </div>\n                <!-- Expand/Unexpand icon -->\n                <div class='offset-0 col-1 pl-0 pr-0'>\n                    <div class='match-link-expand <%= games[i].expanded ? 'match-link-expand-up' : 'match-link-expand-down' %>'>\n                    </div>\n                </div>\n\n                <% if (games[i].expanded) { %>\n                    <div id='match-data' class='col-lg-12'>\n                        <!-- match-data.ejs -->\n                    </div>\n                <% } %>\n            </div>\n        <% } %>\n    </div>\n    <% if (moreGamesAvailable) { %>\n        <% if (loading) { %>\n            <!-- Loading more games -->\n            <div class=\"col-12 spinner-wrapper-match-data\">\n                <div class=\"spinner\"></div>\n            </div>\n        <% } else { %>\n            <div class='col-12 js-match-load-more btn-darken'>More</div>\n        <% } %>\n    <% } %>\n  <% } %>\n</div>\n",
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push("<div class='header-extra'>MATCH HISTORY</div>\n  ");
                      __stack.lineno = 2;
                      if (error) {
                          buf.push("\n    <div class='col-lg-10'>\n      <div class=\"m-3\">Error loading content, please try again.</div>\n    </div>\n  ");
                          __stack.lineno = 6;
                      } else if (games.length == 0) {
                          buf.push("\n    <div class='col-lg-10'>\n      <div class=\"m-3\">No recent games played.</div>\n    </div>\n  ");
                          __stack.lineno = 10;
                      } else {
                          buf.push("\n    <div class='col-lg-12'>\n        ");
                          __stack.lineno = 12;
                          for (var i = 0; i < games.length; i++) {
                              buf.push("\n\n            <div class='row row-match match-link js-match-data ", escape((__stack.lineno = 14,
                              games[i].expanded ? "match-link-expanded" : "")), "' data-game-id='", escape((__stack.lineno = 14,
                              games[i].summary.guid)), "'>\n                <div class='match-link-mode-color match-link-mode-", escape((__stack.lineno = 15,
                              games[i].summary.team_mode)), "'></div>\n                <div class='hide-xs col-2'>\n                    <div class='match-link-player-icons'>\n                        ");
                              __stack.lineno = 18;
                              for (var j = 0; j < games[i].summary.team_count; j++) {
                                  buf.push("\n                            <div class='match-link-player-icon'></div>\n                        ");
                                  __stack.lineno = 20;
                              }
                              buf.push("\n                    </div>\n                    <div class='match-link-start-time'>\n                        ");
                              __stack.lineno = 23;
                              var timeDiff = "";
                              var timeStart = new Date(games[i].summary.end_time);
                              var now = Date.now();
                              var secondsPast = (now - timeStart.getTime()) / 1e3;
                              if (secondsPast < 3600) {
                                  var minutes = Math.round(secondsPast / 60);
                                  timeDiff = minutes < 2 ? "1 minute ago" : minutes + " minutes ago";
                              } else if (secondsPast <= 86400) {
                                  var hours = Math.round(secondsPast / 3600);
                                  timeDiff = hours == 1 ? "an hour ago" : hours + " hours ago";
                              } else if (secondsPast > 86400 && secondsPast < 172800) {
                                  timeDiff = Math.floor(secondsPast / 86400) + " day ago";
                              } else if (secondsPast > 86400) {
                                  timeDiff = Math.floor(secondsPast / 86400) + " days ago";
                              }
                              buf.push("\n                        ", escape((__stack.lineno = 40,
                              timeDiff)), "\n                    </div>\n                </div>\n                <div class='col-3'>\n                    <div class='match-link-stat'>\n                        ");
                              __stack.lineno = 45;
                              var modeText = games[i].summary.team_mode;
                              modeText = modeText.charAt(0).toUpperCase() + modeText.slice(1);
                              buf.push("\n                        <div class='match-link-stat-name match-link-stat-name-lg'>", escape((__stack.lineno = 49,
                              modeText)), " Rank</div>\n                        <div class='match-link-stat-value match-link-stat-value-lg'>\n                            <span class='match-link-stat-rank match-link-stat-", escape((__stack.lineno = 51,
                              games[i].summary.rank)), "'>#", escape((__stack.lineno = 51,
                              games[i].summary.rank)), "</span>\n                            /", escape((__stack.lineno = 52,
                              games[i].summary.team_total || 80)), "\n                        </div>\n                    </div>\n                </div>\n                <div class='col-2 col-md-1'>\n                    <div class='match-link-stat'>\n                        <div class='match-link-stat-name match-link-stat-name-md'>Kills</div>\n                        <div class='match-link-stat-value match-link-stat-value-md'>", escape((__stack.lineno = 59,
                              games[i].summary.kills)), "</div>\n                    </div>\n                </div>\n                ");
                              __stack.lineno = 62;
                              if (games[i].summary.team_mode != "solo") {
                                  buf.push("\n                    <div class='hide-xs col-md-1'>\n                        <div class='match-link-stat'>\n                            <div class='match-link-stat-name match-link-stat-name-md'>Team Kills</div>\n                            <div class='match-link-stat-value match-link-stat-value-md'>", escape((__stack.lineno = 66,
                                  games[i].summary.team_kills || 0)), "</div>\n                        </div>\n                    </div>\n                ");
                                  __stack.lineno = 69;
                              }
                              buf.push("\n                <div class='col-2 col-md-1 ", escape((__stack.lineno = 70,
                              games[i].summary.team_mode == "solo" ? "offset-md-1" : "")), "'>\n                    <div class='match-link-stat'>\n                        <div class='match-link-stat-name match-link-stat-name-md'>Damage Dealt</div>\n                        <div class='match-link-stat-value match-link-stat-value-md'>", escape((__stack.lineno = 73,
                              games[i].summary.damage_dealt)), "</div>\n                    </div>\n                </div>\n                <div class='col-2 col-md-1'>\n                    <div class='match-link-stat'>\n                        <div class='match-link-stat-name match-link-stat-name-md'>Damage Taken</div>\n                        <div class='match-link-stat-value match-link-stat-value-md'>", escape((__stack.lineno = 79,
                              games[i].summary.damage_taken)), "</div>\n                    </div>\n                </div>\n                <div class='col-2 col-md-1'>\n                    <div class='match-link-stat'>\n                        <div class='match-link-stat-name match-link-stat-name-md'>Survived</div>\n                        <div class='match-link-stat-value match-link-stat-value-md'>\n                            ");
                              __stack.lineno = 86;
                              var timeAlive = games[i].summary.time_alive;
                              var minutes = Math.floor(timeAlive / 60) % 60;
                              var seconds = Math.floor(timeAlive) % 60;
                              if (seconds < 10) {
                                  seconds = "0" + seconds;
                              }
                              var timeSurv = "";
                              timeSurv += minutes + ":";
                              timeSurv += seconds;
                              buf.push("\n                            ", escape((__stack.lineno = 95,
                              timeSurv)), "\n                        </div>\n                    </div>\n                </div>\n                <!-- Game mode icon -->\n                <div class='hide-xs col-md-1'>\n                  ");
                              __stack.lineno = 101;
                              if (games[i].summary.icon) {
                                  buf.push("\n                    <div class='match-link-stat'>\n                        <div class='game-mode-icon' style='background-image: url(/", escape((__stack.lineno = 103,
                                  games[i].summary.icon)), ")'></div>\n                    </div>\n                  ");
                                  __stack.lineno = 105;
                              }
                              buf.push("\n                </div>\n                <!-- Expand/Unexpand icon -->\n                <div class='offset-0 col-1 pl-0 pr-0'>\n                    <div class='match-link-expand ", escape((__stack.lineno = 109,
                              games[i].expanded ? "match-link-expand-up" : "match-link-expand-down")), "'>\n                    </div>\n                </div>\n\n                ");
                              __stack.lineno = 113;
                              if (games[i].expanded) {
                                  buf.push("\n                    <div id='match-data' class='col-lg-12'>\n                        <!-- match-data.ejs -->\n                    </div>\n                ");
                                  __stack.lineno = 117;
                              }
                              buf.push("\n            </div>\n        ");
                              __stack.lineno = 119;
                          }
                          buf.push("\n    </div>\n    ");
                          __stack.lineno = 121;
                          if (moreGamesAvailable) {
                              buf.push("\n        ");
                              __stack.lineno = 122;
                              if (loading) {
                                  buf.push('\n            <!-- Loading more games -->\n            <div class="col-12 spinner-wrapper-match-data">\n                <div class="spinner"></div>\n            </div>\n        ');
                                  __stack.lineno = 127;
                              } else {
                                  buf.push("\n            <div class='col-12 js-match-load-more btn-darken'>More</div>\n        ");
                                  __stack.lineno = 129;
                              }
                              buf.push("\n    ");
                              __stack.lineno = 130;
                          }
                          buf.push("\n  ");
                          __stack.lineno = 131;
                      }
                      buf.push("\n</div>\n");
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),

  /***/
  "fj+T": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: '<% switch (type) {\n    case \'leaderboard\': %>\n        <div class="col-12 spinner-wrapper-leaderboard">\n            <div class="spinner"></div>\n        </div>\n    <% break; %>\n    <% case \'player\': %>\n        <div class=\'container\'>\n            <div class="col-12 spinner-wrapper-player">\n                <div class="spinner"></div>\n            </div>\n        </div>\n    <% break; %>\n    <% case \'match_history\': %>\n        <div class="col-12 spinner-wrapper-match-history">\n            <div class="spinner"></div>\n        </div>\n    <% break; %>\n<% } %>\n',
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push("");
                      __stack.lineno = 1;
                      switch (type) {
                      case "leaderboard":
                          buf.push('\n        <div class="col-12 spinner-wrapper-leaderboard">\n            <div class="spinner"></div>\n        </div>\n    ');
                          __stack.lineno = 6;
                          break;
                          buf.push("\n    ");
                          __stack.lineno = 7;
                      case "player":
                          buf.push('\n        <div class=\'container\'>\n            <div class="col-12 spinner-wrapper-player">\n                <div class="spinner"></div>\n            </div>\n        </div>\n    ');
                          __stack.lineno = 13;
                          break;
                          buf.push("\n    ");
                          __stack.lineno = 14;
                      case "match_history":
                          buf.push('\n        <div class="col-12 spinner-wrapper-match-history">\n            <div class="spinner"></div>\n        </div>\n    ');
                          __stack.lineno = 18;
                          break;
                          buf.push("\n");
                          __stack.lineno = 19;
                      }
                      buf.push("\n");
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),

  /***/
  "fquI": /***/
  (function(module, exports, __webpack_require__) {

      "use strict";

      function detectMobile() {
          var isMobile = false;
          (function(a) {
              if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4)))
                  isMobile = true;
          }
          )(navigator.userAgent || navigator.vendor || window.opera);
          return isMobile;
      }

      function detectTablet() {
          // https://github.com/PoeHaH/devicedetector/blob/master/devicedetector-production.js
          var isTablet = false;
          var ua = navigator.userAgent.toLowerCase();
          (function(a) {
              if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua))
                  isTablet = true;
          }
          )(navigator.userAgent || navigator.vendor || window.opera);
          return isTablet;
      }

      var mobile = detectMobile();
      var tablet = detectTablet();

      var Layout = {
          Lg: 0,
          Sm: 1
      };

      var device = {
          Layout: Layout,
          debug: false,
          dev: "production" === 'dev',
          pixelRatio: window.devicePixelRatio,
          layout: mobile ? Layout.Sm : Layout.Lg,
          mobile: mobile,
          tablet: tablet,
          touch: mobile
      };

      module.exports = device;

      /***/
  }
  ),

  /***/
  "nDwx": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: "<!-- Overview Card -->\n<div class=\"container mt-3\">\n  <div class=\"card card-player col-lg-8 col-12 p-0\">\n    <div class=\"card-body\">\n      <div class='row card-row-top'>\n\n        <% if (error) { %>\n          <div class='col-lg-10'>\n            <div class=\"card-player-name mt-3 ml-3\">Error loading content, please try again.</div>\n          </div>\n        <% } else if (!profile.username) { %>\n          <div class='col-lg-10'>\n            <div class=\"card-player-name mt-3 ml-3\">That player doesn't exist.</div>\n          </div>\n        <% } else { %>\n          <div class='col-md-1 col-sm-2 col-3'>\n              <div class='player-image' style='background-image: url(\"<%= profile.avatarTexture %>\")'></div>\n          </div>\n          <div class='col-md-5 col-sm-10 col-9'>\n            <% if (profile.banned) { %>\n              <div class=\"card-player-banned ml-md-5 ml-sm-1 ml-xs-1\">(Banned)</div>\n              <div class=\"card-player-name ml-md-5 ml-sm-1 ml-xs-1\"><%= profile.slugToShow ? profile.slugToShow : profile.username %></div>\n            <% } else { %>\n              <div class=\"card-player-name mt-3 ml-md-5 ml-sm-1 ml-xs-1\"><%= profile.slugToShow ? profile.slugToShow : profile.username %></div>\n            <% } %>\n          </div>\n          <div class='col-md-6 col-12'>\n            <table class='player-stats-overview'>\n              <thead>\n                <tr>\n                  <th scope=\"col\" data-l10n='stats-wins'>Wins</th>\n                  <th scope=\"col\" data-l10n='stats-kills'>Kills</th>\n                  <th scope=\"col\" data-l10n='stats-games'>Games</th>\n                  <th scope=\"col\" data-l10n='stats-kg'>K/G</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr>\n                  <td><%= profile.wins %></td>\n                  <td><%= profile.kills %></td>\n                  <td><%= profile.games %></td>\n                  <td><%= profile.kpg %></td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        <% } %>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- Season/Region selectors -->\n<% if (teamModes.length > 0) { %>\n<div class='container mt-3'>\n  <div class='row'>\n    <div class='col-lg-2 col-6'>\n      <select id='player-time' class=\"player-opt custom-select\">\n        <option value=\"daily\" data-l10n='stats-today'>Today</option>\n        <option value=\"weekly\" data-l10n='stats-this-week'>This week</option>\n        <option value=\"alltime\" data-l10n='stats-all-time'>All time</option>\n      </select>\n    </div>\n    <div class='col-lg-2 col-6 pl-0'>\n      <select id=\"player-map-id\" class=\"player-opt custom-select\">\n        <option value=\"-1\" data-l10n='all'>All modes</option>\n        <% for (var i = 0; i < gameModes.length; i++) { %>\n          <option value=\"<%= gameModes[i].mapId %>\"><%= gameModes[i].desc.name%></option>\n        <% } %>\n      </select>\n    </div>\n    <div class='offset-6 col-2 col-rating-help'>\n      <div class='rating-help'>What is Rating?<div class='rating-help-desc'><span class='highlight'>This feature coming soon!</span></br>Rating will be based on placement and kills within an individual game mode.</div></div>\n    </div>\n  </div>\n</div>\n<% } %>\n\n<!-- Mode Cards -->\n<div class=\"container mt-3\">\n  <div class='row'>\n\n    <% for (var i = 0; i < teamModes.length; i++) { %>\n\n    <!-- Mode Card -->\n    <!-- pad the last card -->\n    <% if (i == teamModes.length - 1) { %>\n      <div class='col-lg-4 col-12'>\n    <% } else { %>\n      <div class='col-lg-4 col-12 pr-lg-0'>\n    <% } %>\n      <div class=\"card card-mode card-mode-bg-<%= i %>\">\n        <div class=\"card-body p-1\">\n          <div class='row card-mode-row-top'>\n            <div class='col-2 p-0'>\n              <div class='mode-image mode-image-<%= teamModes[i].name %>'></div>\n            </div>\n            <div class='col-5 p-0'>\n              <div class=\"mode-name mode-name-<%= teamModes[i].name %>\" data-l10n='stats-<%= teamModes[i].name %>' data-caps='true'><%= teamModes[i].name.toUpperCase() %></div>\n            </div>\n            <div class='col-5 mt-2'>\n              <% if (teamModes[i].games > 0) { %>\n                <div class=\"mode-games\"><span><%= teamModes[i].games %></span> <span data-l10n='stats-games' data-caps='true''>Games</span></div>\n              <% } %>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <!-- Show \"no games played\" if no games played -->\n      <% if (teamModes[i].games == 0) { %>\n        <div class=\"card card-mode card-mode-no-games\">\n          <div class='col-12'>No games played.</div>\n        </div>\n      <% } else { %>\n        <div class=\"card card-mode card-mode-bg-mid\">\n          <div class=\"card-body p-1\">\n            <div class='row m-1'>\n\n              <% for (var j = 0; j < teamModes[i].midStats.length; j++) { %>\n\n              <div class='col-6 mt-1 mb-1'>\n                <div class='card-mode-stat-mid'>\n                  <div class='card-mode-stat-name' data-l10n='stats-<%= teamModes[i].midStats[j].name %>' data-caps='true'><%= teamModes[i].midStats[j].name.toUpperCase() %></div>\n                  <div class='card-mode-stat-value' data-l10n='stats-<%= teamModes[i].midStats[j].val %>' data-caps='true'><%= teamModes[i].midStats[j].val %></div>\n                </div>\n              </div>\n\n              <% } %>\n\n            </div>\n          </div>\n        </div>\n        <div class=\"card card-mode card-mode-bg-bot\">\n          <div class=\"card-body p-1\">\n            <div class='row m-1'>\n               <% for (var j = 0; j < teamModes[i].botStats.length; j++) { %>\n\n                <div class='col-6 mt-1 mb-1'>\n                  <div class='card-mode-stat-bot'>\n                    <div class='card-mode-stat-name' data-l10n='stats-<%= teamModes[i].botStats[j].name %>' data-caps='true'><%= teamModes[i].botStats[j].name.toUpperCase() %></div>\n                    <div class='card-mode-stat-value'><%= teamModes[i].botStats[j].val %></div>\n                  </div>\n                </div>\n\n              <% } %>\n\n            </div>\n          </div>\n        </div>\n\n        <% } %>\n\n      </div>\n\n    <% } %>\n\n  </div>\n</div>\n<!-- Close Mode Cards -->\n\n<!-- Extra Stats -->\n<% if (profile.username) { %>\n  <div class=\"container mt-3\">\n    <div class='row m-0'>\n      <div class='offset-0 offset-md-8 col-3 col-md-1 p-0'>\n        <div class='extra-team-mode-filter <%= teamModeFilter == 7 ? 'extra-team-mode-filter-selected' : '' %> btn-darken' data-filter='7'>All</div>\n      </div>\n      <div class='col-3 col-md-1 p-0'>\n        <div class='extra-team-mode-filter <%= teamModeFilter == 1 ? 'extra-team-mode-filter-selected' : '' %> btn-darken' data-filter='1'>Solo</div>\n      </div>\n      <div class='col-3 col-md-1 p-0'>\n        <div class='extra-team-mode-filter <%= teamModeFilter == 2 ? 'extra-team-mode-filter-selected' : '' %>  btn-darken' data-filter='2'>Duo</div>\n      </div>\n      <div class='col-3 col-md-1 p-0'>\n        <div class='extra-team-mode-filter <%= teamModeFilter == 4 ? 'extra-team-mode-filter-selected' : '' %> btn-darken' data-filter='4'>Squad</div>\n      </div>\n    </div>\n  </div>\n  <div class=\"container mt-3\">\n    <!-- Extra Stats Sort Options -->\n    <div class='row'>\n      <div class='offset-8 col-4'>\n      </div>\n    </div>\n    <div class='row'>\n      <!-- Extra Stats Selectors -->\n      <div class='col-12 col-md-2'>\n        <div id='selector-extra-matches' class='extra-matches selector-extra col-2 col-md-12 p-0'>Matches<span class='selected-extra'></span></div>\n        <!-- <div id='selector-extra-weapons' class='extra-weapons selector-extra'>Weapons</div> -->\n        <!-- <div id='selector-extra-misc' class='extra-misc selector-extra'>Misc</div> -->\n      </div>\n      <!-- Extra Stats Main -->\n      <div id='match-history' class='col-12 col-md-10'>\n        <div class='header-extra'>MATCH HISTORY</div>\n        <div class='row-extra-match'>\n        </div>\n      </div>\n    </div>\n  </div>\n<% } %>\n\n<!-- Close Extra Stats -->\n",
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push('<!-- Overview Card -->\n<div class="container mt-3">\n  <div class="card card-player col-lg-8 col-12 p-0">\n    <div class="card-body">\n      <div class=\'row card-row-top\'>\n\n        ');
                      __stack.lineno = 7;
                      if (error) {
                          buf.push("\n          <div class='col-lg-10'>\n            <div class=\"card-player-name mt-3 ml-3\">Error loading content, please try again.</div>\n          </div>\n        ");
                          __stack.lineno = 11;
                      } else if (!profile.username) {
                          buf.push("\n          <div class='col-lg-10'>\n            <div class=\"card-player-name mt-3 ml-3\">That player doesn't exist.</div>\n          </div>\n        ");
                          __stack.lineno = 15;
                      } else {
                          buf.push("\n          <div class='col-md-1 col-sm-2 col-3'>\n              <div class='player-image' style='background-image: url(\"", escape((__stack.lineno = 17,
                          profile.avatarTexture)), "\")'></div>\n          </div>\n          <div class='col-md-5 col-sm-10 col-9'>\n            ");
                          __stack.lineno = 20;
                          if (profile.banned) {
                              buf.push('\n              <div class="card-player-banned ml-md-5 ml-sm-1 ml-xs-1">(Banned)</div>\n              <div class="card-player-name ml-md-5 ml-sm-1 ml-xs-1">', escape((__stack.lineno = 22,
                              profile.slugToShow ? profile.slugToShow : profile.username)), "</div>\n            ");
                              __stack.lineno = 23;
                          } else {
                              buf.push('\n              <div class="card-player-name mt-3 ml-md-5 ml-sm-1 ml-xs-1">', escape((__stack.lineno = 24,
                              profile.slugToShow ? profile.slugToShow : profile.username)), "</div>\n            ");
                              __stack.lineno = 25;
                          }
                          buf.push("\n          </div>\n          <div class='col-md-6 col-12'>\n            <table class='player-stats-overview'>\n              <thead>\n                <tr>\n                  <th scope=\"col\" data-l10n='stats-wins'>Wins</th>\n                  <th scope=\"col\" data-l10n='stats-kills'>Kills</th>\n                  <th scope=\"col\" data-l10n='stats-games'>Games</th>\n                  <th scope=\"col\" data-l10n='stats-kg'>K/G</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr>\n                  <td>", escape((__stack.lineno = 39,
                          profile.wins)), "</td>\n                  <td>", escape((__stack.lineno = 40,
                          profile.kills)), "</td>\n                  <td>", escape((__stack.lineno = 41,
                          profile.games)), "</td>\n                  <td>", escape((__stack.lineno = 42,
                          profile.kpg)), "</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        ");
                          __stack.lineno = 47;
                      }
                      buf.push("\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- Season/Region selectors -->\n");
                      __stack.lineno = 54;
                      if (teamModes.length > 0) {
                          buf.push("\n<div class='container mt-3'>\n  <div class='row'>\n    <div class='col-lg-2 col-6'>\n      <select id='player-time' class=\"player-opt custom-select\">\n        <option value=\"daily\" data-l10n='stats-today'>Today</option>\n        <option value=\"weekly\" data-l10n='stats-this-week'>This week</option>\n        <option value=\"alltime\" data-l10n='stats-all-time'>All time</option>\n      </select>\n    </div>\n    <div class='col-lg-2 col-6 pl-0'>\n      <select id=\"player-map-id\" class=\"player-opt custom-select\">\n        <option value=\"-1\" data-l10n='all'>All modes</option>\n        ");
                          __stack.lineno = 67;
                          for (var i = 0; i < gameModes.length; i++) {
                              buf.push('\n          <option value="', escape((__stack.lineno = 68,
                              gameModes[i].mapId)), '">', escape((__stack.lineno = 68,
                              gameModes[i].desc.name)), "</option>\n        ");
                              __stack.lineno = 69;
                          }
                          buf.push("\n      </select>\n    </div>\n    <div class='offset-6 col-2 col-rating-help'>\n      <div class='rating-help'>What is Rating?<div class='rating-help-desc'><span class='highlight'>This feature coming soon!</span></br>Rating will be based on placement and kills within an individual game mode.</div></div>\n    </div>\n  </div>\n</div>\n");
                          __stack.lineno = 77;
                      }
                      buf.push("\n\n<!-- Mode Cards -->\n<div class=\"container mt-3\">\n  <div class='row'>\n\n    ");
                      __stack.lineno = 83;
                      for (var i = 0; i < teamModes.length; i++) {
                          buf.push("\n\n    <!-- Mode Card -->\n    <!-- pad the last card -->\n    ");
                          __stack.lineno = 87;
                          if (i == teamModes.length - 1) {
                              buf.push("\n      <div class='col-lg-4 col-12'>\n    ");
                              __stack.lineno = 89;
                          } else {
                              buf.push("\n      <div class='col-lg-4 col-12 pr-lg-0'>\n    ");
                              __stack.lineno = 91;
                          }
                          buf.push('\n      <div class="card card-mode card-mode-bg-', escape((__stack.lineno = 92,
                          i)), "\">\n        <div class=\"card-body p-1\">\n          <div class='row card-mode-row-top'>\n            <div class='col-2 p-0'>\n              <div class='mode-image mode-image-", escape((__stack.lineno = 96,
                          teamModes[i].name)), "'></div>\n            </div>\n            <div class='col-5 p-0'>\n              <div class=\"mode-name mode-name-", escape((__stack.lineno = 99,
                          teamModes[i].name)), "\" data-l10n='stats-", escape((__stack.lineno = 99,
                          teamModes[i].name)), "' data-caps='true'>", escape((__stack.lineno = 99,
                          teamModes[i].name.toUpperCase())), "</div>\n            </div>\n            <div class='col-5 mt-2'>\n              ");
                          __stack.lineno = 102;
                          if (teamModes[i].games > 0) {
                              buf.push('\n                <div class="mode-games"><span>', escape((__stack.lineno = 103,
                              teamModes[i].games)), "</span> <span data-l10n='stats-games' data-caps='true''>Games</span></div>\n              ");
                              __stack.lineno = 104;
                          }
                          buf.push('\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <!-- Show "no games played" if no games played -->\n      ');
                          __stack.lineno = 111;
                          if (teamModes[i].games == 0) {
                              buf.push("\n        <div class=\"card card-mode card-mode-no-games\">\n          <div class='col-12'>No games played.</div>\n        </div>\n      ");
                              __stack.lineno = 115;
                          } else {
                              buf.push('\n        <div class="card card-mode card-mode-bg-mid">\n          <div class="card-body p-1">\n            <div class=\'row m-1\'>\n\n              ');
                              __stack.lineno = 120;
                              for (var j = 0; j < teamModes[i].midStats.length; j++) {
                                  buf.push("\n\n              <div class='col-6 mt-1 mb-1'>\n                <div class='card-mode-stat-mid'>\n                  <div class='card-mode-stat-name' data-l10n='stats-", escape((__stack.lineno = 124,
                                  teamModes[i].midStats[j].name)), "' data-caps='true'>", escape((__stack.lineno = 124,
                                  teamModes[i].midStats[j].name.toUpperCase())), "</div>\n                  <div class='card-mode-stat-value' data-l10n='stats-", escape((__stack.lineno = 125,
                                  teamModes[i].midStats[j].val)), "' data-caps='true'>", escape((__stack.lineno = 125,
                                  teamModes[i].midStats[j].val)), "</div>\n                </div>\n              </div>\n\n              ");
                                  __stack.lineno = 129;
                              }
                              buf.push('\n\n            </div>\n          </div>\n        </div>\n        <div class="card card-mode card-mode-bg-bot">\n          <div class="card-body p-1">\n            <div class=\'row m-1\'>\n               ');
                              __stack.lineno = 137;
                              for (var j = 0; j < teamModes[i].botStats.length; j++) {
                                  buf.push("\n\n                <div class='col-6 mt-1 mb-1'>\n                  <div class='card-mode-stat-bot'>\n                    <div class='card-mode-stat-name' data-l10n='stats-", escape((__stack.lineno = 141,
                                  teamModes[i].botStats[j].name)), "' data-caps='true'>", escape((__stack.lineno = 141,
                                  teamModes[i].botStats[j].name.toUpperCase())), "</div>\n                    <div class='card-mode-stat-value'>", escape((__stack.lineno = 142,
                                  teamModes[i].botStats[j].val)), "</div>\n                  </div>\n                </div>\n\n              ");
                                  __stack.lineno = 146;
                              }
                              buf.push("\n\n            </div>\n          </div>\n        </div>\n\n        ");
                              __stack.lineno = 152;
                          }
                          buf.push("\n\n      </div>\n\n    ");
                          __stack.lineno = 156;
                      }
                      buf.push("\n\n  </div>\n</div>\n<!-- Close Mode Cards -->\n\n<!-- Extra Stats -->\n");
                      __stack.lineno = 163;
                      if (profile.username) {
                          buf.push("\n  <div class=\"container mt-3\">\n    <div class='row m-0'>\n      <div class='offset-0 offset-md-8 col-3 col-md-1 p-0'>\n        <div class='extra-team-mode-filter ", escape((__stack.lineno = 167,
                          teamModeFilter == 7 ? "extra-team-mode-filter-selected" : "")), " btn-darken' data-filter='7'>All</div>\n      </div>\n      <div class='col-3 col-md-1 p-0'>\n        <div class='extra-team-mode-filter ", escape((__stack.lineno = 170,
                          teamModeFilter == 1 ? "extra-team-mode-filter-selected" : "")), " btn-darken' data-filter='1'>Solo</div>\n      </div>\n      <div class='col-3 col-md-1 p-0'>\n        <div class='extra-team-mode-filter ", escape((__stack.lineno = 173,
                          teamModeFilter == 2 ? "extra-team-mode-filter-selected" : "")), "  btn-darken' data-filter='2'>Duo</div>\n      </div>\n      <div class='col-3 col-md-1 p-0'>\n        <div class='extra-team-mode-filter ", escape((__stack.lineno = 176,
                          teamModeFilter == 4 ? "extra-team-mode-filter-selected" : "")), " btn-darken' data-filter='4'>Squad</div>\n      </div>\n    </div>\n  </div>\n  <div class=\"container mt-3\">\n    <!-- Extra Stats Sort Options -->\n    <div class='row'>\n      <div class='offset-8 col-4'>\n      </div>\n    </div>\n    <div class='row'>\n      <!-- Extra Stats Selectors -->\n      <div class='col-12 col-md-2'>\n        <div id='selector-extra-matches' class='extra-matches selector-extra col-2 col-md-12 p-0'>Matches<span class='selected-extra'></span></div>\n        <!-- <div id='selector-extra-weapons' class='extra-weapons selector-extra'>Weapons</div> -->\n        <!-- <div id='selector-extra-misc' class='extra-misc selector-extra'>Misc</div> -->\n      </div>\n      <!-- Extra Stats Main -->\n      <div id='match-history' class='col-12 col-md-10'>\n        <div class='header-extra'>MATCH HISTORY</div>\n        <div class='row-extra-match'>\n        </div>\n      </div>\n    </div>\n  </div>\n");
                          __stack.lineno = 201;
                      }
                      buf.push("\n\n<!-- Close Extra Stats -->\n");
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),

  /***/
  "oHTN": /***/
  (function(module, exports) {

      module.exports = function anonymous(locals, filters, escape, rethrow) {
          escape = escape || function(html) {
              return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
          }
          ;
          var __stack = {
              lineno: 1,
              input: '<a class="nav-link dropdown-toggle" href="#" id="selected-language" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><%= code.toUpperCase() %></a>\n<div class="dropdown-menu" aria-labelledby="navbarDropdown">\n    <a class="dropdown-item dropdown-language" href="#" value=\'en\'>English</a>\n    <a class="dropdown-item dropdown-language" href="#" value=\'es\'>Español</a>\n</div>',
              filename: "."
          };
          function rethrow(err, str, filename, lineno) {
              var lines = str.split("\n")
                , start = Math.max(lineno - 3, 0)
                , end = Math.min(lines.length, lineno + 3);
              var context = lines.slice(start, end).map(function(line, i) {
                  var curr = i + start + 1;
                  return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
              }).join("\n");
              err.path = filename;
              err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
              throw err;
          }
          try {
              var buf = [];
              with (locals || {}) {
                  (function() {
                      buf.push('<a class="nav-link dropdown-toggle" href="#" id="selected-language" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">', escape((__stack.lineno = 1,
                      code.toUpperCase())), '</a>\n<div class="dropdown-menu" aria-labelledby="navbarDropdown">\n    <a class="dropdown-item dropdown-language" href="#" value=\'en\'>English</a>\n    <a class="dropdown-item dropdown-language" href="#" value=\'es\'>Español</a>\n</div>');
                  }
                  )();
              }
              return buf.join("");
          } catch (err) {
              rethrow(err, __stack.input, __stack.filename, __stack.lineno);
          }
      }

      /***/
  }
  ),

  /***/
  "rSE8": /***/
  (function(module, exports, __webpack_require__) {

      "use strict";

      var _createClass = function() {
          function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value"in descriptor)
                      descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
              }
          }
          return function(Constructor, protoProps, staticProps) {
              if (protoProps)
                  defineProperties(Constructor.prototype, protoProps);
              if (staticProps)
                  defineProperties(Constructor, staticProps);
              return Constructor;
          }
          ;
      }();

      function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
          }
      }

      var Router = function() {
          function Router(app) {
              _classCallCheck(this, Router);

              this.app = app;
              this.routes = [];

              var routeChange = this.onRouteChange.bind(this);
              window.addEventListener('load', routeChange);
          }

          _createClass(Router, [{
              key: 'addRoute',
              value: function addRoute(name, url) {
                  this.routes.push({
                      name: name,
                      url: url
                  });
              }
          }, {
              key: 'onRouteChange',
              value: function onRouteChange() {
                  var location = window.location.href;
                  var route = this.routes.find(function(r) {
                      return location.match(new RegExp(r.url));
                  });
                  if (route) {
                      this.app.setView(route.name);
                  } else {
                      this.app.setView();
                  }
              }
          }]);

          return Router;
      }();

      module.exports = Router;

      /***/
  }
  ),

  /***/
  "vIKM": /***/
  (function(module, exports, __webpack_require__) {

      "use strict";

      var _createClass = function() {
          function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value"in descriptor)
                      descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
              }
          }
          return function(Constructor, protoProps, staticProps) {
              if (protoProps)
                  defineProperties(Constructor.prototype, protoProps);
              if (staticProps)
                  defineProperties(Constructor, staticProps);
              return Constructor;
          }
          ;
      }();

      function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
          }
      }

      var $ = __webpack_require__("juYr");
      var device = __webpack_require__("fquI");
      var helpers = __webpack_require__("UiAd");

      var EmoteDefs = __webpack_require__("DSCr");

      var battletagCensoring = __webpack_require__("OH7J");

      var templates = {
          loading: __webpack_require__("fj+T"),
          matchData: __webpack_require__("27uc"),
          matchHistory: __webpack_require__("cZoj"),
          player: __webpack_require__("RGMZ"),
          playerCards: __webpack_require__("nDwx")
      };

      //
      // Helpers
      //

      function formatTime(time) {
          var minutes = Math.floor(time / 60) % 60;
          var seconds = Math.floor(time) % 60;
          if (seconds < 10) {
              seconds = "0" + seconds;
          }
          var timeSurv = '';
          timeSurv += minutes + ':';
          timeSurv += seconds;
          return timeSurv;
      }

      function emoteImgToSvg(img) {
          return img && img.length > 4 ? '../img/emotes/' + img.slice(0, -4) + '.svg' : '';
      }

      var kTeamModeToString = {
          1: 'solo',
          2: 'duo',
          4: 'squad'
      };

      function getPlayerCardData(userData, error, teamModeFilter) {
          // get_user_stats currently returns data rows for all teamModes;
          // transform the data a bit for the player card.
          if (error || !userData) {
              return {
                  profile: {},
                  teamModes: [],
                  error: error
              };
          }

          var emoteDef = EmoteDefs[userData.player_icon];
          var texture = emoteDef ? emoteImgToSvg(emoteDef.texture) : '../img/gui/player-gui.svg';
          var tmpSlug = userData.slug.toLowerCase();
          tmpSlug = tmpSlug.replace(userData.username.toLowerCase(), '');

          var tmpslugToShow = tmpSlug != '' ? battletagCensoring.getCensoredBattletag(userData.username + "#" + tmpSlug) : battletagCensoring.getCensoredBattletag(userData.username);

          var profile = {
              username: battletagCensoring.getCensoredBattletag(userData.username),
              slugToShow: tmpslugToShow,
              banned: userData.banned,
              avatarTexture: texture,
              wins: userData.wins,
              kills: userData.kills,
              games: userData.games,
              kpg: userData.kpg
          };

          // Gather card data
          var addStat = function addStat(arr, name, val) {
              arr.push({
                  name: name,
                  val: val
              });
          };
          var teamModes = [];
          for (var i = 0; i < userData.modes.length; i++) {
              var r = userData.modes[i];

              // Overall rank / rating not available yet
              var mid = [];
              addStat(mid, 'Rating', '-');
              addStat(mid, 'Rank', '-');

              var bot = [];
              addStat(bot, 'Wins', r.wins);
              addStat(bot, 'Win %', r.winPct);
              addStat(bot, 'Kills', r.kills);
              addStat(bot, 'Avg Survived', formatTime(r.avgTimeAlive));
              addStat(bot, 'Most kills', r.mostKills);
              addStat(bot, 'K/G', r.kpg);
              addStat(bot, 'Most damage', r.mostDamage);
              addStat(bot, 'Avg Damage', r.avgDamage);

              teamModes.push({
                  teamMode: r.teamMode,
                  games: r.games,
                  midStats: mid,
                  botStats: bot
              });
          }

          // Insert blank cards for all teammodes
          var keys = Object.keys(kTeamModeToString);

          var _loop = function _loop(_i) {
              var teamMode = keys[_i];
              if (!teamModes.find(function(x) {
                  return x.teamMode == teamMode;
              })) {
                  teamModes.push({
                      teamMode: teamMode,
                      games: 0
                  });
              }
          };

          for (var _i = 0; _i < keys.length; _i++) {
              _loop(_i);
          }
          teamModes.sort(function(a, b) {
              return a.teamMode - b.teamMode;
          });
          for (var _i2 = 0; _i2 < teamModes.length; _i2++) {
              var _teamMode = teamModes[_i2].teamMode;
              teamModes[_i2].name = kTeamModeToString[_teamMode];
          }

          var gameModes = helpers.getGameModes();

          return {
              profile: profile,
              error: error,
              teamModes: teamModes,
              teamModeFilter: teamModeFilter,
              gameModes: gameModes
          };
      }

      //
      // Query
      //

      var Query = function() {
          function Query() {
              _classCallCheck(this, Query);

              this.inProgress = false;
              this.dataValid = false;
              this.error = false;
              this.args = {};
              this.data = null;
          }

          _createClass(Query, [{
              key: 'query',
              value: function query(url, args, debugTimeout, onComplete) {
                  var _this = this;

                  if (this.inProgress) {
                      return;
                  }

                  this.inProgress = true;
                  this.error = false;

                  $.ajax({
                      url: url,
                      type: 'POST',
                      data: JSON.stringify(args),
                      contentType: 'application/json; charset=utf-8',
                      timeout: 10 * 1000,
                      success: function success(data, status, xhr) {
                          _this.data = data;
                          _this.dataValid = !!data;
                      },
                      error: function error(xhr, err) {
                          _this.error = true;
                          _this.dataValid = false;
                      },
                      complete: function complete() {
                          setTimeout(function() {
                              _this.inProgress = false;
                              onComplete(_this.error, _this.data);
                          }, debugTimeout);
                      }
                  });
              }
          }]);

          return Query;
      }();

      //
      // PlayerView
      //

      var PlayerView = function() {
          function PlayerView(app) {
              _classCallCheck(this, PlayerView);

              this.app = app;

              this.games = [];
              this.moreGamesAvailable = true;
              this.teamModeFilter = 7;

              this.userStats = new Query();
              this.matchHistory = new Query();
              this.matchData = new Query();

              this.el = $(templates.player({
                  phoneDetected: device.mobile && !device.tablet
              }));
          }

          _createClass(PlayerView, [{
              key: 'getUrlParams',
              value: function getUrlParams() {
                  var location = window.location.href;
                  var params = new RegExp('stats/([^/?#]+).*$').exec(location) || [];
                  var slug = params[1] || '';
                  var interval = helpers.getParameterByName('t') || 'all';
                  var mapId = helpers.getParameterByName('mapId') || '-1';
                  return {
                      slug: slug,
                      interval: interval,
                      mapId: mapId
                  };
              }
          }, {
              key: 'getGameByGameId',
              value: function getGameByGameId(gameId) {
                  return this.games.find(function(x) {
                      return x.summary.guid == gameId;
                  });
              }
          }, {
              key: 'load',
              value: function load() {
                  var _getUrlParams = this.getUrlParams()
                    , slug = _getUrlParams.slug
                    , interval = _getUrlParams.interval
                    , mapId = _getUrlParams.mapId;

                  this.loadUserStats(slug, interval, mapId);
                  this.loadMatchHistory(slug, 0, 7);

                  this.render();
              }
          }, {
              key: 'loadUserStats',
              value: function loadUserStats(slug, interval, mapIdFilter) {
                  var _this2 = this;

                  var args = {
                      slug: slug,
                      interval: interval,
                      mapIdFilter: mapIdFilter
                  };
                  this.userStats.query('/api/user_stats', args, 0, function(err, data) {
                      _this2.render();
                  });
              }
          }, {
              key: 'loadMatchHistory',
              value: function loadMatchHistory(slug, offset, teamModeFilter) {
                  var _this3 = this;

                  var count = 10;
                  var args = {
                      slug: slug,
                      offset: offset,
                      count: count,
                      teamModeFilter: teamModeFilter
                  };
                  this.matchHistory.query('/api/match_history', args, 0, function(err, data) {
                      var gameModes = helpers.getGameModes();

                      var games = data || [];

                      var _loop2 = function _loop2(i) {
                          games[i].team_mode = kTeamModeToString[games[i].team_mode];

                          var gameMode = gameModes.find(function(x) {
                              return x.mapId == games[i].map_id;
                          });
                          games[i].icon = gameMode ? gameMode.desc.icon : '';

                          _this3.games.push({
                              expanded: false,
                              summary: games[i],
                              data: null,
                              dataError: false
                          });
                      };

                      for (var i = 0; i < games.length; i++) {
                          _loop2(i);
                      }
                      _this3.moreGamesAvailable = games.length >= count;
                      _this3.render();
                  });
              }
          }, {
              key: 'loadMatchData',
              value: function loadMatchData(gameId) {
                  var _this4 = this;

                  var args = {
                      gameId: gameId
                  };
                  this.matchData.query('/api/match_data', args, 0, function(err, data) {
                      var game = _this4.getGameByGameId(gameId);
                      if (game) {
                          game.data = data;
                          game.dataError = err || !data;
                      }
                      _this4.render();
                  });
              }
          }, {
              key: 'toggleMatchData',
              value: function toggleMatchData(gameId) {
                  var game = this.getGameByGameId(gameId);
                  if (!game) {
                      return;
                  }

                  var wasExpanded = game.expanded;
                  for (var i = 0; i < this.games.length; i++) {
                      this.games[i].expanded = false;
                  }
                  game.expanded = !wasExpanded;

                  if (!game.data && !game.dataError) {
                      this.loadMatchData(gameId);
                  }

                  this.render();
              }
          }, {
              key: 'onChangedParams',
              value: function onChangedParams() {
                  var time = $('#player-time').val();
                  var mapId = $('#player-map-id').val();
                  window.history.pushState('', '', '?t=' + time + '&mapId=' + mapId);

                  var params = this.getUrlParams();
                  this.loadUserStats(params.slug, params.interval, params.mapId);
              }
          }, {
              key: 'render',
              value: function render() {
                  var _this5 = this;

                  var params = this.getUrlParams();

                  // User stats
                  var content = '';
                  if (this.userStats.inProgress) {
                      content = templates.loading({
                          type: 'player'
                      });
                  } else {
                      var cardData = getPlayerCardData(this.userStats.data, this.userStats.error, this.teamModeFilter);
                      content = templates.playerCards(cardData);
                  }
                  this.el.find('.content').html(content);

                  var timeSelector = this.el.find('#player-time');
                  if (timeSelector) {
                      timeSelector.val(params.interval);
                      timeSelector.change(function() {
                          _this5.onChangedParams();
                      });
                  }

                  var mapIdSelector = this.el.find('#player-map-id');
                  if (mapIdSelector) {
                      mapIdSelector.val(params.mapId);
                      mapIdSelector.change(function() {
                          _this5.onChangedParams();
                      });
                  }

                  // Match history
                  var historyContent = '';
                  if (this.games.length == 0 && this.matchHistory.inProgress) {
                      historyContent = templates.loading({
                          type: 'match_history'
                      });
                  } else {
                      historyContent = templates.matchHistory({
                          games: this.games,
                          moreGamesAvailable: this.moreGamesAvailable,
                          loading: this.matchHistory.inProgress,
                          error: this.matchHistory.error
                      });
                  }

                  var historySelector = this.el.find('#match-history');
                  if (historySelector) {
                      historySelector.html(historyContent);

                      $('.js-match-data').click(function(e) {
                          if (!$(e.target).is("a")) {
                              _this5.toggleMatchData($(e.currentTarget).data('game-id'));
                          }
                      });

                      $('.js-match-load-more').click(function(e) {
                          var params = _this5.getUrlParams();
                          _this5.loadMatchHistory(params.slug, _this5.games.length, _this5.teamModeFilter);
                          _this5.render();
                      });

                      $('.extra-team-mode-filter').click(function(e) {
                          if (!_this5.matchHistory.inProgress) {
                              var _params = _this5.getUrlParams();
                              _this5.games = [];
                              _this5.teamModeFilter = $(e.currentTarget).data('filter');
                              _this5.loadMatchHistory(_params.slug, 0, _this5.teamModeFilter);
                              _this5.render();
                          }
                      });

                      // Match data
                      var matchDataContent = '';
                      var expandedGame = this.games.find(function(x) {
                          return x.expanded;
                      });
                      if (expandedGame) {
                          var _params2 = this.getUrlParams();
                          var localId = 0;
                          // Get this player's player_id in this match
                          if (expandedGame.data) {
                              for (var i = 0; i < expandedGame.data.length; i++) {
                                  var d = expandedGame.data[i];
                                  if (_params2.slug == d.slug) {
                                      localId = d.player_id || 0;
                                      break;
                                  }
                              }
                          }

                          matchDataContent = templates.matchData({
                              data: expandedGame.data,
                              error: expandedGame.dataError,
                              loading: this.matchData.inProgress,
                              localId: localId
                          });
                      }

                      $('#match-data').html(matchDataContent);
                  }

                  this.app.localization.localizeIndex();
              }
          }]);

          return PlayerView;
      }();

      module.exports = PlayerView;

      /***/
  }
  ),

}, ["2O6T"]);
//# sourceMappingURL=app.7132a6e5.js.map
