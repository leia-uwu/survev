import ejs from "ejs";

export default function (params) {
    const templateString = `<!-- Overview Card -->
<div class="container mt-3">
  <div class="card card-player col-lg-8 col-12 p-0">
    <div class="card-body">
      <div class='row card-row-top'>
        <% if (error) { %>
          <div class='col-lg-10'>
            <div class="card-player-name mt-3 ml-3">Error loading content, please try again.</div>
          </div>
          <% } else if (!profile.username) { %>
            <div class='col-lg-10'>
              <div class="card-player-name mt-3 ml-3">That player doesn't exist.</div>
            </div>
            <% } else { %>
              <div class='col-md-1 col-sm-2 col-3'>
                <div class='player-image' style='background-image: url("<%= profile.avatarTexture %>")'></div>
              </div>
              <div class='col-md-5 col-sm-10 col-9'>
                <% if (profile.banned) { %>
                  <div class="card-player-banned ml-md-5 ml-sm-1 ml-xs-1">(Banned)</div>
                  <div class="card-player-name ml-md-5 ml-sm-1 ml-xs-1">
                    <%= profile.slugToShow ? profile.slugToShow : profile.username %>
                  </div>
                  <% } else { %>
                    <div class="card-player-name mt-3 ml-md-5 ml-sm-1 ml-xs-1">
                      <%= profile.slugToShow ? profile.slugToShow : profile.username %>
                    </div>
                    <% } %>
              </div>
              <div class='col-md-6 col-12'>
                <table class='player-stats-overview'>
                  <thead>
                    <tr>
                      <th scope="col" data-l10n='stats-wins'>Wins</th>
                      <th scope="col" data-l10n='stats-kills'>Kills</th>
                      <th scope="col" data-l10n='stats-games'>Games</th>
                      <th scope="col" data-l10n='stats-kg'>K/G</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <%= profile.wins %>
                      </td>
                      <td>
                        <%= profile.kills %>
                      </td>
                      <td>
                        <%= profile.games %>
                      </td>
                      <td>
                        <%= profile.kpg %>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <% } %>
      </div>
    </div>
  </div>
</div><!-- Season/Region selectors -->
<% if (teamModes.length> 0) { %><div class='container mt-3'>
    <div class='row'>
      <div class='col-lg-2 col-6'> <select id='player-time' class="player-opt custom-select">
          <option value="daily" data-l10n='stats-today'>Today</option>
          <option value="weekly" data-l10n='stats-this-week'>This week</option>
          <option value="alltime" data-l10n='stats-all-time'>All time</option>
        </select> </div>
      <div class='col-lg-2 col-6 pl-0'> <select id="player-map-id" class="player-opt custom-select">
          <option value="-1" data-l10n='all'>All modes</option>
          <% for (var i=0; i < gameModes.length; i++) { %>
            <option value="<%= gameModes[i].mapId %>">
              <%= gameModes[i].desc.name%>
            </option>
            <% } %>
        </select> </div>
      <div class='offset-6 col-2 col-rating-help'>
        <div class='rating-help'>What is Rating?<div class='rating-help-desc'><span class='highlight'>This feature
              coming soon!</span></br>Rating will be based on placement and kills within an individual game mode.</div>
        </div>
      </div>
    </div>
  </div>
  <% } %><!-- Mode Cards -->
    <div class="container mt-3">
      <div class='row'>
        <% for (var i=0; i < teamModes.length; i++) { %> <!-- Mode Card --> <!-- pad the last card -->
          <% if (i==teamModes.length - 1) { %>
            <div class='col-lg-4 col-12'>
              <% } else { %>
                <div class='col-lg-4 col-12 pr-lg-0'>
                  <% } %>
                    <div class="card card-mode card-mode-bg-<%= i %>">
                      <div class="card-body p-1">
                        <div class='row card-mode-row-top'>
                          <div class='col-2 p-0'>
                            <div class='mode-image mode-image-<%= teamModes[i].name %>'></div>
                          </div>
                          <div class='col-5 p-0'>
                            <div class="mode-name mode-name-<%= teamModes[i].name %>"
                              data-l10n='stats-<%= teamModes[i].name %>' data-caps='true'>
                              <%= teamModes[i].name.toUpperCase() %>
                            </div>
                          </div>
                          <div class='col-5 mt-2'>
                            <% if (teamModes[i].games> 0) { %> <div class="mode-games"><span>
                                  <%= teamModes[i].games %>
                                </span> <span data-l10n='stats-games'
                                  data-caps='true''>Games</span></div>              <% } %>            </div>          </div>        </div>      </div>      <!-- Show "no games played" if no games played -->      <% if (teamModes[i].games == 0) { %>        <div class="card card-mode card-mode-no-games">          <div class='
                                  col-12'>No games played.</div>
                          </div>
                          <% } else { %>
                            <div class="card card-mode card-mode-bg-mid">
                              <div class="card-body p-1">
                                <div class='row m-1'>
                                  <% for (var j=0; j < teamModes[i].midStats.length; j++) { %>
                                    <div class='col-6 mt-1 mb-1'>
                                      <div class='card-mode-stat-mid'>
                                        <div class='card-mode-stat-name'
                                          data-l10n='stats-<%= teamModes[i].midStats[j].name %>' data-caps='true'>
                                          <%= teamModes[i].midStats[j].name.toUpperCase() %>
                                        </div>
                                        <div class='card-mode-stat-value'
                                          data-l10n='stats-<%= teamModes[i].midStats[j].val %>' data-caps='true'>
                                          <%= teamModes[i].midStats[j].val %>
                                        </div>
                                      </div>
                                    </div>
                                    <% } %>
                                </div>
                              </div>
                            </div>
                            <div class="card card-mode card-mode-bg-bot">
                              <div class="card-body p-1">
                                <div class='row m-1'>
                                  <% for (var j=0; j < teamModes[i].botStats.length; j++) { %>
                                    <div class='col-6 mt-1 mb-1'>
                                      <div class='card-mode-stat-bot'>
                                        <div class='card-mode-stat-name'
                                          data-l10n='stats-<%= teamModes[i].botStats[j].name %>' data-caps='true'>
                                          <%= teamModes[i].botStats[j].name.toUpperCase() %>
                                        </div>
                                        <div class='card-mode-stat-value'>
                                          <%= teamModes[i].botStats[j].val %>
                                        </div>
                                      </div>
                                    </div>
                                    <% } %>
                                </div>
                              </div>
                            </div>
                            <% } %>
                        </div>
                        <% } %>
                      </div>
                    </div><!-- Close Mode Cards --><!-- Extra Stats -->
                    <% if (profile.username) { %>
                      <div class="container mt-3">
                        <div class='row m-0'>
                          <div class='offset-0 offset-md-8 col-3 col-md-1 p-0'>
                            <div class='extra-team-mode-filter <%= teamModeFilter == 7 ? '
                              extra-team-mode-filter-selected' : '' %> btn-darken' data-filter='7'>All</div>
                          </div>
                          <div class='col-3 col-md-1 p-0'>
                            <div class='extra-team-mode-filter <%= teamModeFilter == 1 ? '
                              extra-team-mode-filter-selected' : '' %> btn-darken' data-filter='1'>Solo</div>
                          </div>
                          <div class='col-3 col-md-1 p-0'>
                            <div class='extra-team-mode-filter <%= teamModeFilter == 2 ? '
                              extra-team-mode-filter-selected' : '' %> btn-darken' data-filter='2'>Duo</div>
                          </div>
                          <div class='col-3 col-md-1 p-0'>
                            <div class='extra-team-mode-filter <%= teamModeFilter == 4 ? '
                              extra-team-mode-filter-selected' : '' %> btn-darken' data-filter='4'>Squad</div>
                          </div>
                        </div>
                      </div>
                      <div class="container mt-3"> <!-- Extra Stats Sort Options -->
                        <div class='row'>
                          <div class='offset-8 col-4'> </div>
                        </div>
                        <div class='row'> <!-- Extra Stats Selectors -->
                          <div class='col-12 col-md-2'>
                            <div id='selector-extra-matches' class='extra-matches selector-extra col-2 col-md-12 p-0'>
                              Matches<span class='selected-extra'></span></div>
                            <!-- <div id='selector-extra-weapons' class='extra-weapons selector-extra'>Weapons</div> -->
                            <!-- <div id='selector-extra-misc' class='extra-misc selector-extra'>Misc</div> -->
                          </div> <!-- Extra Stats Main -->
                          <div id='match-history' class='col-12 col-md-10'>
                            <div class='header-extra'>MATCH HISTORY</div>
                            <div class='row-extra-match'> </div>
                          </div>
                        </div>
                      </div>
                      <% } %><!-- Close Extra Stats -->
`;
    return ejs.render(templateString, params, { client: true });
}
