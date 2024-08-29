import GenerateGunPages from "./generators/guns";
import GenerateMeleePages from "./generators/melees";
import { tryMkdir } from "./util/fs";

tryMkdir("guns");
GenerateGunPages();

tryMkdir("melees");
GenerateMeleePages();
