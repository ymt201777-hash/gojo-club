/* ============================================================
   活動報告 詳細ページ 共通レンダラー
   各記事の index.html に書いた window.ARTICLE を読み取り、
   ヘッダー・アイキャッチ・本文・前後ナビ・フッターを生成します。
   ★記事を追加するときは index.html の ARTICLE を書くだけ。
     このファイルは基本さわらなくてOK。
   ============================================================ */
(function () {
  var a = window.ARTICLE;
  if (!a) {
    console.error('ARTICLE が定義されていません。index.html を確認してください。');
    return;
  }

  var IMG = '/images/';                                  // 画像フォルダ
  var SITE = '認定NPO法人五条クラブ';
  var FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSf1DILhXa41wt5uwXnIUgd5tR2fM9UG1Bz9wDiELXGrGOWsBw/viewform';   // 支援する Googleフォーム
  var BASE = 'https://gojo-club.jp/activity-report/' + a.slug + '/';

  /* ---- <head> のメタ情報 ---- */
  document.title = a.title + ' | 活動報告 | ' + SITE;
  setMeta('description', a.description || '');
  setLinkRel('canonical', BASE);
  setMetaProp('og:url', BASE);
  setMetaProp('og:title', a.title);
  setMetaProp('og:type', 'article');

  /* ---- 本文ブロックを上から順に組み立て ---- */
  var bodyHtml = (a.body || []).map(renderBlock).join('\n');

  /* ---- ページ全体を描画 ---- */
  document.body.innerHTML =
    header() +
    '<article>' +
      '<div class="detail-col detail-head">' +
        '<div class="detail-head-row">' +
          '<h1 class="detail-title">' + esc(a.title) + '</h1>' +
          '<p class="detail-date">' + esc(a.date) + '</p>' +
        '</div>' +
      '</div>' +
      eyecatchHtml(a.eyecatch) +
      '<div class="detail-col">' +
        '<div class="detail-body">' +
          bodyHtml +
          navHtml(a.prev, a.next) +
        '</div>' +
      '</div>' +
    '</article>' +
    footer();

  initDrawer();
  syncColumnWidth();   // 本文・タイトル列の幅をトップ画の実寸に合わせる

  /* トップ画（1枚 or 横並び複数枚）の表示幅を測り、
     タイトル・本文の列幅(--eyecatch-w)に反映。
     これで画像・タイトルの位置は変えずに、本文だけトップ画の右端まで広がる。 */
  function syncColumnWidth() {
    var ec = document.querySelector('.detail-eyecatch');
    var art = document.querySelector('article');
    if (!ec || !art) return;
    var apply = function () {
      var w = ec.getBoundingClientRect().width;
      if (w) art.style.setProperty('--eyecatch-w', w + 'px');
    };
    apply();
    ec.querySelectorAll('img').forEach(function (im) {
      if (!im.complete) im.addEventListener('load', apply);
    });
    window.addEventListener('resize', apply);
  }

  /* トップ画 HTML。
       { src, alt }              … 1枚
       { srcs:[...], alt:[...] } … 隙間なしで横並び
       { grid:[...], alt:[...] } … グリッド状に配置（3枚以上向け） */
  function eyecatchHtml(ec) {
    var alts = Array.isArray(ec.alt) ? ec.alt : [ec.alt];
    var imgsHtml = function (list) {
      return list.map(function (s, i) {
        return '<img src="' + IMG + s + '" alt="' + esc(alts[i] || '') + '" loading="eager">';
      }).join('');
    };
    if (ec.grid) {
      return '<div class="detail-eyecatch detail-eyecatch-grid">' + imgsHtml(ec.grid) + '</div>';
    }
    return '<div class="detail-eyecatch">' + imgsHtml(ec.srcs || [ec.src]) + '</div>';
  }

  /* ============================================================
     ブロック種別 → HTML
       { p:   "本文テキスト" }        … 段落（<strong>等のHTMLもそのまま使えます）
       { h3:  "小見出し" }            … 見出し
       { img: "detail-02.png", alt: "説明" } … 本文中の写真
       { imgs:["a.png","b.png"] }     … 写真を横並び（2枚以上）
       { ol:  ["項目1", "項目2"] }    … 番号付きリスト
       { ul:  ["①…", "②…"] }         … 箇条書き（支援リスト）
     ============================================================ */
  function renderBlock(b) {
    if (b.p   != null) return '<p>' + b.p + '</p>';
    if (b.h3  != null) return '<h3>' + esc(b.h3) + '</h3>';
    if (b.img != null) return '<img src="' + IMG + b.img + '" alt="' + esc(b.alt || '') + '" loading="lazy">';
    if (b.imgs)        return '<div class="detail-img-row">' + b.imgs.map(function (src, i) {
                         var alt = Array.isArray(b.alt) ? (b.alt[i] || '') : (b.alt || '');
                         return '<img src="' + IMG + src + '" alt="' + esc(alt) + '" loading="lazy">';
                       }).join('') + '</div>';
    if (b.ol)          return '<ol>' + b.ol.map(function (li) { return '<li>' + li + '</li>'; }).join('') + '</ol>';
    if (b.ul)          return '<ul class="support-list">' + b.ul.map(function (li) { return '<li>' + li + '</li>'; }).join('') + '</ul>';
    return '';
  }

  function navHtml(prev, next) {
    if (!prev && !next) return '';
    var html = '<nav class="detail-nav">';
    if (prev) html += '<a href="/activity-report/' + prev + '/" class="prev">前の記事</a>';
    if (next) html += '<a href="/activity-report/' + next + '/" class="next">次の記事</a>';
    html += '</nav>';
    return html;
  }

  function header() {
    return '' +
      '<header class="site-header">' +
        '<div class="header-inner">' +
          '<a href="/" class="site-logo">' +
            '<img src="' + IMG + 'logo.svg" alt="' + SITE + '" class="site-logo-img">' +
            '<span class="site-logo-sp"><img src="' + IMG + 'sp/header-title.svg" alt="' + SITE + '"></span>' +
          '</a>' +
          '<nav class="header-nav">' +
            '<a href="https://docs.google.com/forms/d/e/1FAIpQLSf1DILhXa41wt5uwXnIUgd5tR2fM9UG1Bz9wDiELXGrGOWsBw/viewform" class="btn-svg"><img src="' + IMG + 'btn-support.svg" alt="支援する"></a>' +
            '<a href="/partnership/" class="btn-svg"><img src="' + IMG + 'btn-corporate.svg" alt="企業・法人の皆様へ"></a>' +
          '</nav>' +
          '<a href="https://docs.google.com/forms/d/e/1FAIpQLSf1DILhXa41wt5uwXnIUgd5tR2fM9UG1Bz9wDiELXGrGOWsBw/viewform" class="btn btn-sm header-support-sp">支援する</a>' +
          '<button class="nav-toggle" id="navToggle" aria-label="メニューを開く"><span></span><span></span><span></span></button>' +
        '</div>' +
        '<nav class="sp-drawer" id="spDrawer">' +
          '<a href="/">TOP</a>' +
          '<a href="/activity-report/">活動報告</a>' +
          '<a href="/staff/">STAFF</a>' +
          '<a href="/#contact">CONTACT</a>' +
        '</nav>' +
      '</header>';
  }

  function footer() {
    /* SP用（PCでは非表示）＋ PC共通フッター */
    return '<footer class="site-footer sp-only"><p>© 2026 ' + SITE + ' All rights reserved.</p></footer>' +
      '<footer class="footer-pc pc-only">' +
        '<div class="footer-inner">' +
          '<div class="footer-org">' +
            '<p class="footer-org-name">' + SITE + '</p>' +
            '<address class="footer-address">' +
              '〒452-0943<br>' +
              '愛知県清須市新清洲2-9-13<br>' +
              '千成ソミュール清洲501号室<br>' +
              'Tel : 052-401-5159<br>' +
              'Fax : 052-401-5159<br>' +
              'Mail : <a href="mailto:ikedamc@saturn.dti.ne.jp">ikedamc@saturn.dti.ne.jp</a>' +
            '</address>' +
          '</div>' +
          '<ul class="footer-nav">' +
            '<li><a href="/">TOP</a></li>' +
            '<li><a href="' + FORM + '">支援する</a></li>' +
            '<li><a href="/partnership/">企業・法人の皆様へ</a></li>' +
            '<li><a href="/activity-report/">活動報告</a></li>' +
            '<li><a href="/#sponsor">スポンサー</a></li>' +
          '</ul>' +
          '<ul class="footer-nav">' +
            '<li><a href="/#donate">支援金募集要項</a></li>' +
            '<li><a href="/staff/">STAFF</a></li>' +
            '<li><a href="/lecture/">講演会のご案内</a></li>' +
            '<li><a href="/partnership/#disclosure">情報公開</a></li>' +
            '<li><a href="#">お問い合わせ</a></li>' +
          '</ul>' +
        '</div>' +
        '<p class="footer-copy">© 2026 ' + SITE + ' All rights reserved.</p>' +
      '</footer>';
  }

  function initDrawer() {
    var toggle = document.getElementById('navToggle');
    var drawer = document.getElementById('spDrawer');
    if (!toggle || !drawer) return;
    toggle.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    });
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        drawer.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  /* ---- ユーティリティ ---- */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  }
  function setMetaProp(prop, content) {
    var el = document.querySelector('meta[property="' + prop + '"]');
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    el.setAttribute('content', content);
  }
  function setLinkRel(rel, href) {
    var el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
    el.setAttribute('href', href);
  }
})();
