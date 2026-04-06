import { ParserService } from './src/modules/parser/parser.service';
import { RegexEngine } from './src/modules/parser/regex.engine';
import { AiEngine } from './src/modules/parser/ai.engine';
import { TextHasher } from './src/common/utils/text-hasher.util';

async function testParser() {
  const regexEngine = new RegexEngine();
  const aiEngine = new AiEngine();
  const parserService = new ParserService(regexEngine, aiEngine);

  const testCases = [
    {
      desc: 'Standard UPI Expense (INR)',
      sender: 'VM-HDFC',
      body: 'Rs. 450.00 debited from A/c **4567 on 15-Sep. Info: Zomato@upi. Avl Bal: INR 5000.',
    },
    {
      desc: 'Missing Currency Symbol Expense',
      sender: 'AXISBK',
      body: '1200.50 deducted from your account towards utility bill on 01-Oct.',
    },
    {
      desc: 'OTP / Non-transactional',
      sender: 'SBI-OTP',
      body: 'Your One Time Password (OTP) for online purchase is 564738. Do not share.',
    },
    {
      desc: 'Vague text triggering AI Fallback',
      sender: 'UNKNOWN',
      body: 'Your swiggy order was successful and paid from wallet.',
    }
  ];

  for (const { desc, body, sender } of testCases) {
    console.log(`\n\n--- Test Case: ${desc} ---`);
    console.log(`Body: "${body}"`);

    // Demonstrating Deduplication hash
    const userId = 'user-123';
    const receivedAt = new Date(); // In reality, from SMS metadata
    const hash = TextHasher.generateSmsHash(userId, body, sender, receivedAt);
    console.log(`Deduplication Hash: ${hash}`);

    // Parse the result
    const result = await parserService.parse(body);
    console.log(`Result:`, JSON.stringify(result, null, 2));
  }
}

testParser();
