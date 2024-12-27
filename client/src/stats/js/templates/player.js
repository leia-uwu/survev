import ejs from "ejs";
export default function(params) {
  const templateString = `
  <div class="col-12 p-lg-3 p-0">
  <div class="content"></div>
</div>
`
  return ejs.render(templateString, params , {     client: true,   });
}
