export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { interestRates, liquidity, crudeOil, fiiFlows } = req.body;

    const prompt = `You are Advisor Brain — a macro-to-portfolio thinking system for serious investors.

A user has provided the following macro environment inputs:
- Interest Rates: ${interestRates}
- Liquidity Conditions: ${liquidity}
- Crude Oil Price Trend: ${crudeOil}
- FII Flows: ${fiiFlows}

Generate a structured DSS output with exactly these six sections:

1. MARKET CONTEXT
One paragraph. Frame the current macro environment in plain English. No jargon.

2. ADVISOR INTERPRETATION
Two to three paragraphs. Explain what these macro signals mean for different sectors. Think like an experienced advisor, not a data feed.

3. STRATEGIC POSITIONING VIEW
List 6-8 sectors. For each, state: Overweight Bias / Underweight Bias / Neutral / Reduced Preference. Add one line of reasoning per sector. Never use exact percentages.

4. PORTFOLIO LENS
One paragraph. Reflect on what a typical investor portfolio might look like under these conditions. Use language like "appears defensive" or "slightly aggressive relative to macro conditions."

5. RISK TO VIEW
List 3-4 specific conditions that would invalidate or reverse this macro view. This is mandatory.

6. CONVICTION LEVEL
State one of: Emerging / Building / Strong. Add one sentence of reasoning.

Important rules:
- Never recommend specific stocks
- Never give exact allocation percentages  
- Never say "I recommend" — say "macro conditions suggest" or "positioning bias favours"
- Always include the disclaimer: This output is for macro interpretation only and does not constitute financial advice.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const output = data.content[0].text;
    return res.status(200).json({ output });

  } catch (error) {
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}