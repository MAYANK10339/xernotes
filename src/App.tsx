/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Menu,
  Settings,
  Lock,
  Unlock,
  Shield,
  Key,
  Search,
  Plus,
  Trash2,
  Pin,
  PinOff,
  Droplets,
  Palette,
  Copy,
  Check,
  Download,
  Upload,
  ArrowLeft,
  X,
  FileText,
  Clock,
  Tag,
  AlertCircle,
  Eye,
  EyeOff,
  FolderDown,
  RefreshCw,
  CopyPlus,
  SlidersHorizontal,
  FileDown,
  Printer,
  ChevronRight,
  HardDrive,
  Type,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ShieldCheck,
  KeyRound,
  FileArchive,
} from 'lucide-react';

// ==========================================
// Types & Data Structures
// ==========================================

export interface Note {
  id: string;
  title: string;
  content: string; // Plain text or encrypted ciphertext
  isPinned: boolean;
  isLocked: boolean;
  passwordHash?: string; // SHA-256 hash for verification
  salt?: string; // PBKDF2 salt (hex)
  iv?: string; // AES-GCM IV (hex)
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type ThemeId = 'azure_white' | 'obsidian' | 'nordic' | 'emerald' | 'amber' | 'monochrome';

export interface PopupNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
}

interface ThemeConfig {
  id: ThemeId;
  name: string;
  dotColor: string;
  canvasBg: string;
  surfaceBg: string;
  surfaceBgGlass: string;
  accent: string;
  accentHover: string;
  accentText: string;
  borderSubtle: string;
  borderGlass: string;
  badgeBg: string;
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  azure_white: {
    id: 'azure_white',
    name: 'Azure Crystalline (Blue White)',
    dotColor: '#38bdf8',
    canvasBg: 'from-[#07132b] via-[#0c224a] to-[#0f2c61]',
    surfaceBg: 'bg-[#0d234d]',
    surfaceBgGlass: 'bg-white/[0.12] backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_0_rgba(56,189,248,0.22)]',
    accent: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-white font-bold shadow-lg shadow-sky-500/25',
    accentHover: 'hover:from-sky-300 hover:to-blue-400',
    accentText: 'text-sky-300',
    borderSubtle: 'border-sky-800/60',
    borderGlass: 'border-white/30 shadow-[0_8px_32px_0_rgba(56,189,248,0.25)]',
    badgeBg: 'bg-sky-400/20 text-sky-100 border-sky-300/40',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Eclipse',
    dotColor: '#6366f1',
    canvasBg: 'from-slate-950 via-slate-900 to-indigo-950/80',
    surfaceBg: 'bg-slate-900',
    surfaceBgGlass: 'bg-slate-900/60 backdrop-blur-2xl',
    accent: 'bg-indigo-500 text-white',
    accentHover: 'hover:bg-indigo-600',
    accentText: 'text-indigo-400',
    borderSubtle: 'border-slate-800',
    borderGlass: 'border-indigo-500/20 shadow-[0_8px_32px_0_rgba(99,102,241,0.08)]',
    badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Frost',
    dotColor: '#38bdf8',
    canvasBg: 'from-slate-950 via-slate-900 to-sky-950/70',
    surfaceBg: 'bg-slate-900',
    surfaceBgGlass: 'bg-slate-900/60 backdrop-blur-2xl',
    accent: 'bg-sky-500 text-slate-950 font-semibold',
    accentHover: 'hover:bg-sky-400',
    accentText: 'text-sky-400',
    borderSubtle: 'border-slate-800',
    borderGlass: 'border-sky-500/20 shadow-[0_8px_32px_0_rgba(56,189,248,0.08)]',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Botanic',
    dotColor: '#10b981',
    canvasBg: 'from-zinc-950 via-zinc-900 to-emerald-950/60',
    surfaceBg: 'bg-zinc-900',
    surfaceBgGlass: 'bg-zinc-900/60 backdrop-blur-2xl',
    accent: 'bg-emerald-500 text-zinc-950 font-semibold',
    accentHover: 'hover:bg-emerald-400',
    accentText: 'text-emerald-400',
    borderSubtle: 'border-zinc-800',
    borderGlass: 'border-emerald-500/20 shadow-[0_8px_32px_0_rgba(16,185,129,0.08)]',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  amber: {
    id: 'amber',
    name: 'Amber Glow',
    dotColor: '#f59e0b',
    canvasBg: 'from-stone-950 via-stone-900 to-amber-950/50',
    surfaceBg: 'bg-stone-900',
    surfaceBgGlass: 'bg-stone-900/60 backdrop-blur-2xl',
    accent: 'bg-amber-500 text-stone-950 font-semibold',
    accentHover: 'hover:bg-amber-400',
    accentText: 'text-amber-400',
    borderSubtle: 'border-stone-800',
    borderGlass: 'border-amber-500/20 shadow-[0_8px_32px_0_rgba(245,158,11,0.08)]',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Neo Monochrome',
    dotColor: '#e4e4e7',
    canvasBg: 'from-black via-zinc-950 to-neutral-900',
    surfaceBg: 'bg-zinc-900',
    surfaceBgGlass: 'bg-zinc-900/60 backdrop-blur-2xl',
    accent: 'bg-zinc-100 text-zinc-950 font-semibold',
    accentHover: 'hover:bg-white',
    accentText: 'text-zinc-300',
    borderSubtle: 'border-zinc-800',
    borderGlass: 'border-zinc-400/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]',
    badgeBg: 'bg-zinc-800 text-zinc-200 border-zinc-700',
  },
};

// ==========================================
// Web Crypto AES-GCM & PBKDF2 Utilities
// ==========================================

async function hashPasskey(passkey: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(passkey);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveKey(passkey: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passkey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptText(text: string, passkey: string): Promise<{ ciphertext: string; salt: string; iv: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passkey, salt);
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    enc.encode(text)
  );

  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');
  const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return { ciphertext: cipherBase64, salt: saltHex, iv: ivHex };
}

async function decryptText(ciphertext: string, passkey: string, saltHex: string, ivHex: string): Promise<string> {
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const key = await deriveKey(passkey, salt);

  const binaryString = atob(ciphertext);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    bytes as unknown as BufferSource
  );
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}

// ==========================================
// Encrypted Standalone HTML Note Generator
// Generates self-decrypting portable notes with AES-256-GCM
// ==========================================

