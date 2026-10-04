import type { IncomingMessage, ServerResponse } from 'node:http';
import https from 'node:https';

const LANG_MAP: Record<string, string> = {
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en-GB',
  ar: 'ar',
  'ar-sa': 'ar',
  so: 'sw',
  'so-so': 'sw',
  fr: 'fr',
  'fr-fr': 'fr',
  es: 'es',
  'es-es': 'es',
  de: 'de',
  'de-de': 'de',
  tr: 'tr',
  'tr-tr': 'tr',
  it: 'it',
  'it-it': 'it',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  ja: 'ja',
  'ja-jp': 'ja',
  sw: 'sw',
  'sw-ke': 'sw',
  ko: 'ko',
  'ko-kr': 'ko',
};

function send(res: ServerResponse, status: number, body: string, contentType = 'text/plain; charset=utf-8') {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  res.end(body);
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, 'Method Not Allowed');
  }

  try {
    const url = new URL(req.url || '/', 'https://muke-e.vercel.app');
    const text = (url.searchParams.get('text') || '').trim();
    const rawLang = (url.searchParams.get('lang') || 'en').toLowerCase().trim();

    if (!text) return send(res, 400, 'No text provided');

    const language = LANG_MAP[rawLang] || LANG_MAP[rawLang.split('-')[0]] || 'en';
    const upstream = new URL('https://translate.google.com/translate_tts');
    upstream.searchParams.set('ie', 'UTF-8');
    upstream.searchParams.set('q', text);
    upstream.searchParams.set('tl', language);
    upstream.searchParams.set('client', 'tw-ob');

    const request = https.get(upstream, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154 Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      },
    }, (upstreamRes) => {
      if (upstreamRes.statusCode !== 200) {
        upstreamRes.resume();
        return send(res, 502, 'Upstream TTS audio error');
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      upstreamRes.pipe(res);
    });

    request.setTimeout(10000, () => {
      request.destroy(new Error('TTS upstream timeout'));
    });

    request.on('error', (error) => {
      console.warn('TTS proxy error:', error.message);
      if (!res.headersSent) send(res, 502, 'TTS upstream error');
      else res.destroy();
    });
  } catch (error) {
    console.warn('TTS handler error:', error);
    return send(res, 500, 'Internal TTS error');
  }
}
