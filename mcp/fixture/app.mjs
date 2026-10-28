import { createServer } from 'node:http';

// Both variants use synthetic data. The baseline intentionally lacks two checks.
const initial = () => ({ quantity: 1, documents: [{ id: 'doc-a', owner: 'alice', text: 'synthetic-A' }, { id: 'doc-b', owner: 'bob', text: 'synthetic-B' }] });
for (const [variant, port] of [['vulnerable', 3000], ['fixed', 3001]]) {
  let state = initial();
  const server = createServer(async (req, res) => {
    const reply = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    try {
      if (req.method === 'GET' && req.url === '/state') return reply(200, state);
      if (req.method === 'GET' && req.url === '/identity') return reply(200, { experimentId: process.env.PODORI_EXPERIMENT_ID });
      if (req.method === 'POST' && req.url === '/reset') { state = initial(); return reply(200, state); }
      if (req.method === 'GET' && ['/documents/doc-a', '/documents/doc-b'].includes(req.url)) {
        const account = req.headers['x-account'];
        if (!['alice','bob'].includes(account)) return reply(401, { error: 'synthetic-account-required' });
        const document = state.documents.find(d => `/documents/${d.id}` === req.url);
        if (variant === 'fixed' && document.owner !== account) return reply(403, { error: 'not-owner' });
        return reply(200, document);
      }
      if (req.method === 'POST' && req.url === '/quantity') {
        let text = '';
        for await (const chunk of req) { text += chunk; if (Buffer.byteLength(text) > 256) return reply(413, { error: 'input-limit' }); }
        const data = JSON.parse(text);
        if (variant === 'fixed' && (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).join() !== 'quantity' || !Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 10)) return reply(400, { error: 'invalid-quantity' });
        state.quantity = data.quantity;
        return reply(200, { quantity: state.quantity });
      }
      return reply(404, { error: 'not-found' });
    } catch { return reply(400, { error: 'invalid-json' }); }
  });
  server.requestTimeout = 1000;
  server.headersTimeout = 1000;
  server.maxHeadersCount = 16;
  server.maxConnections = 4;
  server.listen(port, '127.0.0.1');
}
