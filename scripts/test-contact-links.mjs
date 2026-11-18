import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../dist/lab/modern/index.html',import.meta.url),'utf8');
const homepage=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const expected=source
  .replace(/^[ \t]*<meta name="(?:robots|googlebot)" content="noindex, nofollow">\n/gm,'')
  .replace(/((?:href|src)=")\.\//g,'$1/lab/modern/');

assert.equal(homepage,expected,'Published homepage must mirror the modern source');
for(const [label,subject] of [
  ['Recruiting','Recruiting%20inquiry'],
  ['Project inquiry','Project%20inquiry'],
  ['General','General%20inquiry'],
]){
  assert.ok(source.includes('href="mailto:contact@zelunhe.com?subject='+subject+'"'),'Missing '+label+' email option');
}
assert.equal((source.match(/class="contact-route"/g)||[]).length,3,'Three distinct categories');
assert.ok(source.includes('href="mailto:contact@zelunhe.com"'),'Direct mailto fallback must work without JavaScript');
assert.ok(source.includes('<small>contact@zelunhe.com</small>'),'Readable copyable email address');
assert.ok(!source.includes('mailto:zelunhe@gmail.com'),'Remove the old contact CTA');
const contact=source.split('<section class="contact section-pad"')[1]||'';
assert.ok(contact.includes('aria-label="Choose a reason to get in touch"'),'Contact options must be named for assistive tech');
assert.ok(!contact.includes('<form'),'No unprotected public form submission endpoint');
console.log('Portfolio contact link checks passed.');
