import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";

export const leaderboardRouter = new Hono<Context>();

const leaderboardSchema = z.object({
    interval: z.enum(["daily", "weekly", "alltime"]).catch("daily"),
    mapId: z.string().min(1),
    maxCount: z.number(),
    teamMode: z.enum(["solo", "duo", "squad"]).catch("solo"),
    type: z.enum(["most_kills", "most_damage_dealt", "kpg", "kills", "wins"]),
});

leaderboardRouter.post(
    "/",
    zValidator("json", leaderboardSchema, (result, c) => {
        if (!result.success) {
            return c.json(
                {
                    message: "Invalid params",
                },
                400,
            );
        }
    }),
    async (c) => {
        return c.json<LeaderboardReturnType[]>(json, 200);
    },
);

type LeaderboardReturnType =
    | {
          slug: string;
          username: string;
          avatar: number;
          region: string;
          games: number;
          val: number;
      }
    | {
          slugs: (string | null)[];
          usernames: string[];
          region: string;
          val: number;
      };

var json: LeaderboardReturnType[] = [
    {
        slugs: [null, null, "cosmic-fofo-lbs", "test27"],
        usernames: ["cosmic room", "cosmicminastuder", "cosmic FOFO", "cosmic Ryan Kent"],
        region: "na",
        val: 43,
    },
    {
        slugs: ["fofo", "whalefish-lbs", "cosmic-gorq", "test27"],
        usernames: ["cosmic FOFO", "LB/WR WHALE", "cosmic kennytete", "cosmic Ryan Kent"],
        region: "na",
        val: 43,
    },
    {
        slugs: [null, "eu-nibo", "belogvardeec", "sorry_but_sorry"],
        usernames: ["Ramsey", "Nibo eu", "Biloug [EU]", "sorry but sorry"],
        region: "eu",
        val: 41,
    },
    {
        slugs: [null, "sorry_but_sorry", "merki_011", "juulkeplays"],
        usernames: ["[EU] Deathalls", "olimpiq", "[eu] Merki", "[TT/GL] Juul"],
        region: "eu",
        val: 41,
    },
    {
        slugs: [null, null, "fofo", "test27"],
        usernames: ["cosmic room", "cosmic desmos*", "cosmic FOFO", "cosmic Ryan Kent"],
        region: "na",
        val: 39,
    },
    {
        slugs: [null, "sorry_but_sorry", "merki_011", "juulkeplaysreal"],
        usernames: ["[EU] Deathalls", "olimpiq", "[eu] Merki", "[TT/GL] Juul"],
        region: "eu",
        val: 38,
    },
    {
        slugs: ["whalefish-lbs", null],
        usernames: ["lb/wr whale", "cosmic gorkent"],
        region: "na",
        val: 37,
    },
    {
        slugs: [null, "belogvardeec", "sorry_but_sorry"],
        usernames: ["Ramsey", "Biloug [EU]", "sorry but sorry"],
        region: "eu",
        val: 34,
    },
    {
        slugs: [null, "olimpiq", "kitty42", "rainbow25"],
        usernames: ["Deathly", "olimpiq", "Kitty", "big chungus"],
        region: "eu",
        val: 34,
    },
    {
        slugs: [null, "j4ba", "sorry_but_sorry", "merki_011"],
        usernames: ["[EU] Deathalls", "(EU)J4BAVEVO", "olimpiq", "[eu] Merki"],
        region: "eu",
        val: 34,
    },
    {
        slugs: [null, null, null, "matrix_gamer02"],
        usernames: ["balon kafa", "im;sad :,([TP]", "Dog", "Player"],
        region: "kr",
        val: 34,
    },
    {
        slugs: ["xan", "plexos", null, "beeber"],
        usernames: ["DS | Goth Angel", "IDontKnowHowPlay", "Levi", "ImJustAKidWhose4"],
        region: "na",
        val: 34,
    },
    {
        slugs: ["glpmicky", "geulpi-mon0rail", "common-satania", "enpic"],
        usernames: ["[GLP]Micky", "[Geulpi] mon0rai", "[KR]Right hand..", "ENPIC"],
        region: "kr",
        val: 33,
    },
    {
        slugs: [null, "j4ba", "merki_011"],
        usernames: ["[EU]OSC4RVEVO", "(EU)J4BAVEVO", "Merki"],
        region: "eu",
        val: 33,
    },
    {
        slugs: [null, null, null, "ray-35"],
        usernames: ["Gutto_456", "amaya", "Bitbat", "Ray#35"],
        region: "na",
        val: 33,
    },
    {
        slugs: ["chisp-on-lbs", "whalefish-lbs", "cosmic-fofo-lbs1", null],
        usernames: ["lb/wr kenny tete", "lb/wr whale", "cosmic FOFO", "cosmic gorkent"],
        region: "na",
        val: 33,
    },
    {
        slugs: [null, "j4ba", "belogvardeec", "sorry_but_sorry"],
        usernames: ["Ramsey", "(EU)FROG", "Biloug [EU]", "sorry but sorry"],
        region: "eu",
        val: 32,
    },
    {
        slugs: [null, null, "bad-and-bujan", "dinkmshrake7"],
        usernames: ["[DINK]Bushrat", "[DINK]Squig", "[DINK]Kirk", "[DINK]Miyagi"],
        region: "na",
        val: 32,
    },
    {
        slugs: [null, null, "sorry_but_sorry", "merki_011"],
        usernames: ["[TT/GL] Juul", "[EU] Deathalls", "olimpiq", "[eu] Merki"],
        region: "eu",
        val: 32,
    },
    {
        slugs: ["fofo", "spirit_breaker"],
        usernames: ["cosmic FOFO", "|Zzz|Wind -_-"],
        region: "na",
        val: 32,
    },
    {
        slugs: [null, "grump", "icarus5", "rjizzle4shizzle"],
        usernames: ["GZA aka JyzK", "grump", "icarus", "Luna"],
        region: "na",
        val: 32,
    },
    {
        slugs: [null, "dz_ve8m", "eu-nibo", "coldfire1"],
        usernames: ["Ramsey", "[EU] Dz_venom", "Nibobo", "[EU].:ColdFire:."],
        region: "eu",
        val: 32,
    },
    {
        slugs: ["tari_jp", null, null, "hahaha17"],
        usernames: ["[TM]tari_jp", "Zenjidou", "Zenjidou", "Zenjidou"],
        region: "as",
        val: 32,
    },
    {
        slugs: [null, "korea37", "junho1", null],
        usernames: ["Player", "EUNSEO", "JUNHO", "9999999999999998"],
        region: "kr",
        val: 32,
    },
    {
        slugs: [null, "sunny7", "k1", "25killssolo"],
        usernames: ["Xx g0dak xX", "XxSUNNYxX", "K", "Xx Preacher xX"],
        region: "eu",
        val: 32,
    },
    {
        slugs: ["manner1", "profake20", "icreamcat", "geulpi-mon0rail"],
        usernames: ["MANNER", "[Geulpi]Yue", "cartoon candy", "[Geulpi] mon0rai"],
        region: "kr",
        val: 32,
    },
    {
        slugs: [null, null, "olimpiq", "belogvardeec"],
        usernames: ["#499478416713012", "Ramsey", "olimpiq", "biloug"],
        region: "eu",
        val: 31,
    },
    {
        slugs: [null, null, null, "olimpiq"],
        usernames: ["Deathly", "Alphatree", "X/", "olimpiq"],
        region: "eu",
        val: 31,
    },
    {
        slugs: [null, "j4ba", "sorry_but_sorry"],
        usernames: ["Ramsey", "(EU)FROG", "sorry but sorry"],
        region: "eu",
        val: 31,
    },
    {
        slugs: [null, "sgt_lightning", "damienvesper", "emeraldked1"],
        usernames: ["[DM/F] Pesty", "SGT_Lightning", "Vesp #GetRekt", "[PT]Exi"],
        region: "na",
        val: 31,
    },
    {
        slugs: ["common-satania", "manner1", "enpic", "cartoon-candy"],
        usernames: ["[KR]Right hand..", "MANNER", "ENPIC", "cartoon candy"],
        region: "kr",
        val: 31,
    },
    {
        slugs: [null, null, "friends13", "frankanoodel1"],
        usernames: ["Troll", "Dog", "Kill or killed", "RFANK"],
        region: "kr",
        val: 31,
    },
    {
        slugs: ["coldfire1", "dz_ve8m", null, null],
        usernames: ["[EU].:ColdFire:.", "[EU] Dz_venom", "Ramsey", "EU Destiny Death"],
        region: "eu",
        val: 31,
    },
    {
        slugs: ["noob-pro6", null, "megaexe-br-1v4"],
        usernames: ["MBR/ BadWolf", "Bc3 I Lucaputo", "BR3 | MeGaEXE"],
        region: "sa",
        val: 31,
    },
    {
        slugs: ["yeetkyle", null],
        usernames: ["Matthew Colbert", "Mistress Mara"],
        region: "na",
        val: 31,
    },
    {
        slugs: ["25killssolo", "k1", null],
        usernames: ["W", "\\/\\/", "cute"],
        region: "eu",
        val: 31,
    },
    {
        slugs: ["manner1", "icreamcat", "profake20", "geulpi-mon0rail"],
        usernames: ["MANNER", "cartoon candy", "[Geulpi]Yue", "[Geulpi] mon0rai"],
        region: "kr",
        val: 31,
    },
    {
        slugs: [null, "chicken-nuggs", null, null],
        usernames: ["Player", "Chicks nuggs", "[japan]cool boy", "Player"],
        region: "as",
        val: 31,
    },
    {
        slugs: ["firo", "krmagoon_blyat", "geulpi-mon0rail", "icreamcat"],
        usernames: ["Firo", "Magoon", "String mon0rail;", "cartoon candy"],
        region: "kr",
        val: 31,
    },
    {
        slugs: ["doomsday", null, "olimpiq", null],
        usernames: ["DOOMS|DAY", "[TT] Juul", "olimpiq", "EU BrokcIsDead"],
        region: "eu",
        val: 31,
    },
    {
        slugs: [null, null, null, "prodigi"],
        usernames: ["Surviv.io", "Duck", "ultra eduar4", "PRODIGI"],
        region: "na",
        val: 30,
    },
    {
        slugs: [null, "ibwr-lol", "tsm-kahootmaster", "tsm_megafaggit"],
        usernames: ["Ib/wr Quiche", "lb/wr lol", "Ib/wr uplink", "lb/wr TSM"],
        region: "na",
        val: 30,
    },
    {
        slugs: ["geulpi-mon0rail", "profake20", "common-satania", "nikkuni"],
        usernames: ["GeulPi-mon0rail", "[Geulpi]Yue", "[KR]Right hand..", "Shien Chiao"],
        region: "kr",
        val: 30,
    },
    {
        slugs: [null, "hitokiri-noob"],
        usernames: ["D:", "D:"],
        region: "sa",
        val: 30,
    },
    {
        slugs: ["dz_ve8m", null, null],
        usernames: ["[EU] Dz_venom", "Ramsey", "EU Destiny Death"],
        region: "eu",
        val: 30,
    },
    {
        slugs: ["player394"],
        usernames: ["Player"],
        region: "kr",
        val: 30,
    },
    {
        slugs: [null, null, "aqua24", null],
        usernames: ["«áÏáÏ", "15915", "¢¯¢", "Player"],
        region: "as",
        val: 30,
    },
    {
        slugs: ["tsm_dragon", "tsm_yukii"],
        usernames: ["TSM_Dragon", "TSM_Yukii"],
        region: "na",
        val: 30,
    },
    {
        slugs: ["x-poison", "vsmultimatewar", "beeber", null],
        usernames: ["x poison", "[VSM]UltimateWar", "Thicc Bot", "Levi"],
        region: "na",
        val: 30,
    },
    {
        slugs: [null, "chap", "the-air-strike", "hodu4"],
        usernames: ["Pr.O", "chapSsal", "ekirts ria ehT", "Hodu4"],
        region: "kr",
        val: 29,
    },
    {
        slugs: [null, null, "olimpiq", "big-daddio"],
        usernames: ["tax fraud hammer", "[TT] Juul", "OL1MP", 'Big Daddio"'],
        region: "eu",
        val: 29,
    },
    {
        slugs: [null, "theunknownguy", "merki_011"],
        usernames: ["Oscar", "[PSF] UnknownGuy", "Merki"],
        region: "eu",
        val: 29,
    },
    {
        slugs: ["karmon", "opop_sam", "the-air-strike", "hodu4"],
        usernames: ["karmon", "[PLAN] Chocopie", "Yomojomo", "Hodu4"],
        region: "kr",
        val: 29,
    },
    {
        slugs: [null, "mckellen", "olimpiq", "geo9"],
        usernames: ["Deathly", "McKellen", "WHY?", "im lagging hard"],
        region: "eu",
        val: 29,
    },
    {
        slugs: [null, "olimpiq", "belogvardeec"],
        usernames: ["Ramsey", "olimpiq", "biloug"],
        region: "eu",
        val: 29,
    },
    {
        slugs: ["geulpi-mon0rail", "common-satania"],
        usernames: ["GeulPi-mon0rail", "[KR]Right hand.."],
        region: "kr",
        val: 29,
    },
    {
        slugs: [null, "megacratzy-wm", "asfwhitedeath", "el-brayan6"],
        usernames: ["Controlla", "T.tv/MegaCratzy", "[ASF]Jazz", "peppa pig"],
        region: "na",
        val: 29,
    },
    {
        slugs: [null, "nogame"],
        usernames: ["dkdkddk", "[kor] NoGame"],
        region: "kr",
        val: 29,
    },
    {
        slugs: [null, null, "footpop", "pnok"],
        usernames: ["may", "washy", "footgod", "'X_f7A`\u001B!pb4'"],
        region: "na",
        val: 29,
    },
    {
        slugs: [null, "mediastino", "ivaance", "htg1"],
        usernames: ["EL CARREADOR", "ANTONIA MACRI", "ivaance", "black anon"],
        region: "sa",
        val: 29,
    },
    {
        slugs: ["celestial2", "lcmr.trickster"],
        usernames: ["[TR]CeLestial", "[LC]Mr.Trickster"],
        region: "na",
        val: 29,
    },
    {
        slugs: [null, "jimmy57"],
        usernames: ["nightcat", "Jimmy"],
        region: "kr",
        val: 29,
    },
    {
        slugs: [null, "coldfire1", "smarties1"],
        usernames: ["Ramsey", "[EU].:ColdFire:.", "smartz"],
        region: "eu",
        val: 29,
    },
    {
        slugs: ["pedro52", "david-966", null, null],
        usernames: ["the noob", "david966", "aGD", "Player"],
        region: "sa",
        val: 29,
    },
    {
        slugs: ["icarus5", "bu", null, null],
        usernames: ["icarus", "B|u", "im ya vnUs", "ido"],
        region: "na",
        val: 29,
    },
    {
        slugs: ["gg-chuy1", "gg-brahian", "moay-gamer"],
        usernames: ["GG Chuy", "GG Brahian", "GG Moay"],
        region: "na",
        val: 29,
    },
    {
        slugs: ["usfdoodle", "remjem919124513", "rsevil_deeds", "bdawg"],
        usernames: ["[USF]doodle", "RemJem91912#4513", "dy/dx Evil_Deeds", "bdawg"],
        region: "na",
        val: 29,
    },
    {
        slugs: [null, "marcorey", null, null],
        usernames: ["[DM] Pro/Noob", "Marcorey", "LOLKA  FOOTBOLKA", "skil"],
        region: "eu",
        val: 29,
    },
    {
        slugs: ["sparky235", null, "soup20", null],
        usernames: ["Player", "Player", "dick cheese", "Player"],
        region: "na",
        val: 29,
    },
    {
        slugs: [null, null, null, "judy"],
        usernames: ["Dog", "KOREAN = noob", "cool", "Player"],
        region: "kr",
        val: 29,
    },
    {
        slugs: ["olimpiq", "smarties1", null, null],
        usernames: ["olimpiq", "eu smartz", "ypa", "[EU] Deathalls"],
        region: "eu",
        val: 29,
    },
    {
        slugs: ["light39", null, "daddy144", "ben-blame-lag"],
        usernames: ["=þJP", "100", "Yo", "Dan [EN] M9 Ben"],
        region: "as",
        val: 29,
    },
    {
        slugs: [null, null, "zonez", null],
        usernames: ["IHASYOU", "heli is meeeeeee", "ZoneZ", "Name"],
        region: "eu",
        val: 29,
    },
    {
        slugs: ["ata2", null, null, "tsm-myth63"],
        usernames: ["AtA", "Player", "Player", "PenisBandit"],
        region: "na",
        val: 29,
    },
    {
        slugs: ["nikkuni", "kicmk-hero3"],
        usernames: ["Just Shien", "[KIC]Mk Hero_SF"],
        region: "kr",
        val: 28,
    },
    {
        slugs: [null, null, "yeetkyle"],
        usernames: ["Mistress Mara", "Bill Clinton", "lil jizz stain"],
        region: "na",
        val: 28,
    },
    {
        slugs: [null, "pomboprimavera", "flavaodamassa", "gd-danielgamer"],
        usernames: ["Alan 777", "RolinhaPrimavera", "Divorciado", "oloquinho meu"],
        region: "sa",
        val: 28,
    },
    {
        slugs: [null, "cummies", "lvp"],
        usernames: ["Player", "Cummies", "LVP"],
        region: "na",
        val: 28,
    },
    {
        slugs: ["demon13371", "teenager", "zz-kss"],
        usernames: ["Demon1337", "teenager", "[ZZ} Kcss"],
        region: "eu",
        val: 28,
    },
    {
        slugs: [null, null, "trisha1", "awa5"],
        usernames: ["dfdfs", "dark soul16", "Trisha", "A!W!A YT"],
        region: "na",
        val: 28,
    },
    {
        slugs: [null, "inaki", "nizaritoo", "_dark_gamer_"],
        usernames: ["Vaati", "iñaki", "Nizaritoo", "Po3eTKa!"],
        region: "eu",
        val: 28,
    },
    {
        slugs: [null, null, "niggaman", "aqua24"],
        usernames: ["Pika", "«áÏáÏ", "niggaman", "¢¯¢"],
        region: "kr",
        val: 28,
    },
    {
        slugs: ["olimpiq", "kitty42"],
        usernames: ["olimpiq", "Kitty"],
        region: "eu",
        val: 28,
    },
    {
        slugs: [null, null, "the-air-strike", "harith-bouhad"],
        usernames: ["Victor", "Moto moto", "Player", "weirdo"],
        region: "kr",
        val: 28,
    },
    {
        slugs: [null, "stipecro", "olimpiq", "ayxan2"],
        usernames: ["Liz", "StipeCRO", "OL1MP", "Core"],
        region: "eu",
        val: 28,
    },
    {
        slugs: [null, "bush_did_911", "player38"],
        usernames: ["Player", "Something_Racist", "Spray n pray"],
        region: "na",
        val: 28,
    },
    {
        slugs: [null, "g-r-e-e-n", "bbcalex", "rsbillyboy"],
        usernames: ["Dot Player", "G R E E N", "A.L.P.H.A ALEX", "[RS]Billyboy"],
        region: "na",
        val: 28,
    },
    {
        slugs: ["v70", "v-2.01"],
        usernames: ["abduzcan!! :v", "sebaskof12"],
        region: "na",
        val: 28,
    },
    {
        slugs: [null, "dunno5", "elmattixdburzaco", "lvciffer"],
        usernames: ["MR. faso", "Ðunno D77", "El Mattix", "Infierna"],
        region: "sa",
        val: 28,
    },
    {
        slugs: ["aidsinafrica", "bryce55", "terry-miguel"],
        usernames: ["K[Z]AidsinAfrica", "KING[Z]brycegum", "KING[Z]TerryWet"],
        region: "na",
        val: 28,
    },
    {
        slugs: ["geulpi-mon0rail", "common-satania", "nikkuni"],
        usernames: ["GeulPi-mon0rail", "[KR]Right hand..", "Shien-Chiao"],
        region: "kr",
        val: 28,
    },
    {
        slugs: [null, "sultan3", "coookiiie", "noob-spectator"],
        usernames: ["Liz", "Not a bot", "Coookiiiiee", "commander potato"],
        region: "eu",
        val: 28,
    },
    {
        slugs: [null, null, null, "hwi"],
        usernames: ["Yeah boiiiiiiiii", "Player", "rt", "HWI"],
        region: "kr",
        val: 28,
    },
    {
        slugs: [null, null, null, "newmetamong"],
        usernames: ["Stupid dud", "matt", "Firetto", "(KR) newmetamong"],
        region: "kr",
        val: 28,
    },
    {
        slugs: [null, null, null, "cat66"],
        usernames: ["Kojima", "TAE BO HAE!!!!", "14132", "Mr *Cat*"],
        region: "kr",
        val: 28,
    },
    {
        slugs: [null, null, "sos-pistolwipp", "ss-tavarius1"],
        usernames: ["[SS] ASD", "[SS] WompWomp", "[SS] PistolWipp", "[SS] Tavarius"],
        region: "na",
        val: 28,
    },
    {
        slugs: [null, null, "henrique16", "jellyshot"],
        usernames: ["Hei", "f", "soumitosemeajuda", "TRENTO\u003Etwix"],
        region: "sa",
        val: 28,
    },
    {
        slugs: [null, null, "theprofessor1"],
        usernames: ["{eRazoR}-LEGACY", "{eRazoR}-FrAnKzY", "theprofessor"],
        region: "na",
        val: 28,
    },
    {
        slugs: [null, null, null, "aaronxdpro1980"],
        usernames: ["SM64", "PROGAMER", "[KR]Rain", "AaronXDPRO"],
        region: "kr",
        val: 28,
    },
    {
        slugs: [null, "cornylildaddy", "everettthegod"],
        usernames: ["bop", "cornylildaddy", "HERE THE CODE"],
        region: "na",
        val: 28,
    },
];
