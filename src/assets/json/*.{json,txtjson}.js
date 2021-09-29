function require(name){
    return "/src/assets/json/" + name
}

export default {
    "haiku-phrases-en": {json: require("./haiku-phrases-en.json")},
    "haiku-phrases-fr": {json: require("./haiku-phrases-fr.json")}
};
