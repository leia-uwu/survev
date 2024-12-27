export default function(params) {
  const templateString = `
    <a class="nav-link dropdown-toggle" href="#" id="selected-language" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><%= code.toUpperCase() %></a><div class="dropdown-menu" aria-labelledby="navbarDropdown">    <a class="dropdown-item dropdown-language" href="#" value='en'>English</a>    <a class="dropdown-item dropdown-language" href="#" value='es'>Español</a></div>`
    return ejs.render(templateString, params , {     client: true,   });
}
