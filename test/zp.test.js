'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { decrypt } = require('../scripts/lib-crypto');

const root = path.join(__dirname, '..');

test('приложение в репозитории зашифровано, открытого текста нет', () => {
  const raw = fs.readFileSync(path.join(root, 'app.enc.json'), 'utf8');
  const d = JSON.parse(raw);
  for (const k of ['s', 'i', 'c', 'n']) assert.ok(d[k], 'нет поля ' + k);
  for (const word of ['Кристина', 'script.google.com', 'Посты', 'Расчёт']) assert.ok(!raw.includes(word), 'в файле виден текст: ' + word);
  const shell = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(!shell.includes('script.google.com') && !shell.includes('Кристина'), 'страница входа не должна содержать данных');
});

test('неверный пароль не расшифровывает приложение', () => {
  const d = JSON.parse(fs.readFileSync(path.join(root, 'app.enc.json'), 'utf8'));
  assert.throws(() => decrypt(d, '0000'));
});

test('приложение расшифровывается паролем и является страницей', () => {
  const pin = process.env.ZP_TEST_PIN;
  if (!pin) return; // пароль в репозитории не хранится; задайте ZP_TEST_PIN для полной проверки
  const d = JSON.parse(fs.readFileSync(path.join(root, 'app.enc.json'), 'utf8'));
  assert.match(decrypt(d, pin), /<html/i);
});
