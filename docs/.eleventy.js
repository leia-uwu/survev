/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({
        "node_modules/@picocss/pico/css/pico.jade.min.css": "pico.css",
    });
    return {
        dir: {
            includes: "includes",
            output: "dist",
        },
    };
};
