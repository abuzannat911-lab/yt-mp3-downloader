export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (url.pathname === '/api/extract' && request.method === 'POST') {
      try {
        const body = await request.json();
        
        const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          },
          body: JSON.stringify({
            url: body.url,
            isAudioOnly: true,
            aFormat: 'mp3',
            audioBitrate: body.quality || '320',
          }),
        });

        const data = await cobaltRes.json();

        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // Proxy MP3 file stream directly to force local PC auto-save
    if (url.pathname === '/api/proxy-download') {
      const targetUrl = url.searchParams.get('url');
      const filename = url.searchParams.get('filename') || 'audio.mp3';

      if (!targetUrl) {
        return new Response('Missing stream url', { status: 400 });
      }

      const mediaRes = await fetch(targetUrl);
      
      const headers = new Headers(mediaRes.headers);
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      headers.set('Content-Type', 'audio/mpeg');
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(mediaRes.body, {
        status: mediaRes.status,
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
