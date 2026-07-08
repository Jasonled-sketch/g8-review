const fs = require('fs');
const cp = require('child_process');

const subjects = ['chinese', 'english', 'math', 'science', 'social'];
let allOk = true;
let output = '';

subjects.forEach(sub => {
  output += `\n=== Subject: ${sub} ===\n`;
  const oldContent = cp.execSync(`git show HEAD:data/${sub}.js`, { encoding: 'utf8' });
  const newContent = fs.readFileSync(`data/${sub}.js`, 'utf8');

  function parseData(jsStr, key) {
    let jsonStr = jsStr.replace(/window\.QB\s*=\s*window\.QB\s*\|\|\s*\{\};\n?window\.QB\["([^"]+)"\]\s*=\s*/, '');
    jsonStr = jsonStr.replace(/;\s*$/, '');
    let obj;
    try { obj = eval('(' + jsonStr + ')'); } catch (e) { return null; }
    return obj;
  }

  const oldData = parseData(oldContent, sub);
  const newData = parseData(newContent, sub);

  if (!oldData || !newData) return;

  let oldQCount = 0;
  let newQCount = 0;
  let hasDiffInOld = false;
  let allNewQs = [];
  const oldQuestions = new Map();

  oldData.units.forEach(u => {
    (u.questions || []).forEach(q => {
      oldQCount++;
      oldQuestions.set(q.q, q);
    });
  });

  newData.units.forEach(u => {
    (u.questions || []).forEach(q => {
      newQCount++;
      if (oldQuestions.has(q.q)) {
        const oq = oldQuestions.get(q.q);
        if (JSON.stringify(oq.options) !== JSON.stringify(q.options) || oq.a !== q.a || oq.exp !== q.exp) {
          hasDiffInOld = true;
          output += `Old question modified: ${q.q}\n`;
        }
      } else {
        allNewQs.push(q);
      }
    });
  });

  output += `Old count: ${oldQCount}, New total count: ${newQCount}\n`;
  if (hasDiffInOld) {
    output += `ERROR: Old questions were modified!\n`;
    allOk = false;
  }

  newData.units.forEach(u => {
    (u.questions || []).forEach(q => {
      if (!q.q || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.a !== 'number' || q.a < 0 || q.a > 3 || !q.exp) {
        output += `Schema error in question: ${q.q}\n`;
      }
    });
  });

  const sample = allNewQs.slice(0, 15);
  output += `\nSample of 15 new questions for ${sub}:\n`;
  sample.forEach((q, i) => {
    output += `[Q${i+1}] ${q.q}\n`;
    q.options.forEach((opt, j) => {
      output += `  ${['A','B','C','D'][j]}. ${opt}${j===q.a ? ' (CORRECT)' : ''}\n`;
    });
    output += `  Exp: ${q.exp}\n\n`;
  });
});

fs.writeFileSync('scratch/output_utf8.txt', output, 'utf8');
