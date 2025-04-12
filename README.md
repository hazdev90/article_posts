# article_posts

## Step menjalankan Drupal
1. Jalankan command composer install
2. Jalankan perintah make run untuk build dan run container
3. Cek apakah container berjalan dengan baik atau tidak, bisa tekan ctrl+c untuk menghentikan log lalu ketikkan command docker-compose ps. Jika status Up berarti container berjalan dengan lancar.
4. Untuk import database, ketikkan command make migrate. Secara otomatis database dan tabel akan ter-create
5. Jika berhasil import database, cek langsung ke browser nya buka link http://localhost:1324 dan akan muncul halaman welcome.
6. Untuk masuk ke halaman admin, bisa buka link http://localhost:1324/user/login,
    Username: admin
    Password: 12345678
7. Jika sudah masuk ke halaman Admin Drupal, lanjutkan untuk klik menu Manage > Structure > All Posts untuk melihat semua data artikel.

## Url BE (Endpoint)
- ada di folder postman/article_service_postman_collection.json, tinggal di import ke postman.
- Create Article (POST)
  http://localhost:1324/article                   || https://hazdev.smartedukasi.co.id/article
- Get Article With Pagination (GET)
  http://localhost:1324/article/{limit}/{offset}  || https://hazdev.smartedukasi.co.id/article/{limit}/{offset}
- Get Article By ID (GET)
  http://localhost:1324/article/{id}              || https://hazdev.smartedukasi.co.id/article/{id}
- Update Article (PUT)
  http://localhost:1324/article/{id}              || https://hazdev.smartedukasi.co.id/article/{id}
- Delete Article (DELETE)
  http://localhost:1324/article/{id}              || https://hazdev.smartedukasi.co.id/article/{id}


## Url FE
- http://localhost:1324/article/all       || https://hazdev.smartedukasi.co.id/article/all
- http://localhost:1324/article/add       || https://hazdev.smartedukasi.co.id/article/add
- http://localhost:1324/article/edit/{id} || https://hazdev.smartedukasi.co.id/article/edit/{id}
- http://localhost:1324/article/preview   || https://hazdev.smartedukasi.co.id/article/preview

## Url Login
- http://localhost:1324/user/login       || https://hazdev.smartedukasi.co.id/user/login
