/* public/js/artist.js — public landing page */
(function ($) {
  'use strict';

  const handle = location.pathname.replace(/^\//, '').split('/')[0];

  function renderLinks(links) {
    if (!links.length) {
      $('#links-list').html('<p class="text-secondary small">No links yet.</p>');
      return;
    }
    const items = links.map(function (l) {
      const iconHtml = l.icon ? `<span class="link-icon me-1">${escapeHtml(l.icon)}</span>` : '';
      return `<a class="link-card" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${iconHtml}${escapeHtml(l.label)}</a>`;
    });
    $('#links-list').html(items.join(''));
  }

  function escapeHtml(str) {
    return $('<span>').text(String(str)).html();
  }

  function show(id) {
    ['#loading', '#profile', '#not-found'].forEach(function (sel) {
      $(sel).addClass('d-none');
    });
    $(id).removeClass('d-none');
  }

  $.when(
    $.get('/api/artists/' + handle).then(null, function (xhr) { return xhr; }),
    $.get('/api/artists/' + handle + '/links').then(null, function (xhr) { return xhr; })
  ).done(function (artistRes, linksRes) {
    // $.when passes [data, status, xhr] per call
    const artist = Array.isArray(artistRes) ? artistRes[0] : artistRes;
    const links  = Array.isArray(linksRes)  ? linksRes[0]  : linksRes;

    // If artist fetch failed (status object)
    if (artist && artist.status >= 400) { show('#not-found'); return; }

    document.title = artist.displayName + ' — Musician Linktree';
    $('#display-name').text(artist.displayName);
    if (artist.bio) $('#bio').text(artist.bio);
    if (artist.avatarUrl) {
      $('#avatar').attr('src', artist.avatarUrl).attr('alt', artist.displayName + ' avatar').removeClass('d-none');
    }
    renderLinks(Array.isArray(links) ? links : []);
    show('#profile');
  }).fail(function () {
    show('#not-found');
  });

}(jQuery));
