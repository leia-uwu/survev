import { GameImagePaths } from "../util/gameImages";

export default function generatePropertyTable(obj: any): string {
    let buffer = "";
    buffer += "<table style='font-size: 0.7rem; max-width: 60ch;'>";

    buffer += "<thead>";
    buffer += "<tr>";
    buffer += "<th>Property</th>";
    buffer += "<th>Value</th>";
    buffer += "</tr>";
    buffer += "</thead>";

    buffer += "<tbody>";
    for (const [property, value] of Object.entries(obj)) {
        buffer += "<tr>";
        buffer += `<td><b>${property}</b></td>`;
        buffer += "<td>";
        switch (true) {
            case typeof value === "string" && value.endsWith(".img"):
                buffer += `<img src="${GameImagePaths[value]}" height="30">`;
            case typeof value === "string":
                buffer += value;
                break;
            case typeof value === "number" || typeof value === "bigint":
                buffer += value.toString();
                break;
            case typeof value === "boolean":
                buffer += value ? "True" : "False";
                break;
            case typeof value === "object":
                buffer += generatePropertyTable(value);
                break;
            default:
                buffer += "unknown type";
                break;
        }
        buffer += "</td>";
        buffer += "</tr>";
    }
    buffer += "</tbody>";

    buffer += "</table>";

    return buffer;
}
