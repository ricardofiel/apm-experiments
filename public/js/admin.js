/* public/js/admin.js — admin console */
(function ($) {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* State                                                                */
  /* ------------------------------------------------------------------ */
  let artists = [];
  let activeArtist = null;   // artist being edited in modals
  let editingArtistHandle = null; // non-null when editing (vs creating)
  let pendingDeleteHandle = null;

  /* ------------------------------------------------------------------ */
  /* Bootstrap modals                                                     */
  /* ------------------------------------------------------------------ */
  const artistModal = new bootstrap.Modal('#artist-modal');
  const linksModal  = new bootstrap.Modal('#links-modal');
  const deleteModal = new bootstrap.Modal('#delete-modal');

  /* ------------------------------------------------------------------ */
  /* Utility                                                              */
  /* ------------------------------------------------------------------ */
  function escapeHtml(str) {
    return $('<span>').text(String(str || '')).html();
  }

  function showArtistFormError(msg) {
    $('#artist-form-error').text(msg).removeClass('d-none');
  }
  function clearArtistFormError() {
    $('#artist-form-error').addClass('d-none').text('');
  }

  function showLinkFormError(msg) {
    $('#link-form-error').text(msg).removeClass('d-none');
  }
  function clearLinkFormError() {
    $('#link-form-error').addClass('d-none').text('');
  }

  /* ------------------------------------------------------------------ */
  /* Load & render artists                                                */
  /* ------------------------------------------------------------------ */
  function loadArtists() {
    $('#artists-loading').removeClass('d-none');
    $('#artists-list, #artists-empty').addClass('d-none');

    $.get('/api/artists').done(function (data) {
      artists = data;
      renderArtists();
    }).fail(function () {
      $('#artists-loading').text('Failed to load artists.');
    });
  }

  function renderArtists() {
    $('#artists-loading').addClass('d-none');
    if (!artists.length) {
      $('#artists-empty').removeClass('d-none');
      return;
    }
    $('#artists-list').empty().removeClass('d-none');
    artists.forEach(function (a) {
      const card = $(`
        <div class="col-12 col-md-6 col-lg-4">
          <div class="artist-card h-100">
            <div class="d-flex align-items-center gap-2 mb-2">
              ${a.avatarUrl ? `<img src="${escapeHtml(a.avatarUrl)}" alt="" class="rounded-circle" style="width:36px;height:36px;object-fit:cover"/>` : ''}
              <div>
                <div class="fw-semibold">${escapeHtml(a.displayName)}</div>
                <div class="text-secondary small">@${escapeHtml(a.handle)}</div>
              </div>
            </div>
            ${a.bio ? `<p class="small text-secondary mb-2" style="overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${escapeHtml(a.bio)}</p>` : ''}
            <div class="d-flex gap-2 mt-auto pt-2">
              <a href="/${escapeHtml(a.handle)}" target="_blank" class="btn btn-sm btn-outline-secondary flex-fill">View</a>
              <button class="btn btn-sm btn-outline-secondary flex-fill btn-edit-artist" data-handle="${escapeHtml(a.handle)}">Edit</button>
              <button class="btn btn-sm btn-outline-secondary flex-fill btn-manage-links" data-handle="${escapeHtml(a.handle)}">Links</button>
              <button class="btn btn-sm btn-outline-danger btn-delete-artist" data-handle="${escapeHtml(a.handle)}" title="Delete">✕</button>
            </div>
          </div>
        </div>
      `);
      $('#artists-list').append(card);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Artist modal — create / edit                                         */
  /* ------------------------------------------------------------------ */
  $('#btn-new-artist').on('click', function () {
    editingArtistHandle = null;
    $('#artist-modal-label').text('New Artist');
    $('#artist-form')[0].reset();
    $('#af-handle').prop('disabled', false);
    clearArtistFormError();
    artistModal.show();
  });

  $(document).on('click', '.btn-edit-artist', function () {
    const handle = $(this).data('handle');
    const artist = artists.find(function (a) { return a.handle === handle; });
    if (!artist) return;
    editingArtistHandle = handle;
    $('#artist-modal-label').text('Edit Artist');
    $('#af-handle').val(artist.handle).prop('disabled', false);
    $('#af-displayName').val(artist.displayName);
    $('#af-bio').val(artist.bio || '');
    $('#af-avatarUrl').val(artist.avatarUrl || '');
    clearArtistFormError();
    artistModal.show();
  });

  $('#artist-form-submit').on('click', function () {
    clearArtistFormError();
    const payload = {
      handle:      $.trim($('#af-handle').val()),
      displayName: $.trim($('#af-displayName').val()),
      bio:         $.trim($('#af-bio').val()) || null,
      avatarUrl:   $.trim($('#af-avatarUrl').val()) || null,
    };

    const method = editingArtistHandle ? 'PATCH' : 'POST';
    const url    = editingArtistHandle ? '/api/artists/' + editingArtistHandle : '/api/artists';

    $.ajax({ method, url, contentType: 'application/json', data: JSON.stringify(payload) })
      .done(function () {
        artistModal.hide();
        loadArtists();
      })
      .fail(function (xhr) {
        const msg = (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) || 'Request failed.';
        showArtistFormError(msg);
      });
  });

  /* ------------------------------------------------------------------ */
  /* Delete artist                                                        */
  /* ------------------------------------------------------------------ */
  $(document).on('click', '.btn-delete-artist', function () {
    pendingDeleteHandle = $(this).data('handle');
    $('#delete-modal-body').text('Delete artist @' + pendingDeleteHandle + ' and all their links? This cannot be undone.');
    deleteModal.show();
  });

  $('#delete-confirm-btn').on('click', function () {
    if (!pendingDeleteHandle) return;
    $.ajax({ method: 'DELETE', url: '/api/artists/' + pendingDeleteHandle })
      .done(function () {
        deleteModal.hide();
        pendingDeleteHandle = null;
        loadArtists();
      })
      .fail(function (xhr) {
        deleteModal.hide();
        alert('Delete failed: ' + ((xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) || 'Unknown error'));
      });
  });

  /* ------------------------------------------------------------------ */
  /* Links modal                                                          */
  /* ------------------------------------------------------------------ */
  $(document).on('click', '.btn-manage-links', function () {
    const handle = $(this).data('handle');
    activeArtist = artists.find(function (a) { return a.handle === handle; });
    if (!activeArtist) return;
    $('#links-modal-label').text('Links — @' + activeArtist.handle);
    $('#link-form')[0].reset();
    clearLinkFormError();
    loadLinks();
    linksModal.show();
  });

  function loadLinks() {
    $('#links-list-admin').html('<p class="text-secondary small">Loading…</p>');
    $.get('/api/artists/' + activeArtist.handle + '/links').done(function (links) {
      renderLinks(links);
    }).fail(function () {
      $('#links-list-admin').html('<p class="text-danger small">Failed to load links.</p>');
    });
  }

  function renderLinks(links) {
    if (!links.length) {
      $('#links-list-admin').html('<p class="text-secondary small">No links yet.</p>');
      return;
    }
    const rows = links.map(function (l) {
      return `
        <div class="link-row" data-id="${l.id}">
          <span class="drag-handle">⠿</span>
          <span class="link-label">${escapeHtml(l.label)}</span>
          <span class="link-url">${escapeHtml(l.url)}</span>
          <button class="btn btn-sm btn-outline-danger ms-auto btn-delete-link" data-id="${l.id}" style="padding:0.15rem 0.45rem;font-size:.75rem">✕</button>
        </div>
      `;
    });
    $('#links-list-admin').html(rows.join(''));
  }

  /* Add link */
  $('#link-form').on('submit', function (e) {
    e.preventDefault();
    clearLinkFormError();
    const payload = {
      label: $.trim($('#lf-label').val()),
      url:   $.trim($('#lf-url').val()),
      icon:  $.trim($('#lf-icon').val()) || null,
    };
    $.ajax({
      method: 'POST',
      url: '/api/artists/' + activeArtist.handle + '/links',
      contentType: 'application/json',
      data: JSON.stringify(payload),
    }).done(function () {
      $('#link-form')[0].reset();
      loadLinks();
    }).fail(function (xhr) {
      const msg = (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) || 'Request failed.';
      showLinkFormError(msg);
    });
  });

  /* Delete link */
  $(document).on('click', '.btn-delete-link', function () {
    const id = $(this).data('id');
    if (!confirm('Delete this link?')) return;
    $.ajax({ method: 'DELETE', url: '/api/links/' + id })
      .done(loadLinks)
      .fail(function () { alert('Delete failed.'); });
  });

  /* Drag-to-reorder (simple HTML5 drag) */
  let dragSrcId = null;

  $(document).on('dragstart', '.link-row', function (e) {
    dragSrcId = $(this).data('id');
    e.originalEvent.dataTransfer.effectAllowed = 'move';
  });

  $(document).on('dragover', '.link-row', function (e) {
    e.preventDefault();
    e.originalEvent.dataTransfer.dropEffect = 'move';
  });

  $(document).on('drop', '.link-row', function (e) {
    e.preventDefault();
    const targetId = $(this).data('id');
    if (dragSrcId === targetId) return;

    const order = [];
    $('#links-list-admin .link-row').each(function () { order.push($(this).data('id')); });

    const srcIdx = order.indexOf(dragSrcId);
    const tgtIdx = order.indexOf(targetId);
    order.splice(srcIdx, 1);
    order.splice(tgtIdx, 0, dragSrcId);

    $.ajax({
      method: 'POST',
      url: '/api/artists/' + activeArtist.handle + '/links/reorder',
      contentType: 'application/json',
      data: JSON.stringify({ order }),
    }).done(renderLinks).fail(function () { loadLinks(); });
  });

  // Make rows draggable
  $(document).on('mouseenter', '.link-row', function () {
    $(this).attr('draggable', 'true');
  });

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */
  loadArtists();

}(jQuery));
