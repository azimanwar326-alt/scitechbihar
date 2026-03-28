const fs = require("fs");
const axios = require("axios");

async function translate(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const res = await axios.get(url);
  return res.data[0].map(item => item[0]).join("");
}

async function convertData(data) {
  if (Array.isArray(data)) {
    return Promise.all(data.map(convertData));
  } else if (typeof data === "object") {
    let newObj = {};
    for (let key in data) {
      if (key === "q") {
        newObj.q = {
          hi: data.q,
          en: await translate(data.q)
        };
      } else if (key === "options") {
        newObj.options = await Promise.all(
          data.options.map(async opt => ({
            hi: opt,
            en: await translate(opt)
          }))
        );
      } else if (key === "answer") {
        newObj.answer = {
          hi: data.answer,
          en: await translate(data.answer)
        };
      } else {
        newObj[key] = await convertData(data[key]);
      }
    }
    return newObj;
  }
  return data;
}

async function main() {
  const input = JSON.parse(fs.readFileSync("mcq.json", "utf-8"));
  const output = await convertData(input);
  fs.writeFileSync("mcq_bilingual.json", JSON.stringify(output, null, 2));
  console.log("✅ Done! File saved as mcq_bilingual.json");
}

main();