import ejs from "ejs";
export default function(params) {
  const templateString = `<% switch (type) {    case 'leaderboard': %>        <div class="col-12 spinner-wrapper-leaderboard">            <div class="spinner"></div>        </div>    <% break; %>    <% case 'player': %>        <div class='container'>            <div class="col-12 spinner-wrapper-player">                <div class="spinner"></div>            </div>        </div>    <% break; %>    <% case 'match_history': %>        <div class="col-12 spinner-wrapper-match-history">            <div class="spinner"></div>        </div>    <% break; %><% } %>
`;
  return ejs.render(templateString, params , {     client: true,   });
}
