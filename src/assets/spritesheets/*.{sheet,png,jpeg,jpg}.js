function require(name){
    return "/src/assets/spritesheets/" + name
}
export default {
    bird_fly: {png: require("./bird_fly.png")},
    bird_still: {png: require("./bird_still.png")},
    butterfly: {png: require("./butterfly.png"), sheet: require("./butterfly.sheet")},
    fish: {png: require("./fish.png"), sheet: require("./fish.sheet")},
    fox: {png: require("./fox.png"), sheet: require("./fox.sheet")},
    fox_sleep: {png: require("./fox_sleep.png"), sheet: require("./fox_sleep.sheet")},
    fox_wakesup: {png: require("./fox_wakesup.png"), sheet: require("./fox_wakesup.sheet")},
    "ground-flowers": {png: require("./ground-flowers.png"), sheet: require("./ground-flowers.sheet")},
    jumpingrabbit: {png: require("./jumpingrabbit.png"), sheet: require("./jumpingrabbit.sheet")},
    owl: {png: require("./owl.png")},
    owl_sleep: {png: require("./owl_sleep.png")},
    owl_wakeup: {png: require("./owl_wakeup.png")},
    rabbit: {png: require("./rabbit.png")},
    seal: {png: require("./seal.png")},
    temp_grass_sprites: {
        png: require("./temp_grass_sprites.png"),
        sheet: require("./temp_grass_sprites.sheet")
    },
    "temp_sprites-0": {png: require("./temp_sprites-0.png"), sheet: require("./temp_sprites-0.sheet")},
    "temp_sprites-1": {png: require("./temp_sprites-1.png"), sheet: require("./temp_sprites-1.sheet")},
    "temp_sprites-2": {png: require("./temp_sprites-2.png"), sheet: require("./temp_sprites-2.sheet")},
    tokens: {png: require("./tokens.png"), sheet: require("./tokens.sheet")},
    "tree-anim-a": {png: require("./tree-anim-a.png"), sheet: require("./tree-anim-a.sheet")},
    "tree-anim-b": {png: require("./tree-anim-b.png"), sheet: require("./tree-anim-b.sheet")},
    "tree-anim-c": {png: require("./tree-anim-c.png"), sheet: require("./tree-anim-c.sheet")}
};
