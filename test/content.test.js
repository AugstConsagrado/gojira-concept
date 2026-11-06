import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {albums,milestones,messages} from '../dist/content.js';

test('discografia conserva os sete álbuns, anos originais e IDs de catálogo verificados',()=>{
  const expected=[['Terra Incognita',2001,1141870792],['The Link',2003,211664936],['From Mars to Sirius',2005,213374112],['The Way of All Flesh',2008,291261388],["L’Enfant Sauvage",2012,525085551],['Magma',2016,1104432592],['Fortitude',2021,1553446829]];
  assert.deepEqual(albums.map(a=>[a.title,a.year,a.appleId]),expected);
  assert.equal(new Set(albums.map(a=>a.url)).size,7);
  for(const album of albums){
    const url=new URL(album.url);assert.equal(url.hostname,'music.apple.com');assert.match(url.pathname,new RegExp(`/album/[^/]+/${album.appleId}$`));
    const path=new URL('../dist/'+album.art,import.meta.url);assert.ok(existsSync(path));const bytes=readFileSync(path);assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);
    assert.match(album.art,/assets\/albums\/[^/]+\.jpg$/);
  }
});
test('faixas ficam associadas ao respectivo álbum e não substituem os títulos dos discos',()=>{
  for(const album of albums){
    assert.equal(album.trackLinks.length,3);
    for(const track of album.trackLinks){const u=new URL(track.url);assert.equal(u.hostname,'music.apple.com');assert.ok(u.pathname.endsWith('/'+album.appleId));assert.match(u.searchParams.get('i'),/^\d+$/);}
  }
  assert.ok(albums[2].trackLinks.some(t=>t.title==='Flying Whales'));
  assert.ok(!albums.some(a=>['Flying Whales','Silvera','Amazonia','The Chant'].includes(a.title)));
});
test('trajetória contém onze marcos ordenados com contexto e referências',()=>{
  assert.deepEqual(milestones.map(m=>m.year),[1996,2001,2003,2005,2008,2012,2016,2017,2021,2024,2025]);
  for(const milestone of milestones){assert.equal(milestone.paragraphs.length,2);assert.ok(milestone.paragraphs.every(p=>p.length>80));assert.equal(new URL(milestone.source).protocol,'https:');}
  assert.match(milestones.at(-1).paragraphs.join(' '),/Marina Viotti e Victor Le Masne/);
});
test('contextos musicais distinguem faixa, álbum, fonte e ano do single',()=>{
  assert.deepEqual(messages.map(m=>m.song),['Amazonia','Born for One Thing','The Chant','Another World']);
  assert.equal(messages.find(m=>m.song==='Another World').year,2020);
  for(const message of messages){assert.equal(albums[message.albumIndex].title,'Fortitude');assert.equal(message.paragraphs.length,2);assert.equal(new URL(message.source).protocol,'https:');assert.ok(new URL(message.trackUrl).searchParams.get('i'));}
});
