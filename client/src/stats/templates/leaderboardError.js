export default function(params) {
    const templateString = `<div class="leaderboard-error">
  <h2>Unable to load, please try again.</h2>
</div>`;

    return ejs.render(templateString, params);
}
