// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

document.addEventListener('DOMContentLoaded', function () {
    initDataTables();
});

function initDataTables() {
    document.querySelectorAll('table.datatable').forEach(function (table, idx) {
        enhanceTable(table, idx);
    });
}

function enhanceTable(table, idx) {
    const tbody = table.tBodies[0];
    if (!tbody) return;

    const originalRows = Array.from(tbody.querySelectorAll('tr'));
    originalRows.forEach((r, i) => r.dataset._origIndex = i);

    // build container
    const container = document.createElement('div');
    container.className = 'datatable-container mb-3';

    // toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'd-flex align-items-center justify-content-between mb-2 datatable-toolbar';
    toolbar.style.display = 'none';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'd-flex gap-2 align-items-center';

    const btnEdit = createBtn('Edit', 'bi-pencil', 'btn-outline-secondary');
    const btnDelete = createBtn('Delete', 'bi-trash', 'btn-outline-danger');
    const btnView = createBtn('View', 'bi-eye', 'btn-outline-secondary');
    const btnPrint = createBtn('Print', 'bi-printer', 'btn-light');
    const btnDownload = createBtn('Download', 'bi-download', 'btn-light');

    btnEdit.disabled = true;
    btnDelete.disabled = true;
    btnView.disabled = true;

    leftGroup.appendChild(btnEdit);
    leftGroup.appendChild(btnDelete);
    leftGroup.appendChild(btnView);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'd-flex gap-2 align-items-center';

    // rows per page selector
    const sel = document.createElement('select');
    [5,10,25,50].forEach(n => {
        const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o);
    });
    sel.value = 10;
    const lbl = document.createElement('small'); lbl.className = 'text-muted me-2'; lbl.textContent = 'Rows:';
    rightGroup.appendChild(lbl);
    rightGroup.appendChild(sel);
    rightGroup.appendChild(btnPrint);
    rightGroup.appendChild(btnDownload);

    toolbar.appendChild(leftGroup);
    toolbar.appendChild(rightGroup);

    // pagination
    const pagination = document.createElement('nav');
    pagination.className = 'mt-2';

    // replace table with container
    table.parentNode.insertBefore(container, table);
    container.appendChild(toolbar);
    container.appendChild(table);
    container.appendChild(pagination);

    let currentPage = 1;
    let perPage = parseInt(sel.value, 10);
    let selectedRow = null;
    let editing = false;

    function render() {
        // clear tbody and render slice
        tbody.innerHTML = '';
        const start = (currentPage - 1) * perPage;
        const slice = originalRows.slice(start, start + perPage);
        slice.forEach(r => tbody.appendChild(r));
        renderPagination();
        attachRowHandlers();
    }

    function renderPagination() {
        const total = originalRows.length;
        const pages = Math.max(1, Math.ceil(total / perPage));
        pagination.innerHTML = '';
        const ul = document.createElement('ul'); ul.className = 'pagination pagination-sm mb-0';

        const addPageItem = (p, text, active) => {
            const li = document.createElement('li'); li.className = 'page-item' + (active ? ' active' : '');
            const a = document.createElement('a'); a.className = 'page-link'; a.href = '#'; a.textContent = text;
            a.addEventListener('click', function (e) { e.preventDefault(); if (currentPage !== p) { currentPage = p; render(); } });
            li.appendChild(a); ul.appendChild(li);
        };

        addPageItem(Math.max(1,currentPage-1), '«', false);
        for (let p=1;p<=pages;p++) addPageItem(p, p, p===currentPage);
        addPageItem(Math.min(pages,currentPage+1), '»', false);

        pagination.appendChild(ul);
    }

    function attachRowHandlers() {
        tbody.querySelectorAll('tr').forEach(tr => {
            tr.classList.remove('table-active');
            tr.addEventListener('click', function (e) {
                e.preventDefault();
                selectRow(this);
            });
        });
    }

    function selectRow(tr) {
        if (selectedRow) selectedRow.classList.remove('table-active');
        selectedRow = tr;
        selectedRow.classList.add('table-active');
        toolbar.style.display = 'flex';
        btnEdit.disabled = false; btnDelete.disabled = false; btnView.disabled = false;
    }

    function clearSelection() {
        if (selectedRow) selectedRow.classList.remove('table-active');
        selectedRow = null; toolbar.style.display = 'none';
        btnEdit.disabled = true; btnDelete.disabled = true; btnView.disabled = true; editing = false;
    }

    btnEdit.addEventListener('click', function () {
        if (!selectedRow) return;
        if (!editing) {
            // enable editing
            selectedRow.querySelectorAll('td').forEach((td, i, arr) => {
                // don't make last column editable
                if (i === arr.length -1) return;
                td.contentEditable = true; td.classList.add('editable-cell');
            });
            this.innerHTML = '<i class="bi bi-check"></i> Save';
            editing = true;
        } else {
            // save
            selectedRow.querySelectorAll('td').forEach((td, i, arr) => { if (i === arr.length -1) return; td.contentEditable = false; td.classList.remove('editable-cell'); });
            this.innerHTML = '<i class="bi bi-pencil"></i> Edit';
            editing = false;
            // optionally, send updated data to server
            console.log('Row updated', selectedRow.dataset._origIndex);
        }
    });

    btnDelete.addEventListener('click', function () {
        if (!selectedRow) return;
        const idx = parseInt(selectedRow.dataset._origIndex, 10);
        // remove from originalRows
        const pos = originalRows.findIndex(r => parseInt(r.dataset._origIndex,10) === idx);
        if (pos >= 0) originalRows.splice(pos,1);
        clearSelection();
        // adjust current page if needed
        const pages = Math.max(1, Math.ceil(originalRows.length / perPage));
        if (currentPage > pages) currentPage = pages;
        render();
    });

    btnView.addEventListener('click', function () {
        if (!selectedRow) return;
        showRowModal(selectedRow, table);
    });

    btnPrint.addEventListener('click', function () {
        printTable(table);
    });

    btnDownload.addEventListener('click', function () {
        downloadCSV(table);
    });

    sel.addEventListener('change', function () {
        perPage = parseInt(this.value,10);
        currentPage = 1; render();
    });

    // initial render
    render();
}

