const fs = require('fs');

const subjects = ['chinese', 'english', 'math', 'science', 'social'];
let allOk = true;

subjects.forEach(sub => {
  const content = fs.readFileSync(`data/${sub}.js`, 'utf8');
  function parseData(jsStr) {
    let jsonStr = jsStr.replace(/window\.QB\s*=\s*window\.QB\s*\|\|\s*\{\};\n?window\.QB\["([^"]+)"\]\s*=\s*/, '');
    jsonStr = jsonStr.replace(/;\s*$/, '');
    try { return eval('(' + jsonStr + ')'); } catch (e) { return null; }
  }

  const data = parseData(content);
  if (!data) return;

  const stems = new Set();
  let dupes = 0;
  data.units.forEach(u => {
    (u.questions || []).forEach(q => {
      if (stems.has(q.q)) {
        console.log(`Duplicate found in ${sub}: ${q.q.substring(0, 20)}...`);
        dupes++;
        allOk = false;
      }
      stems.add(q.q);
    });
  });
  if (dupes === 0) console.log(`${sub}: 0 duplicate question stems.`);
});
