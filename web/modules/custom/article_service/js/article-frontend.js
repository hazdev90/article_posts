(function ($, Drupal) {
    Drupal.behaviors.articleFrontend = {
        attach: function (context, settings) {
            const loadArticles = (status) => {
                fetch('/article/100/0')
                    .then(res => res.json())
                    .then(data => {
                        const tbody = $('#articleTable tbody');
                        const actionTh = $('#articleTable thead th').eq(2); // kolom ke-3 (Action)

                        tbody.empty();

                        // Sembunyikan/tampilkan kolom "Action" (header)
                        if (status === 'trash') {
                            actionTh.hide();
                        } else {
                            actionTh.show();
                        }

                        // Render baris
                        data.filter(article => article.status === status).forEach(article => {
                            const actionTd = `
            <td style="width: 10%">
                <a href="/article/edit/${article.id}" class="btn btn-sm btn-primary">
                    <i class="fa fa-edit"></i>
                </a>
                <button class="btn btn-sm btn-danger btn-trash" data-id="${article.id}">
                    <i class="fa fa-trash"></i>
                </button>
            </td>`;

                            const row = `
            <tr>
                <td>${article.title}</td>
                <td>${article.category}</td>
                ${status !== 'trash' ? actionTd : ''}
            </tr>`;

                            tbody.append(row);
                        });

                        if (tbody.children().length === 0) {
                            tbody.append(`<tr><td colspan="3" class="text-center text-muted">No articles found.</td></tr>`);
                        }
                    });
            };

            if ($('#articleTabs', context).length && !context.loaded) {
                context.loaded = true;
                let currentStatus = 'publish';

                loadArticles(currentStatus);

                $('#articleTabs a').click(function (e) {
                    e.preventDefault();
                    $('#articleTabs a').removeClass('active');
                    $(this).addClass('active');
                    currentStatuss = $(this).data('status');
                    loadArticles(currentStatuss);
                });

                $(document).on('click', '.btn-trash', function () {
                    const id = $(this).data('id');
                    fetch(`/article/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'trash' }) // title, content, category bisa diisi data asli
                    }).then(() => {
                        $('#articleTabs a[data-status="publish"]').removeClass('active');
                        $('#articleTabs a[data-status="publish"]').addClass('active');
                        loadArticles(currentStatus);
                    });
                });
            }

            // Form submission on /article/add
            if ($('#articleAddForm', context).length && !context.addFormLoaded) {
                context.addFormLoaded = true;

                const showMessage = (type, message) => {
                    $('#formMessage')
                        .removeClass('d-none alert-success alert-danger')
                        .addClass(`alert-${type}`)
                        .html(message);
                };

                const submitForm = (status) => {
                    const data = {
                        title: $('#title').val(),
                        content: $('#content').val(),
                        category: $('#category').val(),
                        status: status,
                    };

                    fetch('/article', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    })
                        .then(res => res.json().then(data => ({ status: res.status, body: data })))
                        .then(({ status, body }) => {
                            if (status === 200) {
                                showMessage('success', 'Article submitted successfully.');
                                $('#articleAddForm')[0].reset();

                                setTimeout(function () {
                                    window.location.href = '/article/all';
                                }, 5000);
                            } else {
                                showMessage('danger', body.errors ? body.errors.join('<br>') : 'An error occurred.');
                            }
                        })
                        .catch(err => {
                            showMessage('danger', 'Request failed.');
                            console.error(err);
                        });
                };

                $('#publishBtn').click(() => submitForm('publish'));
                $('#draftBtn').click(() => submitForm('draft'));
            }

            // Edit form on /article/edit/{id}
            if ($('#articleEditForm', context).length && !context.editFormLoaded) {
                context.editFormLoaded = true;
                const id = $('#articleEditForm').data('id');

                // Load article data
                fetch(`/article/${id}`)
                    .then(res => res.json())
                    .then(data => {
                        $('#edit-title').val(data.title);
                        $('#edit-content').val(data.content);
                        $('#edit-category').val(data.category);
                    });

                const showEditMessage = (type, msg) => {
                    $('#editMessage')
                        .removeClass('d-none alert-success alert-danger')
                        .addClass(`alert-${type}`)
                        .html(msg);
                };

                const updateArticle = (status) => {
                    const payload = {
                        title: $('#edit-title').val(),
                        content: $('#edit-content').val(),
                        category: $('#edit-category').val(),
                        status: status,
                    };

                    fetch(`/article/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    })
                        .then(res => res.json().then(data => ({ status: res.status, body: data })))
                        .then(({ status, body }) => {
                            if (status === 200) {
                                showEditMessage('success', 'Article updated successfully.');
                            } else {
                                showEditMessage('danger', body.errors ? body.errors.join('<br>') : 'Update failed.');
                            }
                        })
                        .catch(err => {
                            showEditMessage('danger', 'Request failed.');
                            console.error(err);
                        });
                };

                $('#edit-publish').click(() => {
                    updateArticle('publish')
                    setTimeout(function () {
                        window.location.href = '/article/all';
                    }, 5000);
                });
                $('#edit-draft').click(() => {
                    updateArticle('draft')
                    setTimeout(function () {
                        window.location.href = '/article/all';
                    }, 5000);
                });
            }

            // Preview page logic
            if ($('#previewContainer', context).length && !context.previewLoaded) {
                context.previewLoaded = true;
                const articlesPerPage = 10;
                let currentPage = 1;
                let allArticles = [];

                const renderPage = () => {
                    const container = $('#previewContainer').empty();
                    const start = (currentPage - 1) * articlesPerPage;
                    const pageItems = allArticles.slice(start, start + articlesPerPage);

                    pageItems.forEach(article => {
                        let previewContent = article.content;
                        if (previewContent.length > 150) {
                            const truncated = previewContent.substring(0, 150);
                            const lastDot = truncated.lastIndexOf('.');
                            const lastSpace = truncated.lastIndexOf(' ');

                            previewContent = truncated.substring(0, lastSpace) + '...';
                        }

                        container.append(`
        <div class="card mb-3">
            <div class="card-body">
                <h4>${article.title}</h4>
                <div><strong>Category:</strong> ${article.category}</div>
                <p>${previewContent}</p>
            </div>
        </div>
    `);
                    });

                    const totalPages = Math.ceil(allArticles.length / articlesPerPage);
                    const pagination = $('#previewPagination').empty();

                    if (totalPages > 1) {
                        // Tombol Previous
                        const prevDisabled = currentPage === 1 ? 'disabled' : '';
                        pagination.append(`<li class="page-item ${prevDisabled}"><a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`);

                        // Tombol halaman 1, 2, 3, ...
                        for (let i = 1; i <= totalPages; i++) {
                            const active = i === currentPage ? 'active' : '';
                            pagination.append(`<li class="page-item ${active}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
                        }

                        // Tombol Next
                        const nextDisabled = currentPage === totalPages ? 'style="display: none"' : '';
                        pagination.append(`<li class="page-item" ${nextDisabled}><a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`);

                        // Event listener semua tombol
                        $('#previewPagination a').click(function (e) {
                            e.preventDefault();
                            const targetPage = parseInt($(this).data('page'));
                            if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
                                currentPage = targetPage;
                                renderPage();
                            }
                        });
                    }
                };

                fetch('/article/100/0')
                    .then(res => res.json())
                    .then(data => {
                        allArticles = data.filter(a => a.status === 'publish');
                        renderPage();
                    });
            }

        }
    };
})(jQuery, Drupal);
