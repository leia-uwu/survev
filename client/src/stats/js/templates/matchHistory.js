import ejs from "ejs";
export default function(params) {
  const templateString = `
  <div class='header-extra'>MATCH HISTORY</div>
<% if (error) { %>
<div class='col-lg-10'>
  <div class="m-3">Error loading content, please try again.</div>
</div>
<% } else if (games.length==0) { %>
<div class='col-lg-10'>
  <div class="m-3">No recent games played.</div>
</div>
<% } else { %>
<div class='col-lg-12'>
  <% for (var i=0; i < games.length; i++) { %>
  <div class='row row-match match-link js-match-data <%= games[i].expanded ? ' match-link-expanded' : '' %>' data-game-id='<%= games[i].summary.guid %>'>
    <div class='match-link-mode-color match-link-mode-<%= games[i].summary.team_mode %>'></div>
    <div class='hide-xs col-2'>
      <div class='match-link-player-icons'>
        <% for (var j=0; j < games[i].summary.team_count; j++) { %>
        <div class='match-link-player-icon'></div>
        <% } %>
      </div>
      <div class='match-link-start-time'>
        <% var timeDiff='' ; var timeStart=new Date(games[i].summary.end_time); var now=Date.now(); var
                    secondsPast=(now - timeStart.getTime()) / 1000; if (secondsPast < 3600) { var
                    minutes=Math.round(secondsPast/60); timeDiff=minutes < 2 ? '1 minute ago' : minutes + ' minutes ago'
                    ; } else if (secondsPast <=86400) { var hours=Math.round(secondsPast/3600); timeDiff=hours==1
                    ? 'an hour ago' : hours + ' hours ago' ; } else if (secondsPast> 86400 && secondsPast < 172800) {
                      timeDiff=Math.floor(secondsPast/86400) + ' day ago' ; } else if (secondsPast> 86400) { timeDiff =
                      Math.floor(secondsPast/86400) + ' days ago'; } %> <%= timeDiff %>
      </div>
    </div>
    <div class='col-3'>
      <div class='match-link-stat'>
        <% var modeText=games[i].summary.team_mode; modeText=modeText.charAt(0).toUpperCase() +
                    modeText.slice(1); %>
        <div class='match-link-stat-name match-link-stat-name-lg'>
          <%= modeText %> Rank
        </div>
        <div class='match-link-stat-value match-link-stat-value-lg'> <span class='match-link-stat-rank match-link-stat-<%= games[i].summary.rank %>'>#<%=
                          games[i].summary.rank %></span> /<%= games[i].summary.team_total || 80 %>
        </div>
      </div>
    </div>
    <div class='col-2 col-md-1'>
      <div class='match-link-stat'>
        <div class='match-link-stat-name match-link-stat-name-md'>Kills</div>
        <div class='match-link-stat-value match-link-stat-value-md'>
          <%= games[i].summary.kills %>
        </div>
      </div>
    </div>
    <% if (games[i].summary.team_mode !='solo' ) { %>
    <div class='hide-xs col-md-1'>
      <div class='match-link-stat'>
        <div class='match-link-stat-name match-link-stat-name-md'>Team Kills</div>
        <div class='match-link-stat-value match-link-stat-value-md'>
          <%= games[i].summary.team_kills || 0 %>
        </div>
      </div>
    </div>
    <% } %>
    <div class='col-2 col-md-1 <%= games[i].summary.team_mode == ' solo' ? 'offset-md-1' : '' %>'>
      <div class='match-link-stat'>
        <div class='match-link-stat-name match-link-stat-name-md'>Damage Dealt</div>
        <div class='match-link-stat-value match-link-stat-value-md'>
          <%= games[i].summary.damage_dealt %>
        </div>
      </div>
    </div>
    <div class='col-2 col-md-1'>
      <div class='match-link-stat'>
        <div class='match-link-stat-name match-link-stat-name-md'>Damage Taken</div>
        <div class='match-link-stat-value match-link-stat-value-md'>
          <%= games[i].summary.damage_taken %>
        </div>
      </div>
    </div>
    <div class='col-2 col-md-1'>
      <div class='match-link-stat'>
        <div class='match-link-stat-name match-link-stat-name-md'>Survived</div>
        <div class='match-link-stat-value match-link-stat-value-md'>
          <% var timeAlive=games[i].summary.time_alive; var minutes=Math.floor(timeAlive / 60) % 60; var
                          seconds=Math.floor(timeAlive) % 60; if (seconds < 10) {seconds="0" + seconds}; var timeSurv=''
                          ; timeSurv +=minutes + ':' ; timeSurv +=seconds; %>
          <%= timeSurv %>
        </div>
      </div>
    </div> <!-- Game mode icon -->
    <div class='hide-xs col-md-1'>
      <% if (games[i].summary.icon) { %>
      <div class='match-link-stat'>
        <div class='game-mode-icon' style='background-image: url(/<%= games[i].summary.icon %>)'></div>
      </div>
      <% } %>
    </div> <!-- Expand/Unexpand icon -->
    <div class='offset-0 col-1 pl-0 pr-0'>
      <div class='match-link-expand <%= games[i].expanded ? ' match-link-expand-up'
                      : 'match-link-expand-down' %>'> </div>
    </div>
    <% if (games[i].expanded) { %>
    <div id='match-data' class='col-lg-12'>
      <!-- match-data.ejs -->
    </div>
    <% } %>
  </div>
  <% } %>
</div>
<% if (moreGamesAvailable) { %>
<% if (loading) { %>
<!-- Loading more games -->
<div class="col-12 spinner-wrapper-match-data">
  <div class="spinner"></div>
</div>
<% } else { %>
<div class='col-12 js-match-load-more btn-darken'>More</div>
<% } %>
<% } %>
<% } %>
</div>
`

  return ejs.render(templateString, params , {     client: true,   });
}