async function generateEncryptedHtmlNote(
  title: string,
  content: string,
  tags: string[],
  updatedAt: number,
  passkey: string
): Promise<string> {
  const payload = JSON.stringify({
    title: title || 'Untitled Note',
    content,
    tags: tags || [],
    updatedAt,
    exportedAt: Date.now(),
  });

  const encrypted = await encryptText(payload, passkey);
  const safeTitle = (title || 'Protected Note')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - Protected Note (Xernotes)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { min-height: 100vh; background: #090d16; color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 16px; }
    .container { width: 100%; max-width: 680px; }
    .glass-card { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.65); backdrop-filter: blur(24px); }
    .badge-lock { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); margin-bottom: 16px; }
    .badge-open { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 8px; line-height: 1.3; }
    .desc { font-size: 13px; color: #94a3b8; margin-bottom: 22px; line-height: 1.6; }
    .input-wrapper { position: relative; margin-bottom: 16px; }
    input[type="password"], input[type="text"] { width: 100%; padding: 14px 50px 14px 16px; border-radius: 16px; background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255,255,255,0.18); color: #fff; font-size: 14px; outline: none; transition: all 0.2s; }
    input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,0.2); }
    .eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 11px; font-weight: 700; padding: 4px 6px; }
    .eye-btn:hover { color: #fff; }
    .btn { width: 100%; padding: 13px; border-radius: 14px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-primary { background: linear-gradient(135deg, #0284c7, #38bdf8); color: #0f172a; }
    .btn-primary:hover { opacity: 0.95; transform: scale(0.99); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-box { margin-top: 14px; padding: 12px 14px; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.35); color: #fb7185; font-size: 13px; display: none; }
    .content-view { display: none; }
    .note-content-box { margin-top: 20px; padding: 22px; border-radius: 18px; background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255,255,255,0.1); font-size: 15px; line-height: 1.7; white-space: pre-wrap; word-break: break-word; color: #e2e8f0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .tags-container { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .tag-chip { padding: 3px 10px; border-radius: 8px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25); font-size: 11px; font-weight: 600; }
    .meta-line { font-size: 12px; color: #64748b; margin-top: 6px; }
    .actions-bar { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
    .btn-secondary { padding: 10px 16px; border-radius: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: rgba(255,255,255,0.15); }
    .btn-relock { margin-left: auto; background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
    .btn-relock:hover { background: rgba(244, 63, 94, 0.25); }
    .copied-alert { font-size: 12px; color: #34d399; margin-top: 10px; display: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="glass-card" id="lockCard">
      <div class="badge-lock">🔒 AES-256 Encrypted Note</div>
      <h1>${safeTitle}</h1>
      <p class="desc">This file was exported from Xernotes with password protection. Enter the security passkey to decrypt and read the note contents offline.</p>
      
      <div class="input-wrapper">
        <input type="password" id="pwdInput" placeholder="Enter password to unlock..." autocomplete="current-password" autofocus />
        <button type="button" class="eye-btn" id="toggleEye" onclick="toggleVisibility()">SHOW</button>
      </div>

      <button type="button" class="btn btn-primary" id="decryptBtn" onclick="unlockNote()">
        <span>Decrypt &amp; View Note</span>
      </button>

      <div class="error-box" id="errorBox"></div>
    </div>

    <div class="glass-card content-view" id="contentCard">
      <div class="badge-open">🔓 Decrypted Successfully</div>
      <h1 id="unlockedTitle"></h1>
      <div class="meta-line" id="unlockedMeta"></div>
      <div class="tags-container" id="unlockedTags"></div>

      <div class="note-content-box" id="unlockedBody"></div>

      <div class="copied-alert" id="copiedAlert">✓ Note copied to clipboard!</div>

      <div class="actions-bar">
        <button class="btn-secondary" onclick="copyContent()">📋 Copy Note</button>
        <button class="btn-secondary" onclick="window.print()">🖨️ Print / PDF</button>
        <button class="btn-secondary btn-relock" onclick="relockNote()">🔒 Lock Again</button>
      </div>
    </div>
  </div>

  <script>
    const CIPHER_DATA = ${JSON.stringify({
      ciphertext: encrypted.ciphertext,
      salt: encrypted.salt,
      iv: encrypted.iv,
    })};

    function toggleVisibility() {
      const inp = document.getElementById('pwdInput');
      const btn = document.getElementById('toggleEye');
      if (inp.type === 'password') {
        inp.type = 'text';
        btn.textContent = 'HIDE';
      } else {
        inp.type = 'password';
        btn.textContent = 'SHOW';
      }
    }

    document.getElementById('pwdInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') unlockNote();
    });

    async function deriveKey(passkey, salt) {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passkey), { name: 'PBKDF2' }, false, ['deriveKey']);
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
    }

    async function unlockNote() {
      const pwd = document.getElementById('pwdInput').value;
      const err = document.getElementById('errorBox');
      const btn = document.getElementById('decryptBtn');
      err.style.display = 'none';

      if (!pwd) {
        err.textContent = 'Please enter the passkey / password.';
        err.style.display = 'block';
        return;
      }

      btn.textContent = 'Decrypting...';
      btn.disabled = true;

      try {
        const salt = new Uint8Array(CIPHER_DATA.salt.match(/.{1,2}/g).map(function(b) { return parseInt(b, 16); }));
        const iv = new Uint8Array(CIPHER_DATA.iv.match(/.{1,2}/g).map(function(b) { return parseInt(b, 16); }));
        const key = await deriveKey(pwd, salt);
        
        const bin = atob(CIPHER_DATA.ciphertext);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, bytes);
        const text = new TextDecoder().decode(decrypted);
        const data = JSON.parse(text);

        document.getElementById('unlockedTitle').textContent = data.title || 'Untitled Note';
        document.getElementById('unlockedMeta').textContent = 'Last modified: ' + new Date(data.updatedAt).toLocaleString();
        
        const tagsContainer = document.getElementById('unlockedTags');
        tagsContainer.innerHTML = '';
        if (data.tags && data.tags.length) {
          data.tags.forEach(function(t) {
            const span = document.createElement('span');
            span.className = 'tag-chip';
            span.textContent = '#' + t;
            tagsContainer.appendChild(span);
          });
        }

        document.getElementById('unlockedBody').textContent = data.content || '(Empty note content)';

        document.getElementById('lockCard').style.display = 'none';
        document.getElementById('contentCard').style.display = 'block';
      } catch (e) {
        err.textContent = 'Incorrect password! Failed to decrypt note.';
        err.style.display = 'block';
      } finally {
        btn.textContent = 'Decrypt & View Note';
        btn.disabled = false;
      }
    }

    function relockNote() {
      document.getElementById('pwdInput').value = '';
      document.getElementById('lockCard').style.display = 'block';
      document.getElementById('contentCard').style.display = 'none';
    }

    function copyContent() {
      const title = document.getElementById('unlockedTitle').textContent;
      const body = document.getElementById('unlockedBody').textContent;
      navigator.clipboard.writeText(title + '\\n\\n' + body).then(function() {
        const a = document.getElementById('copiedAlert');
        a.style.display = 'block';
        setTimeout(function() { a.style.display = 'none'; }, 2500);
      });
    }
  </script>
</body>
</html>`;
}

async function generateEncryptedHtmlArchive(
  notesToArchive: Note[],
  passkey: string
): Promise<string> {
  const payload = JSON.stringify({
    exportedAt: Date.now(),
    totalNotes: notesToArchive.length,
    notes: notesToArchive.map((n) => ({
      title: n.title || 'Untitled Note',
      content: n.content,
      tags: n.tags || [],
      isPinned: n.isPinned,
      isLocked: n.isLocked,
      updatedAt: n.updatedAt,
      createdAt: n.createdAt,
    })),
  });

  const encrypted = await encryptText(payload, passkey);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xernotes Encrypted Archive (${notesToArchive.length} Notes)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { min-height: 100vh; background: #090d16; color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 16px; }
    .container { width: 100%; max-width: 820px; }
    .glass-card { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.65); backdrop-filter: blur(24px); }
    .badge-lock { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); margin-bottom: 16px; }
    .badge-open { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
    .desc { font-size: 13px; color: #94a3b8; margin-bottom: 22px; line-height: 1.6; }
    .input-wrapper { position: relative; margin-bottom: 16px; }
    input[type="password"], input[type="text"] { width: 100%; padding: 14px 50px 14px 16px; border-radius: 16px; background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255,255,255,0.18); color: #fff; font-size: 14px; outline: none; transition: all 0.2s; }
    input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,0.2); }
    .eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 11px; font-weight: 700; padding: 4px 6px; }
    .eye-btn:hover { color: #fff; }
    .btn { width: 100%; padding: 13px; border-radius: 14px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-primary { background: linear-gradient(135deg, #0284c7, #38bdf8); color: #0f172a; }
    .btn-primary:hover { opacity: 0.95; transform: scale(0.99); }
    .error-box { margin-top: 14px; padding: 12px 14px; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.35); color: #fb7185; font-size: 13px; display: none; }
    .content-view { display: none; }
    .archive-layout { display: grid; grid-template-columns: 280px 1fr; gap: 18px; margin-top: 18px; }
    @media (max-width: 640px) { .archive-layout { grid-template-columns: 1fr; } }
    .notes-list { max-height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 6px; }
    .note-item { padding: 12px; border-radius: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s; text-align: left; }
    .note-item:hover, .note-item.active { background: rgba(56,189,248,0.15); border-color: rgba(56,189,248,0.4); }
    .note-item-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .note-item-date { font-size: 11px; color: #64748b; }
    .note-viewer { background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; }
    .note-viewer-body { flex: 1; max-height: 400px; overflow-y: auto; margin-top: 14px; font-size: 14px; line-height: 1.7; white-space: pre-wrap; word-break: break-word; color: #e2e8f0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .btn-secondary { padding: 8px 14px; border-radius: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
    .tag-chip { padding: 2px 8px; border-radius: 6px; background: rgba(56,189,248,0.12); color: #38bdf8; font-size: 10px; margin-right: 4px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="glass-card" id="lockCard">
      <div class="badge-lock">🔒 AES-256 Encrypted Vault</div>
      <h1>Xernotes Encrypted Archive</h1>
      <p class="desc">This file contains an encrypted vault of ${notesToArchive.length} notes. Enter the vault passkey to decrypt and browse your notes offline.</p>
      
      <div class="input-wrapper">
        <input type="password" id="pwdInput" placeholder="Enter vault passkey..." autocomplete="current-password" autofocus />
        <button type="button" class="eye-btn" id="toggleEye" onclick="toggleVisibility()">SHOW</button>
      </div>

      <button type="button" class="btn btn-primary" id="decryptBtn" onclick="unlockArchive()">
        <span>Decrypt &amp; Browse Notes</span>
      </button>

      <div class="error-box" id="errorBox"></div>
    </div>

    <div class="glass-card content-view" id="contentCard">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <div class="badge-open">🔓 Vault Decrypted</div>
          <h1 style="margin:0; font-size:18px;">Decrypted Archive (<span id="countSpan"></span> Notes)</h1>
        </div>
        <button class="btn-secondary" onclick="relockArchive()" style="background:rgba(244,63,94,0.15); color:#fb7185; border-color:rgba(244,63,94,0.3);">🔒 Relock Vault</button>
      </div>

      <div style="margin-top:14px;">
        <input type="text" id="searchInput" placeholder="Search decrypted notes..." oninput="filterNotes()" style="padding:10px 14px; font-size:13px;" />
      </div>

      <div class="archive-layout">
        <div class="notes-list" id="notesList"></div>
        <div class="note-viewer">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <h2 id="viewTitle" style="font-size:16px; font-weight:700; color:#fff;"></h2>
              <div id="viewMeta" style="font-size:11px; color:#64748b; margin-top:4px;"></div>
              <div id="viewTags" style="margin-top:6px;"></div>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn-secondary" onclick="copyActiveNote()">📋 Copy</button>
              <button class="btn-secondary" onclick="window.print()">🖨️ Print</button>
            </div>
          </div>
          <div class="note-viewer-body" id="viewBody"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const CIPHER_DATA = ${JSON.stringify({
      ciphertext: encrypted.ciphertext,
      salt: encrypted.salt,
      iv: encrypted.iv,
    })};

    let allNotes = [];
    let activeIdx = 0;

    function toggleVisibility() {
      const inp = document.getElementById('pwdInput');
      const btn = document.getElementById('toggleEye');
      if (inp.type === 'password') {
        inp.type = 'text';
        btn.textContent = 'HIDE';
      } else {
        inp.type = 'password';
        btn.textContent = 'SHOW';
      }
    }

    document.getElementById('pwdInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') unlockArchive();
    });

    async function deriveKey(passkey, salt) {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passkey), { name: 'PBKDF2' }, false, ['deriveKey']);
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
    }

    async function unlockArchive() {
      const pwd = document.getElementById('pwdInput').value;
      const err = document.getElementById('errorBox');
      const btn = document.getElementById('decryptBtn');
      err.style.display = 'none';

      if (!pwd) {
        err.textContent = 'Please enter the passkey.';
        err.style.display = 'block';
        return;
      }

      btn.textContent = 'Decrypting Vault...';
      btn.disabled = true;

      try {
        const salt = new Uint8Array(CIPHER_DATA.salt.match(/.{1,2}/g).map(function(b) { return parseInt(b, 16); }));
        const iv = new Uint8Array(CIPHER_DATA.iv.match(/.{1,2}/g).map(function(b) { return parseInt(b, 16); }));
        const key = await deriveKey(pwd, salt);
        
        const bin = atob(CIPHER_DATA.ciphertext);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, bytes);
        const text = new TextDecoder().decode(decrypted);
        const data = JSON.parse(text);

        allNotes = data.notes || [];
        document.getElementById('countSpan').textContent = allNotes.length;
        document.getElementById('lockCard').style.display = 'none';
        document.getElementById('contentCard').style.display = 'block';

        renderNotesList(allNotes);
        if (allNotes.length > 0) selectNote(0);
      } catch (e) {
        err.textContent = 'Incorrect password! Failed to decrypt archive.';
        err.style.display = 'block';
      } finally {
        btn.textContent = 'Decrypt & Browse Notes';
        btn.disabled = false;
      }
    }

    function renderNotesList(notesToRender) {
      const container = document.getElementById('notesList');
      container.innerHTML = '';
      notesToRender.forEach(function(n, idx) {
        const div = document.createElement('div');
        div.className = 'note-item' + (idx === activeIdx ? ' active' : '');
        div.onclick = function() { selectNote(idx); };
        div.innerHTML = '<div class="note-item-title">' + (n.title || 'Untitled Note') + '</div><div class="note-item-date">' + new Date(n.updatedAt).toLocaleDateString() + '</div>';
        container.appendChild(div);
      });
    }

    function selectNote(idx) {
      activeIdx = idx;
      const n = allNotes[idx];
      if (!n) return;
      document.getElementById('viewTitle').textContent = n.title || 'Untitled Note';
      document.getElementById('viewMeta').textContent = 'Last modified: ' + new Date(n.updatedAt).toLocaleString();
      const tagsBox = document.getElementById('viewTags');
      tagsBox.innerHTML = '';
      if (n.tags) {
        n.tags.forEach(function(t) {
          const s = document.createElement('span');
          s.className = 'tag-chip';
          s.textContent = '#' + t;
          tagsBox.appendChild(s);
        });
      }
      document.getElementById('viewBody').textContent = n.content || '(Empty)';
      renderNotesList(allNotes);
    }

    function filterNotes() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const filtered = allNotes.filter(function(n) {
        return (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
      });
      renderNotesList(filtered);
    }

    function copyActiveNote() {
      const n = allNotes[activeIdx];
      if (!n) return;
      navigator.clipboard.writeText((n.title || '') + '\\n\\n' + (n.content || '')).then(function() {
        alert('Note copied to clipboard!');
      });
    }

    function relockArchive() {
      document.getElementById('pwdInput').value = '';
      document.getElementById('lockCard').style.display = 'block';
      document.getElementById('contentCard').style.display = 'none';
      allNotes = [];
    }
  </script>
</body>
</html>`;
}

// ==========================================
// Main Application Component
// ==========================================

export default function App() {
  // Persistence state - initialize strictly empty if no previous user notes exist
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      localStorage.removeItem('xernotes_data_v1');
      const saved = localStorage.getItem('xernotes_data_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback to empty
    }
    return [];
  });

  // Settings
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('xernotes_theme') as ThemeId) || 'azure_white';
  });

  const [isLiquidGlass, setIsLiquidGlass] = useState<boolean>(() => {
    return localStorage.getItem('xernotes_glass') !== 'false';
  });

  // Active view: null means list view, string note ID means editor view
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Editor states (in-memory for active note)
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [editorIsPinned, setEditorIsPinned] = useState(false);
  const [editorIsLocked, setEditorIsLocked] = useState(false);
  const [editorPasskey, setEditorPasskey] = useState<string>(''); // in-memory session key for current note
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'locked'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // UI Modals & Drawers
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadTargetNote, setDownloadTargetNote] = useState<Note | null>(null);
  const [editorFontSize, setEditorFontSize] = useState<'sm' | 'base' | 'lg'>(() => {
    return (localStorage.getItem('xernotes_font_size') as 'sm' | 'base' | 'lg') || 'base';
  });
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockTargetNote, setUnlockTargetNote] = useState<Note | null>(null);
  const [unlockAction, setUnlockAction] = useState<'open' | 'download' | 'removeLock' | 'delete'>('open');
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<'txt' | 'md'>('txt');
  const [unlockPasswordInput, setUnlockPasswordInput] = useState('');
  const [showUnlockPasskeyChars, setShowUnlockPasskeyChars] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isProcessingCrypto, setIsProcessingCrypto] = useState(false);
  
  // Dedicated Liquid Glass Popup Notification System (Popups Only)
  const [popup, setPopup] = useState<PopupNotification | null>(null);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showCopied, setShowCopied] = useState(false);

  // In-App Confirm Modal State (Replaces native window.confirm for iframe stability)
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Lock configuration modal state
  const [newLockPasskey, setNewLockPasskey] = useState('');
  const [confirmLockPasskey, setConfirmLockPasskey] = useState('');
  const [lockError, setLockError] = useState('');
  const [showPasskeyChars, setShowPasskeyChars] = useState(false);

  // Clear All Protection PIN Lock State (Prevents unauthorized or accidental wipes)
  const [clearAllLockHash, setClearAllLockHash] = useState<string>(() => {
    return localStorage.getItem('xernotes_clear_all_lock_hash') || '';
  });

  // Clear All Modal Flow State (In-place manager, keeps user in context)
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearAllStep, setClearAllStep] = useState<'auth' | 'options' | 'protected_passkey'>('options');
  const [clearAllPinInput, setClearAllPinInput] = useState('');
  const [showClearAllPinChars, setShowClearAllPinChars] = useState(false);
  const [clearAllAuthError, setClearAllAuthError] = useState('');
  const [protectedDeletePasskey, setProtectedDeletePasskey] = useState('');
  const [showProtectedDeletePasskeyChars, setShowProtectedDeletePasskeyChars] = useState(false);
  const [protectedDeleteError, setProtectedDeleteError] = useState('');

  // Clear All Lock PIN Setup / Change Modal State
  const [showClearAllLockConfigModal, setShowClearAllLockConfigModal] = useState(false);
  const [clearAllLockConfigInput, setClearAllLockConfigInput] = useState('');
  const [clearAllLockConfigConfirm, setClearAllLockConfigConfirm] = useState('');
  const [clearAllLockCurrentVerify, setClearAllLockCurrentVerify] = useState('');
  const [clearAllLockConfigError, setClearAllLockConfigError] = useState('');
  const [showClearAllConfigChars, setShowClearAllConfigChars] = useState(false);
  const [isRemovingClearAllLock, setIsRemovingClearAllLock] = useState(false);

  // Encrypted Download Modal State (Download with password lock)
  const [showEncryptedDownloadModal, setShowEncryptedDownloadModal] = useState(false);
  const [encryptedDownloadType, setEncryptedDownloadType] = useState<'single' | 'all'>('single');
  const [encryptedDownloadPassword, setEncryptedDownloadPassword] = useState('');
  const [confirmEncryptedDownloadPassword, setConfirmEncryptedDownloadPassword] = useState('');
  const [showEncryptedDownloadPassChars, setShowEncryptedDownloadPassChars] = useState(false);
  const [encryptedDownloadError, setEncryptedDownloadError] = useState('');
  const [isGeneratingEncryptedFile, setIsGeneratingEncryptedFile] = useState(false);

  // Save clear all PIN lock preference
  useEffect(() => {
    if (clearAllLockHash) {
      localStorage.setItem('xernotes_clear_all_lock_hash', clearAllLockHash);
    } else {
      localStorage.removeItem('xernotes_clear_all_lock_hash');
    }
  }, [clearAllLockHash]);

  // Import file input ref
  const importInputRef = useRef<HTMLInputElement>(null);

  // Textarea auto-expanding ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Current active theme configuration
  const theme = THEMES[activeTheme] || THEMES.azure_white;

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('xernotes_data_v2', JSON.stringify(notes));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }, [notes]);

  // Save theme & glass preference
  useEffect(() => {
    localStorage.setItem('xernotes_theme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    localStorage.setItem('xernotes_glass', String(isLiquidGlass));
  }, [isLiquidGlass]);

  useEffect(() => {
    localStorage.setItem('xernotes_font_size', editorFontSize);
  }, [editorFontSize]);

  // Clean up popup timer on unmount
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, []);

  // Dedicated Popup Message Trigger
  const triggerPopup = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    title?: string
  ) => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
    const newPopup: PopupNotification = {
      id: 'pop_' + Date.now(),
      type,
      title,
      message,
    };
    setPopup(newPopup);
    popupTimerRef.current = setTimeout(() => {
      setPopup(null);
    }, 3200);
  };

  // Helper alias for standard calls
  const triggerToast = (msg: string) => {
    triggerPopup(msg, 'success');
  };

  // Auto-resize textarea seamlessly for massive notes with layout-thrash prevention
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 400)}px`;
      });
    }
  };

  useEffect(() => {
    if (activeNoteId) {
      adjustTextareaHeight();
    }
  }, [editorContent, activeNoteId]);

  // Open note
  const handleOpenNote = (note: Note) => {
    if (note.isLocked) {
      setUnlockTargetNote(note);
      setUnlockAction('open');
      setUnlockPasswordInput('');
      setUnlockError('');
      setShowUnlockPasskeyChars(false);
      setShowUnlockModal(true);
      return;
    }

    setActiveNoteId(note.id);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorTags(note.tags || []);
    setEditorIsPinned(note.isPinned);
    setEditorIsLocked(false);
    setEditorPasskey('');
  };

  // Create note
  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: '',
      content: '',
      isPinned: false,
      isLocked: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setEditorTitle('');
    setEditorContent('');
    setEditorTags([]);
    setEditorIsPinned(false);
    setEditorIsLocked(false);
    setEditorPasskey('');
    triggerToast('New note created');
  };

  // Duplicate note
  const handleDuplicateNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.isLocked) {
      triggerToast('Locked notes must be unlocked before duplicating');
      return;
    }

    const duplicated: Note = {
      ...note,
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: note.title ? `${note.title} (Copy)` : 'Untitled Note (Copy)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes((prev) => [duplicated, ...prev]);
    triggerToast('Note duplicated');
  };

  // Unlock note - handles Open, Download, and Remove Lock
  const handlePerformUnlock = async () => {
    if (!unlockTargetNote) return;
    if (!unlockPasswordInput.trim()) {
      setUnlockError('Please enter the passkey or password');
      return;
    }

    setIsProcessingCrypto(true);
    setUnlockError('');

    try {
      const passHash = await hashPasskey(unlockPasswordInput);
      if (unlockTargetNote.passwordHash && unlockTargetNote.passwordHash !== passHash) {
        setUnlockError('Incorrect passkey. Please check and try again.');
        setIsProcessingCrypto(false);
        return;
      }

      let decryptedBody = '';
      if (unlockTargetNote.salt && unlockTargetNote.iv) {
        decryptedBody = await decryptText(
          unlockTargetNote.content,
          unlockPasswordInput,
          unlockTargetNote.salt,
          unlockTargetNote.iv
        );
      } else {
        decryptedBody = unlockTargetNote.content;
      }

      if (unlockAction === 'download') {
        const cleanTitle = (unlockTargetNote.title || 'untitled_note').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const dateStr = new Date(unlockTargetNote.updatedAt).toLocaleString();
        const tagsStr = unlockTargetNote.tags?.length ? `Tags: ${unlockTargetNote.tags.map((t) => '#' + t).join(' ')}\n` : '';

        if (pendingDownloadFormat === 'md') {
          const mdContent = `# ${unlockTargetNote.title || 'Untitled Note'}\n\n> Date: ${dateStr}\n${tagsStr ? `> ${tagsStr}\n` : ''}\n${decryptedBody}`;
          downloadFile(mdContent, `${cleanTitle}.md`, 'text/markdown');
        } else {
          const fileContent = `${unlockTargetNote.title || 'Untitled Note'}\n${'='.repeat(40)}\nDate: ${dateStr}\n${tagsStr}\n${decryptedBody}`;
          downloadFile(fileContent, `${cleanTitle}.txt`, 'text/plain');
        }

        setShowUnlockModal(false);
        setUnlockTargetNote(null);
        setUnlockPasswordInput('');
        setShowUnlockPasskeyChars(false);
        triggerToast(`Decrypted and downloaded "${unlockTargetNote.title || 'Note'}"`);
      } else if (unlockAction === 'removeLock') {
        // Permanently remove lock from note
        setNotes((prev) =>
          prev.map((n) => {
            if (n.id === unlockTargetNote.id) {
              return {
                ...n,
                content: decryptedBody,
                isLocked: false,
                passwordHash: undefined,
                salt: undefined,
                iv: undefined,
                updatedAt: Date.now(),
              };
            }
            return n;
          })
        );

        setShowUnlockModal(false);
        setUnlockTargetNote(null);
        setUnlockPasswordInput('');
        setShowUnlockPasskeyChars(false);
        triggerToast(`Lock removed from "${unlockTargetNote.title || 'Note'}"`);
      } else if (unlockAction === 'delete') {
        // Permanently delete protected note after verifying passkey
        setNotes((prev) => prev.filter((n) => n.id !== unlockTargetNote.id));
        if (activeNoteId === unlockTargetNote.id) {
          setActiveNoteId(null);
        }
        setShowUnlockModal(false);
        setUnlockTargetNote(null);
        setUnlockPasswordInput('');
        setShowUnlockPasskeyChars(false);
        triggerToast(`Protected note "${unlockTargetNote.title || 'Note'}" deleted`);
      } else {
        // Default: Open in editor
        setActiveNoteId(unlockTargetNote.id);
        setEditorTitle(unlockTargetNote.title);
        setEditorContent(decryptedBody);
        setEditorTags(unlockTargetNote.tags || []);
        setEditorIsPinned(unlockTargetNote.isPinned);
        setEditorIsLocked(true);
        setEditorPasskey(unlockPasswordInput);

        setShowUnlockModal(false);
        setUnlockTargetNote(null);
        setUnlockPasswordInput('');
        setShowUnlockPasskeyChars(false);
        triggerToast('Note decrypted and opened');
      }
    } catch (err) {
      console.error(err);
      setUnlockError('Decryption failed. Incorrect passkey or corrupted note.');
    } finally {
      setIsProcessingCrypto(false);
    }
  };

  // Auto-save logic with debounce
  const triggerAutoSave = (
    updatedTitle: string,
    updatedContent: string,
    updatedTags: string[],
    updatedPinned: boolean,
    updatedLocked: boolean,
    activeKey: string
  ) => {
    if (!activeNoteId) return;
    setSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      let finalContent = updatedContent;
      let passHash: string | undefined = undefined;
      let salt: string | undefined = undefined;
      let iv: string | undefined = undefined;

      if (updatedLocked && activeKey) {
        try {
          passHash = await hashPasskey(activeKey);
          const encryptedResult = await encryptText(updatedContent, activeKey);
          finalContent = encryptedResult.ciphertext;
          salt = encryptedResult.salt;
          iv = encryptedResult.iv;
        } catch (e) {
          console.error('Encryption error during autosave', e);
        }
      }

      setNotes((prevNotes) =>
        prevNotes.map((n) => {
          if (n.id === activeNoteId) {
            return {
              ...n,
              title: updatedTitle || 'Untitled Note',
              content: finalContent,
              tags: updatedTags,
              isPinned: updatedPinned,
              isLocked: updatedLocked,
              passwordHash: updatedLocked ? passHash || n.passwordHash : undefined,
              salt: updatedLocked ? salt || n.salt : undefined,
              iv: updatedLocked ? iv || n.iv : undefined,
              updatedAt: Date.now(),
            };
          }
          return n;
        })
      );

      setSaveStatus('saved');
    }, 400);
  };

  // Handlers for title & content
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditorTitle(val);
    triggerAutoSave(val, editorContent, editorTags, editorIsPinned, editorIsLocked, editorPasskey);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditorContent(val);
    triggerAutoSave(editorTitle, val, editorTags, editorIsPinned, editorIsLocked, editorPasskey);
    adjustTextareaHeight();
  };

  const handleTogglePin = () => {
    const newPinned = !editorIsPinned;
    setEditorIsPinned(newPinned);
    triggerAutoSave(editorTitle, editorContent, editorTags, newPinned, editorIsLocked, editorPasskey);
    triggerToast(newPinned ? 'Note pinned' : 'Note unpinned');
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (!editorTags.includes(cleanTag)) {
      const updated = [...editorTags, cleanTag];
      setEditorTags(updated);
      triggerAutoSave(editorTitle, editorContent, updated, editorIsPinned, editorIsLocked, editorPasskey);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = editorTags.filter((t) => t !== tagToRemove);
    setEditorTags(updated);
    triggerAutoSave(editorTitle, editorContent, updated, editorIsPinned, editorIsLocked, editorPasskey);
  };

  // Lock note
  const handleApplyLock = async () => {
    if (!newLockPasskey.trim()) {
      setLockError('Passkey cannot be empty');
      return;
    }
    if (newLockPasskey !== confirmLockPasskey) {
      setLockError('Passkeys do not match');
      return;
    }

    setIsProcessingCrypto(true);
    try {
      const passkey = newLockPasskey.trim();
      setEditorIsLocked(true);
      setEditorPasskey(passkey);
      setShowLockModal(false);
      setNewLockPasskey('');
      setConfirmLockPasskey('');
      setLockError('');

      triggerAutoSave(editorTitle, editorContent, editorTags, editorIsPinned, true, passkey);
      triggerToast('Note encrypted with passkey');
    } catch (err) {
      console.error(err);
      setLockError('Failed to encrypt note');
    } finally {
      setIsProcessingCrypto(false);
    }
  };

  const handleRemoveLock = () => {
    setConfirmModal({
      title: 'Remove Passkey Lock?',
      message: 'This note will no longer require a passkey and will be saved in plain text.',
      confirmLabel: 'Remove Lock',
      isDanger: false,
      onConfirm: () => {
        setEditorIsLocked(false);
        setEditorPasskey('');
        triggerAutoSave(editorTitle, editorContent, editorTags, editorIsPinned, false, '');
        triggerToast('Passkey protection removed');
        setConfirmModal(null);
      },
    });
  };

  // Delete note (requires passkey verification if the note is protected/locked)
  const handleDeleteNote = (noteId: string) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;

    // Security requirement: If note is protected/locked, require passkey before deletion
    if (target.isLocked) {
      setUnlockTargetNote(target);
      setUnlockAction('delete');
      setUnlockPasswordInput('');
      setUnlockError('');
      setShowUnlockPasskeyChars(false);
      setShowUnlockModal(true);
      return;
    }

    // Unprotected note: confirm normal deletion
    setConfirmModal({
      title: 'Delete Note?',
      message: `Are you sure you want to permanently delete "${target.title || 'Untitled Note'}"? This action cannot be undone.`,
      confirmLabel: 'Delete Note',
      isDanger: true,
      onConfirm: () => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        if (activeNoteId === noteId) {
          setActiveNoteId(null);
        }
        triggerToast('Note deleted');
        setConfirmModal(null);
      },
    });
  };

  // Back to list
  const handleBackToList = () => {
    setEditorPasskey('');
    setActiveNoteId(null);
  };

  // Safe file downloader
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download note directly from card (prompts passkey if locked)
  const handleDownloadCardNote = (note: Note, e: React.MouseEvent, format: 'txt' | 'md' = 'txt') => {
    e.stopPropagation();
    if (note.isLocked) {
      setUnlockTargetNote(note);
      setUnlockAction('download');
      setPendingDownloadFormat(format);
      setUnlockPasswordInput('');
      setUnlockError('');
      setShowUnlockPasskeyChars(false);
      setShowUnlockModal(true);
      return;
    }
    const cleanTitle = (note.title || 'untitled_note').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dateStr = new Date(note.updatedAt).toLocaleString();
    const tagsStr = note.tags?.length ? `Tags: ${note.tags.map((t) => '#' + t).join(' ')}\n` : '';

    if (format === 'md') {
      const mdContent = `# ${note.title || 'Untitled Note'}\n\n> Date: ${dateStr}\n${tagsStr ? `> ${tagsStr}\n` : ''}\n${note.content}`;
      downloadFile(mdContent, `${cleanTitle}.md`, 'text/markdown');
      triggerToast(`Downloaded "${note.title || 'Note'}" as .md`);
    } else {
      const fileContent = `${note.title || 'Untitled Note'}\n${'='.repeat(40)}\nDate: ${dateStr}\n${tagsStr}\n${note.content}`;
      downloadFile(fileContent, `${cleanTitle}.txt`, 'text/plain');
      triggerToast(`Downloaded "${note.title || 'Note'}" as .txt`);
    }
  };

  // Trigger Remove Lock directly from card
  const handleTriggerRemoveLockFromCard = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnlockTargetNote(note);
    setUnlockAction('removeLock');
    setUnlockPasswordInput('');
    setUnlockError('');
    setShowUnlockPasskeyChars(false);
    setShowUnlockModal(true);
  };

  // Download currently active note
  const handleDownloadCurrentNote = (format: 'txt' | 'md' | 'json' | 'print') => {
    if (format === 'print') {
      window.print();
      setShowDownloadModal(false);
      return;
    }
    const cleanTitle = (editorTitle || 'note').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dateStr = new Date().toLocaleString();

    if (format === 'txt') {
      const text = `${editorTitle || 'Untitled Note'}\n${'='.repeat(40)}\nDate: ${dateStr}\nTags: ${editorTags.map((t) => '#' + t).join(' ')}\n\n${editorContent}`;
      downloadFile(text, `${cleanTitle}.txt`, 'text/plain');
      triggerToast('Downloaded as .txt');
    } else if (format === 'md') {
      const md = `# ${editorTitle || 'Untitled Note'}\n\n> Date: ${dateStr}  \n> Tags: ${editorTags.map((t) => '#' + t).join(' ')}\n\n${editorContent}`;
      downloadFile(md, `${cleanTitle}.md`, 'text/markdown');
      triggerToast('Downloaded as .md');
    } else if (format === 'json') {
      const data = JSON.stringify(
        {
          title: editorTitle,
          content: editorContent,
          tags: editorTags,
          isPinned: editorIsPinned,
          isLocked: editorIsLocked,
          updatedAt: Date.now(),
        },
        null,
        2
      );
      downloadFile(data, `${cleanTitle}.json`, 'application/json');
      triggerToast('Downloaded as .json');
    }
    setShowDownloadModal(false);
  };

  // Download all notes combined as .txt
  const handleDownloadAllNotesText = () => {
    if (notes.length === 0) {
      triggerToast('No notes to download');
      return;
    }
    let combined = `============================================================\n`;
    combined += `XERNOTES ARCHIVE - ${new Date().toLocaleDateString()}\n`;
    combined += `Total Notes: ${notes.length}\n`;
    combined += `============================================================\n\n`;

    notes.forEach((n, idx) => {
      const dateStr = new Date(n.updatedAt).toLocaleString();
      const tagsStr = n.tags?.length ? `Tags: ${n.tags.map((t) => '#' + t).join(', ')}\n` : '';
      const body = n.isLocked ? '[Encrypted note content - protected with AES-256 passkey]' : n.content;

      combined += `------------------------------------------------------------\n`;
      combined += `Note #${idx + 1}: ${n.title || 'Untitled Note'}\n`;
      combined += `Updated: ${dateStr}\n`;
      if (tagsStr) combined += tagsStr;
      combined += `------------------------------------------------------------\n`;
      combined += `${body}\n\n`;
    });

    downloadFile(combined, `xernotes_all_${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain');
    triggerToast(`Downloaded ${notes.length} notes as .txt`);
    setShowDownloadModal(false);
  };

  // Download all notes combined as Markdown (.md)
  const handleDownloadAllNotesMarkdown = () => {
    if (notes.length === 0) {
      triggerToast('No notes to download');
      return;
    }
    let combined = `# Xernotes Archive\n\n`;
    combined += `> Exported: ${new Date().toLocaleString()}  \n`;
    combined += `> Total Notes: ${notes.length}\n\n---\n\n`;

    notes.forEach((n) => {
      const dateStr = new Date(n.updatedAt).toLocaleString();
      const tagsStr = n.tags?.length ? n.tags.map((t) => `\`#${t}\``).join(' ') : '';
      const body = n.isLocked ? `*This note is encrypted with AES-256-GCM.*` : n.content;

      combined += `## ${n.title || 'Untitled Note'}\n\n`;
      combined += `*Updated: ${dateStr}* ${tagsStr ? `| ${tagsStr}` : ''}\n\n`;
      combined += `${body}\n\n---\n\n`;
    });

    downloadFile(combined, `xernotes_all_${new Date().toISOString().slice(0, 10)}.md`, 'text/markdown');
    triggerToast(`Downloaded ${notes.length} notes as .md`);
    setShowDownloadModal(false);
  };

  // ==========================================
  // In-Place Clear All Flow Handlers
  // (Preserves context, respects protected notes, supports PIN lock)
  // ==========================================

  const handleTriggerClearAll = () => {
    if (notes.length === 0) {
      triggerToast('No notes to clear');
      return;
    }
    setClearAllAuthError('');
    setProtectedDeleteError('');
    setClearAllPinInput('');
    setProtectedDeletePasskey('');
    setShowClearAllPinChars(false);
    setShowProtectedDeletePasskeyChars(false);

    if (clearAllLockHash) {
      setClearAllStep('auth');
    } else {
      setClearAllStep('options');
    }
    setShowClearAllModal(true);
  };

  const handleVerifyClearAllPin = async () => {
    if (!clearAllPinInput) {
      setClearAllAuthError('Please enter your Clear All PIN / passkey');
      return;
    }
    try {
      const hashed = await hashPasskey(clearAllPinInput);
      if (hashed !== clearAllLockHash) {
        setClearAllAuthError('Incorrect PIN / passkey! Access denied.');
        return;
      }
      setClearAllAuthError('');
      setClearAllStep('options');
    } catch (err) {
      console.error(err);
      setClearAllAuthError('Verification error');
    }
  };

  const handleClearUnprotectedNotesOnly = () => {
    const protectedNotes = notes.filter((n) => n.isLocked);
    const unprotectedCount = notes.length - protectedNotes.length;

    // Reset active note only if it was an unprotected note
    if (activeNoteId) {
      const activeNote = notes.find((n) => n.id === activeNoteId);
      if (activeNote && !activeNote.isLocked) {
        setActiveNoteId(null);
      }
    }

    setNotes(protectedNotes);
    setShowClearAllModal(false);
    triggerToast(
      `Cleared ${unprotectedCount} unprotected ${unprotectedCount === 1 ? 'note' : 'notes'}. ${protectedNotes.length} protected ${protectedNotes.length === 1 ? 'note' : 'notes'} kept safe.`
    );
  };

  const handleConfirmDeleteAllWithProtectedPasskey = async () => {
    if (!protectedDeletePasskey) {
      setProtectedDeleteError('Please enter the passkey for protected notes.');
      return;
    }
    setIsProcessingCrypto(true);
    try {
      const enteredHash = await hashPasskey(protectedDeletePasskey);
      const protectedNotes = notes.filter((n) => n.isLocked);
      const matchesAny = protectedNotes.some((n) => n.passwordHash === enteredHash);

      if (!matchesAny) {
        setProtectedDeleteError('Incorrect passkey! Protected notes cannot be erased with this password.');
        setIsProcessingCrypto(false);
        return;
      }

      const remainingNotes = protectedNotes.filter((n) => n.passwordHash !== enteredHash);
      if (remainingNotes.length === 0) {
        setNotes([]);
        if (activeNoteId) setActiveNoteId(null);
        triggerToast('All notes (including protected notes) have been permanently cleared.');
      } else {
        setNotes(remainingNotes);
        triggerToast(`Authorized notes erased. ${remainingNotes.length} locked notes with different passkeys retained.`);
      }
      setShowClearAllModal(false);
    } catch (err) {
      console.error(err);
      setProtectedDeleteError('Failed to verify passkey.');
    } finally {
      setIsProcessingCrypto(false);
    }
  };

  const handleClearAllUnconditional = () => {
    const count = notes.length;
    setNotes([]);
    if (activeNoteId) setActiveNoteId(null);
    setShowClearAllModal(false);
    triggerToast(`All ${count} notes permanently erased.`);
  };

  // Clear All PIN Lock Configuration Handler
  const handleConfigureClearAllLock = async () => {
    setClearAllLockConfigError('');

    if (isRemovingClearAllLock) {
      if (!clearAllLockCurrentVerify) {
        setClearAllLockConfigError('Please enter your current PIN to remove lock.');
        return;
      }
      const verifyHash = await hashPasskey(clearAllLockCurrentVerify);
      if (verifyHash !== clearAllLockHash) {
        setClearAllLockConfigError('Incorrect current PIN! Cannot remove lock.');
        return;
      }
      setClearAllLockHash('');
      setShowClearAllLockConfigModal(false);
      triggerToast('Clear All PIN lock removed.');
      return;
    }

    // Setting or changing PIN
    if (clearAllLockHash) {
      if (!clearAllLockCurrentVerify) {
        setClearAllLockConfigError('Please enter your current PIN to change it.');
        return;
      }
      const verifyHash = await hashPasskey(clearAllLockCurrentVerify);
      if (verifyHash !== clearAllLockHash) {
        setClearAllLockConfigError('Incorrect current PIN! Cannot change lock.');
        return;
      }
    }

    if (!clearAllLockConfigInput || clearAllLockConfigInput.length < 3) {
      setClearAllLockConfigError('PIN must be at least 3 characters long.');
      return;
    }

    if (clearAllLockConfigInput !== clearAllLockConfigConfirm) {
      setClearAllLockConfigError('New PINs do not match.');
      return;
    }

    const hashed = await hashPasskey(clearAllLockConfigInput);
    setClearAllLockHash(hashed);
    setShowClearAllLockConfigModal(false);
    triggerToast('Clear All button is now protected with your PIN!');
  };

  // Encrypted Download Generator Handler
  const handleExecuteEncryptedDownload = async () => {
    setEncryptedDownloadError('');
    if (!encryptedDownloadPassword) {
      setEncryptedDownloadError('Please enter a password to lock this download.');
      return;
    }

    if (encryptedDownloadPassword !== confirmEncryptedDownloadPassword) {
      setEncryptedDownloadError('Passwords do not match.');
      return;
    }

    setIsGeneratingEncryptedFile(true);
    try {
      if (encryptedDownloadType === 'single') {
        const target = downloadTargetNote || (activeNoteId ? notes.find((n) => n.id === activeNoteId) : null);
        const title = target ? target.title : editorTitle;
        const content = target ? target.content : editorContent;
        const tags = target ? target.tags : editorTags;
        const updatedAt = target ? target.updatedAt : Date.now();

        const html = await generateEncryptedHtmlNote(title, content, tags, updatedAt, encryptedDownloadPassword);
        const cleanTitle = (title || 'protected_note').toLowerCase().replace(/[^a-z0-9]/g, '_');
        downloadFile(html, `${cleanTitle}.locked.html`, 'text/html');
        triggerToast(`Downloaded "${title || 'Note'}" as password-protected .html`);
      } else {
        const html = await generateEncryptedHtmlArchive(notes, encryptedDownloadPassword);
        downloadFile(html, `xernotes_vault_${new Date().toISOString().slice(0, 10)}.locked.html`, 'text/html');
        triggerToast(`Downloaded ${notes.length} notes as encrypted vault archive (.html)`);
      }

      setShowEncryptedDownloadModal(false);
      setShowDownloadModal(false);
      setDownloadTargetNote(null);
    } catch (err) {
      console.error(err);
      setEncryptedDownloadError('Failed to generate encrypted file.');
    } finally {
      setIsGeneratingEncryptedFile(false);
    }
  };

  // Clear all notes legacy redirect alias
  const handleClearAllNotes = () => {
    handleTriggerClearAll();
  };

  // Export handlers
  const handleExportText = () => {
    handleDownloadCurrentNote('txt');
  };

  const handleExportMarkdown = () => {
    handleDownloadCurrentNote('md');
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${editorTitle}\n\n${editorContent}`);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      triggerToast('Copied to clipboard');
    } catch {
      triggerToast('Failed to copy');
    }
  };

  // Backup all notes JSON
  const handleBackupAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `xernotes_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    triggerToast('Backup saved (.json)');
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
          triggerToast(`Restored ${parsed.length} notes`);
        } else {
          triggerToast('Invalid backup file format');
        }
      } catch {
        triggerToast('Error reading backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Live Metrics
  const metrics = useMemo(() => {
    const text = editorContent.trim();
    const chars = editorContent.length;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const lines = editorContent ? editorContent.split('\n').length : 0;
    return { chars, words, readingTime, lines };
  }, [editorContent]);

  // Unique tags
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (selectedTag && (!n.tags || !n.tags.includes(selectedTag))) {
          return false;
        }
        if (filterType === 'pinned' && !n.isPinned) return false;
        if (filterType === 'locked' && !n.isLocked) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const titleMatch = n.title?.toLowerCase().includes(q);
        const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(q));
        const contentMatch = !n.isLocked && n.content?.toLowerCase().includes(q);

        return titleMatch || tagMatch || contentMatch;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, searchQuery, filterType, selectedTag]);

  // Optimized styling helpers with GPU compositing
  const glassCardClass = isLiquidGlass
    ? `${theme.surfaceBgGlass} liquid-glass-border shadow-lg backdrop-blur-md transition-all duration-200 transform-gpu`
    : `${theme.surfaceBg} border ${theme.borderSubtle} shadow-sm transition-all duration-200`;

  const glassHeaderClass = isLiquidGlass
    ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10'
    : 'bg-slate-950 border-b border-slate-800';

  return (
    <div
      id="xernotes-app-root"
      className={`min-h-screen bg-gradient-to-b ${theme.canvasBg} text-slate-100 flex flex-col font-sans transition-colors duration-300 overflow-x-hidden`}
    >
      {/* Background Liquid Glass Ambient Illumination & Shimmer Effect */}
      {isLiquidGlass && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-500"
          style={{
            backgroundImage:
              activeTheme === 'azure_white'
                ? `radial-gradient(circle at 12% 14%, rgba(56, 189, 248, 0.28) 0%, transparent 45%),
                   radial-gradient(circle at 88% 22%, rgba(255, 255, 255, 0.16) 0%, transparent 40%),
                   radial-gradient(circle at 50% 88%, rgba(37, 99, 235, 0.22) 0%, transparent 55%)`
                : `radial-gradient(circle at 10% 12%, ${theme.dotColor}33 0%, transparent 45%),
                   radial-gradient(circle at 90% 40%, ${theme.dotColor}22 0%, transparent 40%)`,
          }}
        >
          {activeTheme === 'azure_white' && (
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[300px] bg-gradient-to-b from-sky-300/10 via-white/5 to-transparent blur-3xl opacity-75 rounded-full pointer-events-none" />
          )}
        </div>
      )}

      {/* Hidden file input for JSON import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
      />

      {/* ============================================================ */}
      {/* Mobile-Optimized Top App Bar with Best Button Sizing */}
      {/* ============================================================ */}
      <header
        id="app-header"
        className={`sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between pt-safe ${glassHeaderClass} transition-all duration-300`}
      >
        {activeNoteId ? (
          // Header inside Editor View
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-back-to-list"
                onClick={handleBackToList}
                className="min-w-[44px] min-h-[44px] -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all"
                title="Back to notes list"
                aria-label="Back to notes list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center">
                <span className="text-xs font-mono tracking-tight flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                  {saveStatus === 'saving' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span className="text-amber-400 font-medium">Syncing</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300 font-medium">Saved</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Editor Action Bar (Mobile Touch Targets) */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Pin Toggle */}
              <button
                id="btn-toggle-pin"
                onClick={handleTogglePin}
                className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  editorIsPinned
                    ? 'text-amber-400 bg-amber-400/20 border border-amber-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
                title={editorIsPinned ? 'Unpin note' : 'Pin note to top'}
                aria-label={editorIsPinned ? 'Unpin note' : 'Pin note to top'}
              >
                {editorIsPinned ? <Pin className="w-4 h-4 fill-amber-400" /> : <PinOff className="w-4 h-4" />}
              </button>

              {/* Lock / Passkey Toggle */}
              {editorIsLocked ? (
                <button
                  id="btn-active-locked"
                  onClick={handleRemoveLock}
                  className="min-h-[44px] px-3 rounded-xl text-emerald-400 bg-emerald-500/15 hover:bg-rose-500/20 hover:text-rose-300 border border-emerald-500/30 hover:border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold group shadow-sm active:scale-95"
                  title="Protected with passkey. Click to remove protection."
                  aria-label="Remove note passkey lock"
                >
                  <Lock className="w-4 h-4 group-hover:hidden text-emerald-400" />
                  <Unlock className="w-4 h-4 hidden group-hover:inline text-rose-400" />
                  <span className="group-hover:hidden">Locked</span>
                  <span className="hidden group-hover:inline">Unlock</span>
                </button>
              ) : (
                <button
                  id="btn-set-lock"
                  onClick={() => {
                    setNewLockPasskey('');
                    setConfirmLockPasskey('');
                    setLockError('');
                    setShowLockModal(true);
                  }}
                  className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all"
                  title="Protect note with passkey"
                  aria-label="Protect note"
                >
                  <Key className="w-4 h-4" />
                </button>
              )}

              {/* Copy */}
              <button
                id="btn-copy-note"
                onClick={handleCopyToClipboard}
                className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all"
                title="Copy note content"
                aria-label="Copy note content"
              >
                {showCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Download Note */}
              <button
                id="btn-editor-download-note"
                onClick={() => setShowDownloadModal(true)}
                className="min-h-[44px] px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm active:scale-95"
                title="Download note (.txt, .md, PDF)"
                aria-label="Download note"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Delete Note */}
              <button
                id="btn-delete-active-note"
                onClick={() => handleDeleteNote(activeNoteId)}
                className="min-w-[44px] min-h-[44px] rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 active:scale-90 flex items-center justify-center transition-all"
                title={editorIsLocked ? 'Delete protected note (requires passkey)' : 'Delete note'}
                aria-label="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Three Lines Menu (Hamburger Menu) Button */}
              <button
                id="btn-editor-three-lines-menu"
                onClick={() => setShowMenuDrawer(true)}
                className={`min-w-[42px] min-h-[42px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl border transition-all flex items-center justify-center active:scale-90 ${
                  showMenuDrawer
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border-white/10'
                }`}
                title="Menu & Settings (3 lines)"
                aria-label="Open menu and settings"
              >
                <Menu className="w-5 h-5 text-slate-100" />
              </button>
            </div>
          </div>
        ) : (
          // Header inside Notes List View
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm tracking-wide shadow-md ${theme.accent}`}
              >
                X
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-none">
                    Xernotes
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded-md bg-white/10 text-sky-200 border border-white/10 shadow-sm">
                    Pro
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions: Three Lines Menu Button & Tools */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Quick Liquid Glass Effect Toggle */}
              <button
                id="btn-toggle-liquid-glass"
                onClick={() => {
                  const next = !isLiquidGlass;
                  setIsLiquidGlass(next);
                  triggerPopup(
                    next ? 'Liquid Glass reflections enabled' : 'Clean Matte aesthetic enabled',
                    'info',
                    'Visual Style'
                  );
                }}
                className={`min-w-[42px] min-h-[42px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl transition-all flex items-center justify-center active:scale-90 ${
                  isLiquidGlass
                    ? 'text-cyan-300 bg-cyan-400/20 shadow-sm border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
                }`}
                title={isLiquidGlass ? 'Liquid Glass active (tap for Matte)' : 'Clean Matte active (tap for Glass)'}
                aria-label="Toggle Liquid Glass effect"
              >
                <Droplets className="w-4 h-4" />
              </button>

              {/* Notes & Project Download Feature Button */}
              <button
                id="btn-header-download-notes"
                onClick={() => setShowDownloadModal(true)}
                className="min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs sm:text-sm font-semibold shadow-sm active:scale-95"
                title="Download notes (.txt, .md, .json)"
                aria-label="Download notes"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Three Lines Menu (Hamburger Menu) Button */}
              <button
                id="btn-three-lines-menu"
                onClick={() => setShowMenuDrawer(true)}
                className={`min-w-[42px] min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-sm active:scale-95 ${
                  showMenuDrawer
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border-white/10'
                }`}
                title="Menu & Settings (3 lines)"
                aria-label="Open menu and settings"
              >
                <Menu className="w-5 h-5 text-slate-100" />
                <span className="hidden xs:inline text-xs">Menu</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* POPUP MESSAGES ONLY (Liquid Glass Floating Notification Banner) */}
      {/* ============================================================ */}
      {popup && (
        <div
          id="xernotes-popup-banner"
          role="status"
          aria-live="polite"
          className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-popup-slide pointer-events-auto"
        >
          <div
            className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xl transition-all ${
              isLiquidGlass
                ? 'bg-slate-950/85 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.65)]'
                : 'bg-slate-900 border border-slate-700 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  popup.type === 'error'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : popup.type === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : popup.type === 'info'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {popup.type === 'error' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : popup.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : popup.type === 'info' ? (
                  <Shield className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {popup.title && (
                  <div className="text-xs font-bold text-white tracking-tight leading-tight">
                    {popup.title}
                  </div>
                )}
                <div className="text-xs sm:text-sm font-medium text-slate-200 leading-snug break-words">
                  {popup.message}
                </div>
              </div>
            </div>
            <button
              type="button"
              id="btn-close-popup-msg"
              onClick={() => setPopup(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 shrink-0 transition-colors active:scale-90"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MAIN VIEW CONTENT */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col relative z-10 px-3 sm:px-6 py-4">
        {activeNoteId ? (
          // ==========================================
          // 1. UNLIMITED NOTE EDITOR VIEW
          // ==========================================
          <div id="editor-view" className="flex-1 flex flex-col gap-3">
            {/* Note Meta & Tags Bar */}
            <div className={`p-3 rounded-2xl ${glassCardClass} flex flex-col gap-2 transition-all`}>
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Tags */}
                {editorTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono bg-white/10 text-slate-200 border border-white/5"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 text-slate-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Add Tag */}
                <div className="inline-flex items-center gap-1">
                  <input
                    id="input-add-tag"
                    type="text"
                    placeholder="+ add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="w-24 px-2 py-0.5 text-xs bg-transparent border-b border-slate-700 focus:border-indigo-400 focus:outline-none text-slate-300 placeholder:text-slate-500 font-mono"
                  />
                  {tagInput && (
                    <button
                      onClick={handleAddTag}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-1"
                    >
                      Add
                    </button>
                  )}
                </div>

                {editorIsLocked && (
                  <button
                    onClick={handleRemoveLock}
                    className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-300 border border-emerald-500/20 hover:border-rose-500/30 transition-all cursor-pointer"
                    title="Click to remove passkey lock from this note"
                  >
                    <Shield className="w-3 h-3" />
                    <span>AES-256 GCM</span>
                    <span className="text-[10px] text-slate-400 hover:text-rose-300 underline ml-1">Remove Lock</span>
                  </button>
                )}
              </div>
            </div>

            {/* Note Title Input */}
            <div className={`px-4 py-3 rounded-2xl ${glassCardClass}`}>
              <input
                id="input-note-title"
                type="text"
                placeholder="Note Title..."
                value={editorTitle}
                onChange={handleTitleChange}
                className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white placeholder:text-slate-600 focus:outline-none tracking-tight"
              />
            </div>

            {/* Unlimited Auto-Expanding Content Area */}
            <div className={`p-4 rounded-2xl ${glassCardClass} flex-1 flex flex-col relative`}>
              <textarea
                id="textarea-note-content"
                ref={textareaRef}
                placeholder="Start typing your note with unlimited capacity..."
                value={editorContent}
                onChange={handleContentChange}
                rows={14}
                className={`w-full flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none font-normal selection:bg-indigo-500/30 ${
                  editorFontSize === 'sm'
                    ? 'text-sm sm:text-base leading-normal'
                    : editorFontSize === 'lg'
                    ? 'text-lg sm:text-xl leading-relaxed'
                    : 'text-base sm:text-lg leading-relaxed'
                }`}
                style={{ minHeight: '400px' }}
              />

              {/* Bottom Live Metrics */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
                <div className="flex items-center gap-3">
                  <span>
                    <strong className="text-slate-200">{metrics.words}</strong> words
                  </span>
                  <span>
                    <strong className="text-slate-200">{metrics.chars}</strong> chars
                  </span>
                  <span className="hidden sm:inline">
                    <strong className="text-slate-200">{metrics.lines}</strong> lines
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{metrics.readingTime} min read</span>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Quick Action Dock in Editor */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 px-3.5 py-2.5 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between pb-safe shadow-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <strong className="text-white">{metrics.words}</strong> w
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <strong className="text-white">{metrics.chars}</strong> c
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className="min-w-[42px] min-h-[42px] rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 flex items-center justify-center text-slate-200 transition-transform"
                  title="Copy note"
                  aria-label="Copy note"
                >
                  {showCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  className="min-w-[42px] min-h-[42px] rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 flex items-center justify-center text-sky-400 transition-transform"
                  title="Download note"
                  aria-label="Download note"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleTogglePin}
                  className={`min-w-[42px] min-h-[42px] rounded-xl active:scale-90 flex items-center justify-center transition-transform ${
                    editorIsPinned ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-white/5 text-slate-300'
                  }`}
                  title={editorIsPinned ? 'Unpin note' : 'Pin note'}
                  aria-label="Toggle pin"
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="min-h-[42px] px-3.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 font-semibold text-xs border border-sky-500/30 active:scale-95 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Check className="w-4 h-4 text-sky-300" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // ==========================================
          // 2. NOTES LIST VIEW
          // ==========================================
          <div id="notes-list-view" className="flex flex-col gap-4 pb-28">
            {/* Search Bar with Best Mobile Sizing */}
            <div className={`p-3 rounded-2xl ${glassCardClass} flex items-center gap-2 transition-all min-h-[50px]`}>
              <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
              <input
                id="input-search-notes"
                type="text"
                placeholder="Search notes, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-base sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  onClick={() => setSearchQuery('')}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white active:scale-90"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills with Ergonomic Touch Targets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                id="filter-all"
                onClick={() => {
                  setFilterType('all');
                  setSelectedTag(null);
                }}
                className={`px-4 py-2 min-h-[42px] rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all active:scale-95 flex items-center justify-center ${
                  filterType === 'all' && !selectedTag
                    ? `${theme.accent} shadow-md`
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                All ({notes.length})
              </button>

              <button
                id="filter-pinned"
                onClick={() => {
                  setFilterType('pinned');
                  setSelectedTag(null);
                }}
                className={`px-4 py-2 min-h-[42px] rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                  filterType === 'pinned'
                    ? `${theme.accent} shadow-md`
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                Pinned ({notes.filter((n) => n.isPinned).length})
              </button>

              <button
                id="filter-locked"
                onClick={() => {
                  setFilterType('locked');
                  setSelectedTag(null);
                }}
                className={`px-4 py-2 min-h-[42px] rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                  filterType === 'locked'
                    ? `${theme.accent} shadow-md`
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Protected ({notes.filter((n) => n.isLocked).length})
              </button>

              {allUniqueTags.map((tag) => (
                <button
                  key={tag}
                  id={`filter-tag-${tag}`}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                  }}
                  className={`px-4 py-2 min-h-[42px] rounded-xl text-xs sm:text-sm font-mono whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                    selectedTag === tag
                      ? `${theme.accent} shadow-md`
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  #{tag}
                </button>
              ))}
            </div>

            {/* Note Cards Grid or Clean Empty State */}
            {filteredNotes.length === 0 ? (
              <div
                id="empty-notes-state"
                className={`p-10 sm:p-14 rounded-3xl ${glassCardClass} flex flex-col items-center justify-center text-center gap-3 my-6`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shadow-inner">
                  <FileText className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {searchQuery ? 'No matching notes found' : 'No notes yet'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
                  {searchQuery
                    ? `No notes matched "${searchQuery}". Try another keyword or reset filters.`
                    : 'Your workspace is empty and ready. Create your first unlimited or passkey-protected note.'}
                </p>
                {!searchQuery && (
                  <button
                    id="btn-create-first-note"
                    onClick={handleCreateNewNote}
                    className={`mt-2 min-h-[48px] px-6 py-3 rounded-2xl ${theme.accent} ${theme.accentHover} shadow-lg text-sm font-semibold transition-transform active:scale-95 flex items-center gap-2`}
                  >
                    <Plus className="w-4 h-4" />
                    Create Note
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filteredNotes.map((note) => {
                  const dateLabel = new Date(note.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={note.id}
                      id={`note-card-${note.id}`}
                      onClick={() => handleOpenNote(note)}
                      className={`p-4 sm:p-5 rounded-3xl ${glassCardClass} cursor-pointer hover:border-white/25 transition-all duration-200 active:scale-[0.99] flex flex-col justify-between gap-3 group relative overflow-hidden`}
                    >
                      {/* Card Header: Title & Badges */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-white truncate tracking-tight">
                            {note.title || 'Untitled Note'}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {note.isPinned && (
                              <span className="p-1.5 rounded-lg text-amber-400" title="Pinned Note">
                                <Pin className="w-3.5 h-3.5 fill-amber-400" />
                              </span>
                            )}
                            {note.isLocked && (
                              <span
                                className="p-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                title="Passkey Protected"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            )}

                            {/* Remove Lock Trigger (if note is locked) */}
                            {note.isLocked && (
                              <button
                                onClick={(e) => handleTriggerRemoveLockFromCard(note, e)}
                                className="min-w-[38px] min-h-[38px] p-2 rounded-xl text-emerald-400/90 hover:text-rose-400 hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all"
                                title="Remove passkey lock"
                                aria-label="Remove lock"
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            )}

                            {/* Quick Note Download & Export Options */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDownloadTargetNote(note);
                                setShowDownloadModal(true);
                              }}
                              className="min-w-[38px] min-h-[38px] p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all"
                              title="Download note (format or lock file)"
                              aria-label="Download note"
                            >
                              <Download className="w-4 h-4 text-sky-400" />
                            </button>

                            {/* Duplicate note */}
                            <button
                              onClick={(e) => handleDuplicateNote(note, e)}
                              className="min-w-[38px] min-h-[38px] p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all"
                              title="Duplicate note"
                              aria-label="Duplicate note"
                            >
                              <CopyPlus className="w-4 h-4" />
                            </button>

                            {/* Delete note */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="min-w-[38px] min-h-[38px] p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 active:scale-90 flex items-center justify-center transition-all"
                              title={note.isLocked ? "Delete protected note (requires passkey)" : "Delete note"}
                              aria-label="Delete note"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card Content Snippet */}
                        <div className="mt-2">
                          {note.isLocked ? (
                            <div className="p-3 rounded-2xl bg-slate-950/40 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-mono">
                              <div className="flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                <span>Protected with passkey</span>
                              </div>
                              <span className="text-[10px] text-emerald-400/80 font-sans font-medium">Click to unlock</span>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line font-normal">
                              {note.content || <span className="text-slate-500 italic">Empty note</span>}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Tags & Date */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {note.tags && note.tags.length > 0 ? (
                            note.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] font-mono"
                              >
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 font-mono text-[10px]">Note</span>
                          )}
                        </div>
                        <span className="shrink-0 font-mono text-[10px]">{dateLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* Floating Action Button (+ Note) for List View with Best Mobile Touch Sizing */}
      {/* ============================================================ */}
      {!activeNoteId && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 pb-safe">
          <button
            id="fab-create-note"
            onClick={handleCreateNewNote}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${theme.accent} ${theme.accentHover} shadow-2xl flex items-center justify-center text-slate-950 transition-all transform active:scale-90 hover:scale-105`}
            title="Create New Note"
            aria-label="Create New Note"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* Theme Switcher Modal (5 Color Themes) */}
      {/* ============================================================ */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-sm p-5 rounded-3xl ${glassCardClass} flex flex-col gap-4 shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Color Themes</h3>
              </div>
              <button onClick={() => setShowThemeModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {Object.values(THEMES).map((t) => {
                const isSelected = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    id={`theme-select-${t.id}`}
                    onClick={() => {
                      setActiveTheme(t.id);
                      setShowThemeModal(false);
                      triggerToast(`Switched to ${t.name}`);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-400/80 bg-white/10 shadow-sm'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                        style={{ backgroundColor: t.dotColor }}
                      />
                      <span className="font-medium text-xs sm:text-sm text-white">{t.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Set Note Passkey / Password Modal */}
      {/* ============================================================ */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`w-full max-w-sm p-5 rounded-3xl ${glassCardClass} flex flex-col gap-4 shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Protect Note</h3>
              </div>
              <button
                onClick={() => {
                  setShowLockModal(false);
                  setLockError('');
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Create a custom passkey, password, or PIN. This note will be encrypted using <strong>AES-256-GCM</strong>.
            </p>

            {lockError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lockError}</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Passkey / Password</label>
                <div className="relative">
                  <input
                    id="input-lock-passkey"
                    type={showPasskeyChars ? 'text' : 'password'}
                    placeholder="Enter passkey or password"
                    value={newLockPasskey}
                    onChange={(e) => setNewLockPasskey(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskeyChars(!showPasskeyChars)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPasskeyChars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Confirm Passkey</label>
                <input
                  id="input-confirm-passkey"
                  type={showPasskeyChars ? 'text' : 'password'}
                  placeholder="Repeat passkey"
                  value={confirmLockPasskey}
                  onChange={(e) => setConfirmLockPasskey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowLockModal(false);
                  setLockError('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-lock"
                type="button"
                disabled={isProcessingCrypto}
                onClick={handleApplyLock}
                className={`flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  isProcessingCrypto ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessingCrypto ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Encrypt Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Contextual Unlock / Decrypt Modal */}
      {/* ============================================================ */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-sm p-5 rounded-3xl ${glassCardClass} flex flex-col gap-4 shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {unlockAction === 'download' ? (
                  <Download className="w-4 h-4 text-indigo-400" />
                ) : unlockAction === 'removeLock' ? (
                  <Unlock className="w-4 h-4 text-rose-400" />
                ) : unlockAction === 'delete' ? (
                  <Trash2 className="w-4 h-4 text-rose-400" />
                ) : (
                  <Lock className="w-4 h-4 text-emerald-400" />
                )}
                <h3 className="font-bold text-sm text-white">
                  {unlockAction === 'download'
                    ? 'Unlock to Download'
                    : unlockAction === 'removeLock'
                    ? 'Remove Note Lock'
                    : unlockAction === 'delete'
                    ? 'Delete Protected Note'
                    : 'Unlock Note'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockTargetNote(null);
                  setUnlockPasswordInput('');
                  setShowUnlockPasskeyChars(false);
                  setUnlockError('');
                }}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {unlockAction === 'download' ? (
                <>
                  Enter the passkey for <strong>&quot;{unlockTargetNote?.title || 'Untitled Note'}&quot;</strong> to decrypt and download as <strong>.{pendingDownloadFormat}</strong>.
                </>
              ) : unlockAction === 'removeLock' ? (
                <>
                  Enter the passkey to verify ownership and permanently remove the lock from <strong>&quot;{unlockTargetNote?.title || 'Untitled Note'}&quot;</strong>.
                </>
              ) : unlockAction === 'delete' ? (
                <>
                  This note is password-protected. Enter the passkey for <strong>&quot;{unlockTargetNote?.title || 'Untitled Note'}&quot;</strong> to authorize permanent deletion.
                </>
              ) : (
                <>This note is protected with AES-256 encryption. Enter passkey to decrypt and open.</>
              )}
            </p>

            {unlockAction === 'delete' && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Protected note: Enter passkey to confirm permanent deletion.</span>
              </div>
            )}

            {unlockError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Passkey / Password</label>
              <div className="relative">
                <input
                  id="input-unlock-password"
                  type={showUnlockPasskeyChars ? 'text' : 'password'}
                  placeholder="Enter passkey..."
                  value={unlockPasswordInput}
                  onChange={(e) => setUnlockPasswordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePerformUnlock();
                    }
                  }}
                  autoFocus
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowUnlockPasskeyChars(!showUnlockPasskeyChars)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  title={showUnlockPasskeyChars ? 'Hide passkey' : 'Show passkey'}
                >
                  {showUnlockPasskeyChars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockTargetNote(null);
                  setUnlockPasswordInput('');
                  setShowUnlockPasskeyChars(false);
                  setUnlockError('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-perform-unlock"
                type="button"
                disabled={isProcessingCrypto}
                onClick={handlePerformUnlock}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  unlockAction === 'delete' || unlockAction === 'removeLock'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : unlockAction === 'download'
                    ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                } ${isProcessingCrypto ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessingCrypto ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {unlockAction === 'download' ? (
                      <>
                        <Download className="w-4 h-4" />
                        Download .{pendingDownloadFormat}
                      </>
                    ) : unlockAction === 'removeLock' ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        Remove Lock
                      </>
                    ) : unlockAction === 'delete' ? (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Verify & Delete
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        Decrypt
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ============================================================ */}
      {/* In-App Confirmation Modal (Replaces window.confirm) */}
      {/* ============================================================ */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-sm p-5 rounded-3xl ${glassCardClass} flex flex-col gap-4 shadow-2xl border ${
              confirmModal.isDanger ? 'border-rose-500/40' : 'border-white/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  confirmModal.isDanger ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {confirmModal.isDanger ? <Trash2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-base text-white">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.message}</p>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                  confirmModal.isDanger
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Three Lines Menu & Settings Drawer */}
      {/* ============================================================ */}
      {showMenuDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-fade-in">
          {/* Clickable backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setShowMenuDrawer(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div
            className={`relative w-full max-w-md h-full flex flex-col ${glassCardClass} border-l border-white/15 shadow-2xl overflow-hidden z-10`}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${theme.accent}`}
                >
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                    Settings & Options
                  </h2>
                  <p className="text-[11px] text-slate-400">Workspace preferences and downloads</p>
                </div>
              </div>
              <button
                id="btn-close-menu-drawer"
                onClick={() => setShowMenuDrawer(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* SECTION 1: SETTINGS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <span>Settings</span>
                </div>

                {/* Sub-item: Color Themes */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Color Themes</span>
                    <span className="text-[11px] text-slate-400 capitalize">{theme.name}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.values(THEMES).map((t) => {
                      const isSelected = activeTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveTheme(t.id);
                            triggerToast(`Switched to ${t.name}`);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-indigo-400/80 bg-white/10 shadow-sm'
                              : 'border-white/5 bg-black/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3 h-3 rounded-full ring-2 ring-white/20"
                              style={{ backgroundColor: t.dotColor }}
                            />
                            <span className="font-medium text-xs text-white">{t.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-item: Liquid Glass vs Clean Matte */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Liquid Glass Effect</div>
                      <div className="text-[11px] text-slate-400">Refractive blur and specular borders</div>
                    </div>
                  </div>
                  <button
                    id="drawer-toggle-glass"
                    onClick={() => {
                      const next = !isLiquidGlass;
                      setIsLiquidGlass(next);
                      triggerToast(next ? 'Liquid Glass active' : 'Clean Matte active');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      isLiquidGlass ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                    aria-label="Toggle liquid glass"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isLiquidGlass ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Sub-item: Editor Font Size */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-white">Editor Font Size</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['sm', 'base', 'lg'] as const).map((size) => {
                      const labels = { sm: 'Compact', base: 'Standard', lg: 'Spacious' };
                      const isSelected = editorFontSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            setEditorFontSize(size);
                            triggerToast(`Font size: ${labels[size]}`);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                            isSelected
                              ? 'bg-indigo-500 text-white border-indigo-400 font-semibold'
                              : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          {labels[size]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION: PROJECT SOURCE CODE (.ZIP) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <FileArchive className="w-4 h-4 text-cyan-400" />
                  <span>Project Source Code</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/50 border border-cyan-500/30 space-y-2.5 shadow-lg shadow-cyan-950/30">
                  <div>
                    <div className="text-xs font-bold text-white">Download Project (.zip)</div>
                    <div className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                      All files, configs & instructions included to easily build your own Android .apk
                    </div>
                  </div>
                  <a
                    id="drawer-download-source-zip-btn"
                    href="/xernotes-source.zip"
                    download="xernotes-source.zip"
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Source (.zip)</span>
                  </a>
                </div>
              </div>

              {/* SECTION 2: DOWNLOAD NOTES */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Notes</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Export your notes in universal formats with no character limitations.
                  </p>

                  <div className="flex flex-col gap-2">
                    {/* Download All .txt */}
                    <button
                      id="drawer-download-all-txt"
                      onClick={handleDownloadAllNotesText}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-xs font-semibold text-white">Download All Notes (.txt)</div>
                          <div className="text-[11px] text-slate-400">Combined readable plain text document</div>
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>

                    {/* Download All .md */}
                    <button
                      id="drawer-download-all-md"
                      onClick={handleDownloadAllNotesMarkdown}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileDown className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="text-xs font-semibold text-white">Download All Notes (.md)</div>
                          <div className="text-[11px] text-slate-400">Markdown archive formatted with headings</div>
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>

                    {/* Download JSON Backup */}
                    <button
                      id="drawer-download-backup-json"
                      onClick={handleBackupAllJSON}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderDown className="w-4 h-4 text-sky-400" />
                        <div>
                          <div className="text-xs font-semibold text-white">Download Full Backup (.json)</div>
                          <div className="text-[11px] text-slate-400">Full backup preserving encryption and tags</div>
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>

                    {/* If editing active note */}
                    {activeNoteId && (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <div className="text-[11px] font-semibold text-indigo-300">Active Note Formats:</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => handleDownloadCurrentNote('txt')}
                            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium text-center"
                          >
                            .txt
                          </button>
                          <button
                            onClick={() => handleDownloadCurrentNote('md')}
                            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium text-center"
                          >
                            .md
                          </button>
                          <button
                            onClick={() => handleDownloadCurrentNote('print')}
                            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium text-center flex items-center justify-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: IMPORT NOTES */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>Import Notes</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Restore from Backup</div>
                    <div className="text-[11px] text-slate-400">Import a previously exported .json file</div>
                  </div>
                  <button
                    id="drawer-import-backup-btn"
                    onClick={() => importInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* SECTION 4: SECURITY & VAULT */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Security & Encryption</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Protected Notes</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {notes.filter((n) => n.isLocked).length} / {notes.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Clear All PIN Lock</span>
                    <span className="font-mono text-[11px] text-white">
                      {clearAllLockHash ? 'Enabled (Protected)' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Encryption Cipher</span>
                    <span className="font-mono text-[11px] text-white">AES-256-GCM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Key Derivation</span>
                    <span className="font-mono text-[11px] text-white">PBKDF2 (100k rounds)</span>
                  </div>
                </div>
              </div>

              {/* SECTION 5: STORAGE MANAGEMENT & CLEAR ALL PROTECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-400">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-rose-400" />
                    <span>Storage & Reset</span>
                  </div>
                  {clearAllLockHash ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium lowercase tracking-normal">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>PIN Protected</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium lowercase tracking-normal">
                      No PIN Set
                    </span>
                  )}
                </div>

                {/* Clear All Lock Button Configuration */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white">Lock "Clear All" Button</div>
                        <div className="text-[11px] text-slate-400">
                          {clearAllLockHash 
                            ? 'Protected: strangers cannot wipe your notes without your PIN.'
                            : 'Set a PIN to prevent anyone else from wiping your notes.'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {clearAllLockHash ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRemovingClearAllLock(false);
                            setClearAllLockConfigInput('');
                            setClearAllLockConfigConfirm('');
                            setClearAllLockCurrentVerify('');
                            setClearAllLockConfigError('');
                            setShowClearAllLockConfigModal(true);
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Change PIN</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRemovingClearAllLock(true);
                            setClearAllLockCurrentVerify('');
                            setClearAllLockConfigError('');
                            setShowClearAllLockConfigModal(true);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Remove Lock</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRemovingClearAllLock(false);
                          setClearAllLockConfigInput('');
                          setClearAllLockConfigConfirm('');
                          setClearAllLockCurrentVerify('');
                          setClearAllLockConfigError('');
                          setShowClearAllLockConfigModal(true);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Lock Clear All with PIN</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Clear All Action Card (In-place modal, doesn't force user to navigate home!) */}
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>Clear All Notes</span>
                      {clearAllLockHash && <Lock className="w-3 h-3 text-amber-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {notes.filter((n) => n.isLocked).length > 0
                        ? `${notes.length} notes (${notes.filter((n) => n.isLocked).length} protected)`
                        : `Permanently erase all ${notes.length} notes`}
                    </div>
                  </div>
                  <button
                    id="drawer-clear-all-notes"
                    onClick={handleTriggerClearAll}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Download Notes Modal */}
      {/* ============================================================ */}
      {showDownloadModal && (() => {
        const targetNote = downloadTargetNote || (activeNoteId ? notes.find((n) => n.id === activeNoteId) : null);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md p-5 rounded-3xl ${glassCardClass} flex flex-col gap-4 shadow-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {targetNote ? `Download "${targetNote.title || 'Untitled Note'}"` : 'Download All Notes'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowDownloadModal(false);
                    setDownloadTargetNote(null);
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                  aria-label="Close download modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Select your export format. You can download plain files or export with password protection.
              </p>

              <div className="flex flex-col gap-2.5">
                {targetNote ? (
                  <>
                    {/* Plain Text (.txt) */}
                    <button
                      onClick={(e) => {
                        setShowDownloadModal(false);
                        handleDownloadCardNote(targetNote, e, 'txt');
                        setDownloadTargetNote(null);
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Plain Text Document (.txt)</div>
                          <div className="text-[11px] text-slate-400">Universal text file with date and tags</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </button>

                    {/* Markdown (.md) */}
                    <button
                      onClick={(e) => {
                        setShowDownloadModal(false);
                        handleDownloadCardNote(targetNote, e, 'md');
                        setDownloadTargetNote(null);
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                          <FileDown className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Markdown Document (.md)</div>
                          <div className="text-[11px] text-slate-400">Formatted headings and blockquotes</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </button>

                    {/* Print / Save as PDF */}
                    <button
                      onClick={() => {
                        setShowDownloadModal(false);
                        setDownloadTargetNote(null);
                        window.print();
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                          <Printer className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Print / Save as PDF</div>
                          <div className="text-[11px] text-slate-400">Clean print preview ready for PDF saving</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </button>

                    {/* Raw JSON */}
                    <button
                      onClick={() => {
                        const data = JSON.stringify(targetNote, null, 2);
                        const cleanTitle = (targetNote.title || 'note').toLowerCase().replace(/[^a-z0-9]/g, '_');
                        downloadFile(data, `${cleanTitle}.json`, 'application/json');
                        triggerToast('Downloaded as .json');
                        setShowDownloadModal(false);
                        setDownloadTargetNote(null);
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                          <FolderDown className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Note JSON (.json)</div>
                          <div className="text-[11px] text-slate-400">Structured note data format</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Download All as Plain Text */}
                    <button
                      onClick={handleDownloadAllNotesText}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Download All Notes as .txt</div>
                          <div className="text-[11px] text-slate-400">Single text file with all notes separated cleanly</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </button>

                    {/* Download All as Markdown */}
                    <button
                      onClick={handleDownloadAllNotesMarkdown}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                          <FileDown className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Download All Notes as Markdown (.md)</div>
                          <div className="text-[11px] text-slate-400">Organized archive with titles, dates, and tags</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </button>

                    {/* Download Full Backup (.json) */}
                    <button
                      onClick={() => {
                        handleBackupAllJSON();
                        setShowDownloadModal(false);
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                          <FolderDown className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Download Full Backup (.json)</div>
                          <div className="text-[11px] text-slate-400">Encrypted backup file to restore later</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </button>

                    {/* Download Project Source (.zip) for building APK */}
                    <a
                      href="/xernotes-source.zip"
                      download="xernotes-source.zip"
                      onClick={() => setShowDownloadModal(false)}
                      className="p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-left flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                          <FileArchive className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-cyan-300">Download Full Project Code (.zip)</div>
                          <div className="text-[11px] text-slate-300">All source files & instructions to build Android APK</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-cyan-400 group-hover:text-white" />
                    </a>
                  </>
                )}
              </div>

              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadModal(false);
                    setDownloadTargetNote(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================ */}
      {/* In-Place Clear All Flow Modal */}
      {/* Stays in current view, supports PIN lock & protected note passkeys */}
      {/* ============================================================ */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md p-5 rounded-3xl ${glassCardClass} flex flex-col gap-4 shadow-2xl border border-rose-500/30`}>
            {/* Step 1: Clear All PIN Authentication (If Locked) */}
            {clearAllStep === 'auth' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">Clear All Locked</h3>
                      <p className="text-[11px] text-slate-400">Security PIN verification required</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowClearAllModal(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The Clear All feature is protected with a security PIN to prevent accidental deletion or unauthorized users from clearing your notes.
                </p>

                {clearAllAuthError && (
                  <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{clearAllAuthError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Enter Clear All PIN</label>
                  <div className="relative">
                    <input
                      type={showClearAllPinChars ? 'text' : 'password'}
                      placeholder="Enter security PIN..."
                      value={clearAllPinInput}
                      onChange={(e) => setClearAllPinInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerifyClearAllPin();
                      }}
                      autoFocus
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClearAllPinChars(!showClearAllPinChars)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showClearAllPinChars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearAllModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyClearAllPin}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Action</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Clear Options (Handles Protected vs Unprotected Notes) */}
            {clearAllStep === 'options' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">Clear Notes</h3>
                      <p className="text-[11px] text-slate-400">Total: {notes.length} notes in workspace</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowClearAllModal(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Case A: User has protected notes */}
                {notes.filter((n) => n.isLocked).length > 0 ? (
                  <>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">
                          {notes.filter((n) => n.isLocked).length} Protected Note(s) Detected
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Your protected notes are encrypted with a passkey. You can clear only unprotected notes, or enter the passkey to erase all.
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Option 1: Clear Unprotected Notes Only (Recommended) */}
                      <button
                        type="button"
                        onClick={handleClearUnprotectedNotesOnly}
                        className="w-full p-3 rounded-2xl bg-white/5 hover:bg-sky-500/15 border border-white/10 hover:border-sky-500/30 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-sky-300">
                            Clear {notes.length - notes.filter((n) => n.isLocked).length} Unprotected Notes
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300">
                            Safe
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Protected notes remain completely safe and untouched.
                        </div>
                      </button>

                      {/* Option 2: Delete Everything (Requires Protected Passkey) */}
                      <button
                        type="button"
                        onClick={() => {
                          setProtectedDeleteError('');
                          setProtectedDeletePasskey('');
                          setClearAllStep('protected_passkey');
                        }}
                        className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-left transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-rose-300">
                            Delete ALL Notes (Including Protected)
                          </div>
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Requires entering the protected notes passkey to confirm erasure.
                        </div>
                      </button>
                    </div>

                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => setShowClearAllModal(false)}
                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  /* Case B: No protected notes exist */
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Are you sure you want to permanently clear all <strong className="text-white">{notes.length}</strong> notes? This action cannot be undone.
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowClearAllModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllUnconditional}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step 3: Protected Notes Passkey Entry */}
            {clearAllStep === 'protected_passkey' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">Enter Protected Passkey</h3>
                      <p className="text-[11px] text-slate-400">Required to authorize deletion</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowClearAllModal(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter the passkey you used to protect your notes. This prevents unknown users or accidental actions from erasing important protected data.
                </p>

                {protectedDeleteError && (
                  <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{protectedDeleteError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Protected Note Passkey</label>
                  <div className="relative">
                    <input
                      type={showProtectedDeletePasskeyChars ? 'text' : 'password'}
                      placeholder="Enter passkey to confirm erasure..."
                      value={protectedDeletePasskey}
                      onChange={(e) => setProtectedDeletePasskey(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmDeleteAllWithProtectedPasskey();
                      }}
                      autoFocus
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-rose-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProtectedDeletePasskeyChars(!showProtectedDeletePasskeyChars)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showProtectedDeletePasskeyChars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setClearAllStep('options')}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingCrypto}
                    onClick={handleConfirmDeleteAllWithProtectedPasskey}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {isProcessingCrypto ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Authorize & Erase</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Clear All Lock Button Configuration Modal */}
      {/* Lets user set, change, or remove PIN protection for Clear All */}
      {/* ============================================================ */}
      {showClearAllLockConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md p-5 rounded-3xl ${glassCardClass} flex flex-col gap-4 shadow-2xl border border-amber-500/30`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {isRemovingClearAllLock
                      ? 'Remove Clear All PIN'
                      : clearAllLockHash
                      ? 'Change Clear All PIN'
                      : 'Lock "Clear All" Button'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Accidental & stranger wipe prevention</p>
                </div>
              </div>
              <button
                onClick={() => setShowClearAllLockConfigModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isRemovingClearAllLock
                ? 'Enter your current PIN to remove the lock on the Clear All button.'
                : 'Set a PIN so nobody can click Clear All and delete your notes without knowing the password.'}
            </p>

            {clearAllLockConfigError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{clearAllLockConfigError}</span>
              </div>
            )}

            {/* Current PIN verification if already locked */}
            {clearAllLockHash && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Current PIN</label>
                <input
                  type={showClearAllConfigChars ? 'text' : 'password'}
                  placeholder="Enter current PIN..."
                  value={clearAllLockCurrentVerify}
                  onChange={(e) => setClearAllLockCurrentVerify(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            )}

            {/* New PIN & Confirm (if not removing) */}
            {!isRemovingClearAllLock && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">New PIN / Passkey</label>
                  <div className="relative">
                    <input
                      type={showClearAllConfigChars ? 'text' : 'password'}
                      placeholder="At least 3 characters..."
                      value={clearAllLockConfigInput}
                      onChange={(e) => setClearAllLockConfigInput(e.target.value)}
                      autoFocus={!clearAllLockHash}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClearAllConfigChars(!showClearAllConfigChars)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showClearAllConfigChars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Confirm New PIN</label>
                  <input
                    type={showClearAllConfigChars ? 'text' : 'password'}
                    placeholder="Repeat new PIN..."
                    value={clearAllLockConfigConfirm}
                    onChange={(e) => setClearAllLockConfigConfirm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfigureClearAllLock();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowClearAllLockConfigModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfigureClearAllLock}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  isRemovingClearAllLock
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {isRemovingClearAllLock ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Remove PIN</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save PIN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