function createBtn(title, iconCls, styleCls) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-sm ' + styleCls;
    // icon and text wrapper so we can hide text on small screens and keep accessible title
    b.innerHTML = '<i class="bi ' + iconCls + '"></i><span class="btn-text ms-1">' + title + '</span>';
    b.setAttribute('title', title);
    return b;
}

function printTable(table) {
    const w = window.open('', '_blank');
    const html = '<html><head><title>Print</title><link rel="stylesheet" href="/lib/bootstrap/dist/css/bootstrap.min.css"></head><body>' + table.outerHTML + '</body></html>';
    w.document.open(); w.document.write(html); w.document.close();
    w.print();
}

function downloadCSV(table) {
    const rows = [];
    const headers = Array.from(table.querySelectorAll('thead th')).map(h => h.textContent.trim());
    rows.push(headers.join(','));
    table.querySelectorAll('tbody tr').forEach(tr => {
        const cols = Array.from(tr.querySelectorAll('td')).map(td => '"' + td.textContent.trim().replace(/"/g,'""') + '"');
        rows.push(cols.join(','));
    });
    const csv = rows.join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'table.csv'; a.style.display='none'; document.body.appendChild(a); a.click(); a.remove();
}

function showRowModal(tr, table) {
    // build simple modal
    const modalId = 'dtRowModal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div'); modal.id = modalId;
        modal.className = 'modal fade'; modal.tabIndex = -1; modal.innerHTML = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Row details</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"></div><div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div>';
        document.body.appendChild(modal);
    }
    const body = modal.querySelector('.modal-body'); body.innerHTML = '';
    const headers = Array.from(table.querySelectorAll('thead th'));
    Array.from(tr.querySelectorAll('td')).forEach((td, i) => {
        const row = document.createElement('div'); row.className = 'mb-2';
        const label = headers[i] ? headers[i].textContent.trim() : ('Col ' + (i+1));
        row.innerHTML = '<strong>' + label + ':</strong> ' + td.textContent.trim();
        body.appendChild(row);
    });
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}
