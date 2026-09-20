const fs = require('fs');
const parserCode = fs.readFileSync('js/parser.js', 'utf8');
eval(parserCode.replace('const AIParser =', 'global.AIParser ='));

const sampleData = JSON.parse(fs.readFileSync('data/sample-deck.json', 'utf8'));
const sampleParsed = AIParser._normalizeJsonData(sampleData);
console.log('Sample cards count:', sampleParsed.cards.length);
console.log('Sample card IDs:', sampleParsed.cards.map(c => c.id));

const newQuestionJson = {
  quiz_title: 'Chương mới',
  questions: [
    {
      id: 'q1',
      topic: 'Toán',
      question: '1 + 1 = ?',
      options: [{ id: 'a', text: '2' }, { id: 'b', text: '3' }],
      correct_option_id: 'a'
    }
  ]
};
const userParsed = AIParser._normalizeJsonData(newQuestionJson);
console.log('User card IDs:', userParsed.cards.map(c => c.id));
console.log('COLLISION DETECTED:', userParsed.cards[0].id === sampleParsed.cards[0].id);
