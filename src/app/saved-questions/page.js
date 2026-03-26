'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ARABIC_LETTERS } from '@/lib/arabicLetters';
import {
  getAllSeenData,
  getQuestionsForLetter,
  removeSeenId,
  setSeenIds,
} from '@/lib/questions';
import './page.css';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildGroupedData(seenData) {
  return ARABIC_LETTERS.map(letter => {
    const seenIds = seenData[letter] || [];
    const allForLetter = getQuestionsForLetter(letter);
    const seenQuestions = allForLetter.filter(q => seenIds.includes(q.id));
    return {
      letter,
      seenQuestions,
      totalForLetter: allForLetter.length,
      isExhausted: allForLetter.length > 0 && seenIds.length >= allForLetter.length,
    };
  }).filter(g => g.seenQuestions.length > 0);
}

function matchesSearch(q, query) {
  if (!query) return true;
  const lower = query.toLowerCase();
  return (
    q.question.toLowerCase().includes(lower) ||
    q.answer.toLowerCase().includes(lower) ||
    q.letter.includes(query)
  );
}

// ─── component ──────────────────────────────────────────────────────────────

export default function SavedQuestionsPage() {
  const [loading, setLoading]       = useState(true);
  const [seenData, setSeenData]     = useState({});
  const [search, setSearch]         = useState('');
  const [viewMode, setViewMode]     = useState('grouped'); // 'grouped' | 'flat'
  const [openLetters, setOpenLetters] = useState(new Set());
  const [selected, setSelected]     = useState(new Set()); // set of question IDs
  const [modal, setModal]           = useState(null); // { type, letter? }
  const [toast, setToast]           = useState(null); // { msg, kind }
  const toastTimer = useRef(null);
  const importRef = useRef(null);

  // Load data from localStorage
  const reload = useCallback(() => {
    if (typeof window === 'undefined') return;
    setSeenData(getAllSeenData());
  }, []);

  useEffect(() => {
    reload();
    setLoading(false);
  }, [reload]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg, kind = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // ── Computed data ─────────────────────────────────────────────────────────
  const grouped = buildGroupedData(seenData);
  const totalSeen = grouped.reduce((s, g) => s + g.seenQuestions.length, 0);
  const lettersWithData = grouped.length;
  const exhaustedCount = grouped.filter(g => g.isExhausted).length;

  // Flat list (filtered by search)
  const flatList = grouped
    .flatMap(g => g.seenQuestions)
    .filter(q => matchesSearch(q, search));

  // For grouped mode: filter questions within each group by search
  const filteredGrouped = grouped
    .map(g => ({
      ...g,
      seenQuestions: g.seenQuestions.filter(q => matchesSearch(q, search)),
    }))
    .filter(g => g.seenQuestions.length > 0);

  // ── Toggle letter expand ──────────────────────────────────────────────────
  const toggleLetter = (letter) => {
    setOpenLetters(prev => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  };

  // Auto-open all groups when search is active
  useEffect(() => {
    if (search) {
      setOpenLetters(new Set(filteredGrouped.map(g => g.letter)));
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleReactivate = (letter, id) => {
    removeSeenId(letter, id);
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    reload();
    showToast('تمت إعادة تفعيل السؤال ✅');
  };

  const handleClearLetter = (letter) => {
    setModal({ type: 'clear-letter', letter });
  };

  const handleBulkDelete = () => {
    setModal({ type: 'bulk-delete' });
  };

  const handleClearAll = () => {
    setModal({ type: 'clear-all' });
  };

  const confirmModal = () => {
    if (!modal) return;

    if (modal.type === 'clear-letter') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`seen_q_${modal.letter}`);
      }
      showToast(`تم مسح الحرف "${modal.letter}" ✅`);
    }

    if (modal.type === 'bulk-delete') {
      // Group selected IDs by letter
      const byLetter = {};
      for (const id of selected) {
        const [letter] = id.split('_');
        if (!byLetter[letter]) byLetter[letter] = [];
        byLetter[letter].push(id);
      }
      for (const [letter, ids] of Object.entries(byLetter)) {
        const currentSeen = seenData[letter] || [];
        const remaining = currentSeen.filter(sid => !ids.includes(sid));
        setSeenIds(letter, remaining);
      }
      showToast(`تم حذف ${selected.size} سؤال ✅`);
      setSelected(new Set());
    }

    if (modal.type === 'clear-all') {
      for (const letter of ARABIC_LETTERS) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`seen_q_${letter}`);
        }
      }
      showToast('تم مسح جميع الأسئلة المحفوظة ✅');
      setSelected(new Set());
    }

    setModal(null);
    reload();
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (totalSeen === 0) { showToast('لا توجد بيانات للتصدير', 'error'); return; }
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'huroof-abdo',
      version: '2.3.0',
      seenQuestions: seenData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'huroof-seen-questions-export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم التصدير بنجاح 📥');
  };

  // ── Import ────────────────────────────────────────────────────────────────
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        const data = json.seenQuestions || json; // support both wrapped and raw
        if (typeof data !== 'object') throw new Error('invalid');
        let count = 0;
        for (const [letter, ids] of Object.entries(data)) {
          if (!Array.isArray(ids)) continue;
          const currentSeen = seenData[letter] || [];
          const merged = [...new Set([...currentSeen, ...ids])];
          setSeenIds(letter, merged);
          count++;
        }
        reload();
        showToast(`تم الاستيراد: ${count} حرف ✅`);
      } catch {
        showToast('ملف غير صالح ❌', 'error');
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = '';
  };

  // ─── Modal text ────────────────────────────────────────────────────────────
  const modalTitle = {
    'clear-letter': `مسح الحرف "${modal?.letter}"`,
    'bulk-delete':  `حذف ${selected.size} سؤال`,
    'clear-all':    'مسح جميع الأسئلة المحفوظة',
  }[modal?.type] || '';

  const modalDesc = {
    'clear-letter': 'سيتم إعادة تفعيل جميع أسئلة هذا الحرف وإزالتها من قائمة "المحفوظة". هذا الإجراء لا يمكن التراجع عنه.',
    'bulk-delete':  'سيتم إعادة تفعيل الأسئلة المحددة وإزالتها من القائمة. لا يمكن التراجع عن هذا.',
    'clear-all':    'سيتم مسح جميع البيانات المحفوظة لكل الحروف. ستُطرح الأسئلة من البداية. هذا الإجراء لا يمكن التراجع عنه.',
  }[modal?.type] || '';

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="sq-container">
      {/* Background blobs */}
      <div className="sq-blob top-right" aria-hidden="true" />
      <div className="sq-blob bottom-left" aria-hidden="true" />

      <div className="sq-inner">
        {/* ── Header ── */}
        <div className="sq-header">
          <Link href="/" className="sq-back-btn" aria-label="العودة للرئيسية">
            &#8594; الرئيسية
          </Link>
          <h1 className="sq-title">إدارة الأسئلة المحفوظة</h1>
        </div>

        {/* ── Logo ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-8px' }}>
          <Link href="/">
            <Image
              src="/assets/logo_transparent.png"
              alt="حروف مع عبدو"
              width={200}
              height={90}
              priority
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.4))' }}
            />
          </Link>
        </div>

        {/* ── Stats ── */}
        {!loading && (
          <div className="sq-stats" role="region" aria-label="إحصائيات">
            <div className="sq-stat-card">
              <span className="sq-stat-value orange">{totalSeen}</span>
              <span className="sq-stat-label">إجمالي المحفوظة</span>
            </div>
            <div className="sq-stat-card">
              <span className="sq-stat-value purple">{lettersWithData}</span>
              <span className="sq-stat-label">حرف نشط</span>
            </div>
            <div className="sq-stat-card">
              <span className="sq-stat-value yellow">{exhaustedCount}</span>
              <span className="sq-stat-label">حرف مكتمل</span>
            </div>
            <div className="sq-stat-card">
              <span className="sq-stat-value green">{ARABIC_LETTERS.length - lettersWithData}</span>
              <span className="sq-stat-label">حرف لم يُسأل</span>
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="sq-toolbar" role="toolbar" aria-label="أدوات البحث والتصفية">
          <input
            type="search"
            className="sq-search"
            placeholder="ابحث بالسؤال أو الجواب أو الحرف…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="بحث في الأسئلة"
          />

          <button
            className={`sq-filter-btn${viewMode === 'grouped' ? ' active' : ''}`}
            onClick={() => setViewMode('grouped')}
            aria-pressed={viewMode === 'grouped'}
          >
            📂 مجمّع
          </button>
          <button
            className={`sq-filter-btn${viewMode === 'flat' ? ' active' : ''}`}
            onClick={() => setViewMode('flat')}
            aria-pressed={viewMode === 'flat'}
          >
            📋 قائمة
          </button>

          <button className="sq-action-btn export" onClick={handleExport} title="تصدير البيانات كـ JSON">
            ⬇ تصدير
          </button>

          <label className="sq-action-btn import-lbl" title="استيراد ملف JSON">
            ⬆ استيراد
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              style={{ display: 'none' }}
              aria-label="استيراد ملف JSON"
            />
          </label>

          {totalSeen > 0 && (
            <button
              className="sq-action-btn danger"
              onClick={handleClearAll}
              title="مسح كل الأسئلة المحفوظة"
            >
              🗑 مسح الكل
            </button>
          )}
        </div>

        {/* ── Bulk bar ── */}
        {selected.size > 0 && (
          <div className="sq-bulk-bar" role="region" aria-label="إجراءات التحديد المتعدد">
            <span>تم تحديد {selected.size} سؤال</span>
            <button className="sq-bulk-action-btn" onClick={handleBulkDelete}>
              🗑 حذف المحدد
            </button>
            <button className="sq-bulk-cancel-btn" onClick={clearSelection}>
              إلغاء التحديد
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="sq-loading" aria-busy="true" aria-label="جارٍ التحميل">
            {[1,2,3].map(i => <div key={i} className="sq-skeleton" />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && totalSeen === 0 && (
          <div className="sq-empty" role="status">
            <div className="sq-empty-icon">📭</div>
            <h2 className="sq-empty-title">لا توجد أسئلة محفوظة</h2>
            <p className="sq-empty-desc">
              ستظهر الأسئلة هنا تلقائياً بعد بدء اللعب. نظام منع التكرار يحفظ الأسئلة المعروضة لكل حرف.
            </p>
            <Link href="/" className="sq-back-btn" style={{ marginTop: '8px' }}>
              ابدأ لعبة الآن ←
            </Link>
          </div>
        )}

        {/* ── No search results ── */}
        {!loading && totalSeen > 0 && search && (viewMode === 'flat' ? flatList.length === 0 : filteredGrouped.length === 0) && (
          <div className="sq-empty" role="status">
            <div className="sq-empty-icon">🔍</div>
            <h2 className="sq-empty-title">لا توجد نتائج</h2>
            <p className="sq-empty-desc">جرّب كلمة بحث مختلفة</p>
          </div>
        )}

        {/* ── Flat list ── */}
        {!loading && viewMode === 'flat' && flatList.length > 0 && (
          <div className="sq-flat-list" role="list" aria-label="قائمة الأسئلة المحفوظة">
            {flatList.map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                isSelected={selected.has(q.id)}
                onToggleSelect={() => toggleSelect(q.id)}
                onReactivate={() => handleReactivate(q.letter, q.id)}
                showLetterBadge
              />
            ))}
          </div>
        )}

        {/* ── Grouped ── */}
        {!loading && viewMode === 'grouped' && filteredGrouped.length > 0 && (
          <div role="list" aria-label="الأسئلة مجمّعة بالحرف">
            {filteredGrouped.map(group => (
              <LetterGroup
                key={group.letter}
                group={group}
                isOpen={openLetters.has(group.letter)}
                onToggle={() => toggleLetter(group.letter)}
                onClearLetter={() => handleClearLetter(group.letter)}
                selected={selected}
                onToggleSelect={toggleSelect}
                onReactivate={handleReactivate}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Confirmation modal ── */}
      {modal && (
        <div
          className="sq-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sq-modal-title"
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div className="sq-modal">
            <h3 id="sq-modal-title">{modalTitle}</h3>
            <p>{modalDesc}</p>
            <div className="sq-modal-actions">
              <button className="sq-modal-cancel" onClick={() => setModal(null)} autoFocus>
                إلغاء
              </button>
              <button className="sq-modal-confirm" onClick={confirmModal}>
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`sq-toast${toast.kind === 'error' ? ' error' : ' success'}`} role="status" aria-live="polite">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── LetterGroup sub-component ────────────────────────────────────────────────

function LetterGroup({ group, isOpen, onToggle, onClearLetter, selected, onToggleSelect, onReactivate }) {
  const { letter, seenQuestions, totalForLetter, isExhausted } = group;

  return (
    <div className="sq-letter-group" role="listitem">
      <div
        className="sq-letter-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`الحرف ${letter}، ${seenQuestions.length} سؤال محفوظ`}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
      >
        <div className="sq-letter-badge" aria-hidden="true">{letter}</div>
        <span className="sq-letter-name">الحرف {letter}</span>
        <span className="sq-letter-count">{seenQuestions.length} / {totalForLetter}</span>
        {isExhausted && (
          <span className="sq-letter-exhausted" title="شُوهدت جميع أسئلة هذا الحرف">⭐ مكتمل</span>
        )}
        <button
          className="sq-letter-clear-btn"
          onClick={e => { e.stopPropagation(); onClearLetter(); }}
          title={`مسح الحرف ${letter}`}
          aria-label={`مسح بيانات الحرف ${letter}`}
        >
          مسح
        </button>
        <span className={`sq-letter-chevron${isOpen ? ' open' : ''}`} aria-hidden="true">▼</span>
      </div>

      {isOpen && (
        <div className="sq-question-list" role="list" aria-label={`أسئلة الحرف ${letter}`}>
          {seenQuestions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              isSelected={selected.has(q.id)}
              onToggleSelect={() => onToggleSelect(q.id)}
              onReactivate={() => onReactivate(q.letter, q.id)}
              showLetterBadge={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── QuestionCard sub-component ───────────────────────────────────────────────

function QuestionCard({ question, isSelected, onToggleSelect, onReactivate, showLetterBadge }) {
  return (
    <div
      className={`sq-question-card${isSelected ? ' selected' : ''}`}
      role="listitem"
    >
      <input
        type="checkbox"
        className="sq-question-checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        aria-label={`تحديد السؤال: ${question.question}`}
      />

      {showLetterBadge && (
        <div className="sq-question-letter-mini" aria-hidden="true">{question.letter}</div>
      )}

      <div className="sq-question-body">
        <div className="sq-question-text">{question.question}</div>
        <div className="sq-question-answer">
          <span>الجواب: </span>{question.answer}
        </div>
      </div>

      <div className="sq-question-actions">
        <button
          className="sq-reactivate-btn"
          onClick={onReactivate}
          title="إعادة تفعيل هذا السؤال (إزالته من المحفوظة)"
          aria-label={`إعادة تفعيل: ${question.question}`}
        >
          ↩ إعادة
        </button>
      </div>
    </div>
  );
}
