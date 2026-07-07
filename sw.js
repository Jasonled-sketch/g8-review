/* 國二五科複習快測 service worker — cache-first
   改版務必 bump APP_VERSION(與 index.html 內 APP_VERSION 同步),才會更新快取 */
'use strict';
const APP_VERSION = '1.0.1';
const CACHE_NAME = 'g8review-' + APP_VERSION;

/* 相對路徑,支援 GitHub Pages 子路徑部署 */
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './data/chinese.js',
  './data/english.js',
  './data/math.js',
  './data/science.js',
  './data/social.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      /* 全部成功才安裝,避免離線時缺檔 */
      return cache.addAll(PRECACHE);
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k.indexOf('g8review-') === 0 && k !== CACHE_NAME) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        if(res && res.ok && e.request.url.indexOf(self.location.origin) === 0){
          const copy = res.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, copy); });
        }
        return res;
      }).catch(function(){
        if(e.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504 });
      });
    })
  );
});
