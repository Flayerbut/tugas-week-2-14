const KUNCI_STORAGE = 'kosflow_pengeluaran';
const KUNCI_PEMASUKAN = 'kosflow_pemasukan';

const NAMA_KATEGORI = {
    makanan: 'Makanan',
    transportasi: 'Transportasi',
    'kebutuhan-kos': 'Kebutuhan Kos',
    hiburan: 'Hiburan',
    lainnya: 'Lainnya'
};


// =========================
// DATA
// =========================

// Tidak ada data pengeluaran awal.
// Pengeluaran hanya muncul setelah user mengisi form.
const dataDummy = [];

let pengeluaran = muatData();
let pemasukan = muatPemasukan();


// =========================
// STORAGE PENGELUARAN
// =========================

function muatData() {

    const dataTersimpan =
        localStorage.getItem(KUNCI_STORAGE);

    if (dataTersimpan) {
        return JSON.parse(dataTersimpan);
    }

    return [...dataDummy];
}


function simpanData() {

    localStorage.setItem(
        KUNCI_STORAGE,
        JSON.stringify(pengeluaran)
    );
}


// =========================
// STORAGE PEMASUKAN
// =========================

function muatPemasukan() {

    const dataTersimpan =
        localStorage.getItem(KUNCI_PEMASUKAN);

    if (dataTersimpan) {
        return Number(dataTersimpan);
    }

    return 0;
}


function simpanPemasukan() {

    localStorage.setItem(
        KUNCI_PEMASUKAN,
        pemasukan.toString()
    );
}


// =========================
// FORMAT RUPIAH
// =========================

function formatRupiah(angka) {

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);

}


// =========================
// NOTIFIKASI
// =========================

function tampilkanNotifikasi(pesan, tipe = 'success') {

    const notifikasi = $('#notifikasi');

    if (!notifikasi.length) {
        return;
    }

    notifikasi
        .removeClass(
            'alert-success alert-danger alert-warning alert-info'
        )
        .addClass(`alert-${tipe}`)
        .text(pesan)
        .stop(true, true)
        .fadeIn(300)
        .delay(2000)
        .fadeOut(500);

}


// =========================
// RINGKASAN KEUANGAN
// =========================

function renderRingkasan() {

    const totalPengeluaran =
        pengeluaran.reduce(
            (total, item) =>
                total + Number(item.jumlah),
            0
        );

    const sisaUang =
        pemasukan - totalPengeluaran;


    $('#total-pemasukan')
        .text(formatRupiah(pemasukan));

    $('#total-pengeluaran')
        .text(formatRupiah(totalPengeluaran));

    $('#sisa-uang')
        .text(formatRupiah(sisaUang));


    if (
        totalPengeluaran > pemasukan &&
        totalPengeluaran > 0
    ) {

        $('#peringatan-minus')
            .stop(true, true)
            .fadeIn(300);

    } else {

        $('#peringatan-minus')
            .stop(true, true)
            .fadeOut(300);

    }

}


// =========================
// TABEL PENGELUARAN
// =========================

function renderTabel() {

    const tabel =
        $('#tabel-pengeluaran');

    if (!tabel.length) {
        return;
    }


    const filterKategori =
        $('#filter-kategori').val();


    let data = [...pengeluaran];


    if (filterKategori) {

        data = data.filter(
            item =>
                item.kategori === filterKategori
        );

    }


    data.sort(
        (a, b) =>
            new Date(b.tanggal) -
            new Date(a.tanggal)
    );


    const limit =
        Number(tabel.data('limit')) ||
        data.length;


    data = data.slice(0, limit);


    tabel.empty();


    // Jika belum ada data
    if (data.length === 0) {

        tabel.append(`
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Belum ada data pengeluaran.
                </td>
            </tr>
        `);

        return;
    }


    // Jika sudah ada data
    data.forEach(item => {

        tabel.append(`
            <tr>

                <td>
                    ${item.tanggal}
                </td>

                <td>
                    ${NAMA_KATEGORI[item.kategori] || item.kategori}
                </td>

                <td>
                    ${item.keterangan}
                </td>

                <td>
                    ${formatRupiah(Number(item.jumlah))}
                </td>

                <td>
                    <a
                        href="detail.html?id=${item.id}"
                        class="btn btn-sm btn-outline-primary"
                    >
                        Detail
                    </a>
                </td>

            </tr>
        `);

    });

}


// =========================
// DETAIL PENGELUARAN
// =========================

function renderDetail() {

    const detailContainer =
        $('#detail-transaksi');

    if (!detailContainer.length) {
        return;
    }


    const parameter =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parameter.get('id');


    let data;


    if (id) {

        data = pengeluaran.find(
            item =>
                String(item.id) === String(id)
        );

    } else {

        data = [...pengeluaran]
            .sort(
                (a, b) =>
                    new Date(b.tanggal) -
                    new Date(a.tanggal)
            )[0];

    }


    if (!data) {

        $('#detail-transaksi').hide();

        $('#detail-kosong').show();

        return;
    }


    $('#detail-transaksi').show();

    $('#detail-kosong').hide();


    $('#detail-tanggal')
        .text(data.tanggal);


    $('#detail-kategori')
        .text(
            NAMA_KATEGORI[data.kategori] ||
            data.kategori
        );


    $('#detail-keterangan')
        .text(data.keterangan);


    $('#detail-jumlah')
        .text(
            formatRupiah(
                Number(data.jumlah)
            )
        );


    $('#detail-catatan')
        .text(
            data.catatan ||
            'Tidak ada catatan.'
        );


    $('#btn-hapus-detail')
        .data('id', data.id);

}


// =========================
// RENDER SEMUA
// =========================

function renderSemua() {

    renderRingkasan();

    renderTabel();

    renderDetail();

}


// =========================
// JQUERY
// =========================

$(document).ready(function () {


    // Tampilkan data saat halaman dibuka
    renderSemua();


    // =========================
    // SIMPAN PEMASUKAN
    // =========================

    $('#btn-simpan-pemasukan')
        .on('click', function () {

            const nilai =
                Number(
                    $('#input-pemasukan').val()
                );


            if (isNaN(nilai) || nilai < 0) {

                tampilkanNotifikasi(
                    'Jumlah pemasukan tidak valid.',
                    'danger'
                );

                return;
            }


            if ($('#input-pemasukan').val() === '') {

                tampilkanNotifikasi(
                    'Silakan masukkan jumlah pemasukan.',
                    'danger'
                );

                return;
            }


            pemasukan = nilai;

            simpanPemasukan();

            renderRingkasan();


            tampilkanNotifikasi(
                'Pemasukan berhasil disimpan.',
                'success'
            );

        });


    // =========================
    // RESET PEMASUKAN
    // =========================

    $('#btn-reset-pemasukan')
        .on('click', function () {

            const yakin =
                confirm(
                    'Apakah Anda yakin ingin mereset pemasukan?'
                );


            if (!yakin) {
                return;
            }


            pemasukan = 0;

            simpanPemasukan();

            $('#input-pemasukan').val('');

            renderRingkasan();


            tampilkanNotifikasi(
                'Pemasukan berhasil direset.',
                'success'
            );

        });


    // =========================
    // FILTER KATEGORI
    // =========================

    $('#filter-kategori')
        .on('change', function () {

            renderTabel();

        });


    // =========================
    // TOGGLE INFORMASI KOS
    // =========================

    $('#btn-toggle-info')
        .on('click', function () {

            $('#info-kos')
                .slideToggle(300);


            const tombol = $(this);


            if (
                tombol.text() === 'Sembunyikan'
            ) {

                tombol.text('Tampilkan');

            } else {

                tombol.text('Sembunyikan');

            }

        });


    // =========================
    // TOGGLE BUKTI TRANSAKSI
    // =========================

    $('#btn-toggle-bukti')
        .on('click', function () {

            $('#bukti-transaksi')
                .slideToggle(300);


            const tombol = $(this);


            if (
                tombol.text() === 'Sembunyikan'
            ) {

                tombol.text('Tampilkan');

            } else {

                tombol.text('Sembunyikan');

            }

        });


    // =========================
    // HAPUS DETAIL
    // =========================

    $('#btn-hapus-detail')
        .on('click', function () {

            const id =
                $(this).data('id');


            if (!id) {
                return;
            }


            const yakin =
                confirm(
                    'Apakah Anda yakin ingin menghapus pengeluaran ini?'
                );


            if (!yakin) {
                return;
            }


            pengeluaran =
                pengeluaran.filter(
                    item =>
                        String(item.id) !==
                        String(id)
                );


            simpanData();


            tampilkanNotifikasi(
                'Pengeluaran berhasil dihapus.',
                'success'
            );


            setTimeout(function () {

                window.location.href =
                    'index.html';

            }, 1000);

        });


    // =========================
    // RESET DATA PENGELUARAN
    // =========================

    $('#btn-reset-data')
        .on('click', function () {

            const yakin =
                confirm(
                    'Apakah Anda yakin ingin menghapus semua data pengeluaran?'
                );


            if (!yakin) {
                return;
            }


            pengeluaran = [];

            simpanData();

            renderSemua();


            tampilkanNotifikasi(
                'Semua data pengeluaran berhasil dihapus.',
                'success'
            );

        });


    // =========================
    // FORM TAMBAH PENGELUARAN
    // =========================

    const form =
        $('#form-pengeluaran');


    if (form.length) {


        // Isi tanggal hari ini
        const inputTanggal =
            $('#tanggal');


        if (!inputTanggal.val()) {

            const hariIni =
                new Date();


            const tahun =
                hariIni.getFullYear();


            const bulan =
                String(
                    hariIni.getMonth() + 1
                ).padStart(2, '0');


            const tanggal =
                String(
                    hariIni.getDate()
                ).padStart(2, '0');


            inputTanggal.val(
                `${tahun}-${bulan}-${tanggal}`
            );

        }


        // Submit form
        form.on('submit', function (event) {

            event.preventDefault();


            form.find('.is-invalid')
                .removeClass('is-invalid');


            const tanggal =
                $('#tanggal').val();


            const kategori =
                $('#kategori').val();


            const jumlah =
                Number(
                    $('#jumlah').val()
                );


            const keterangan =
                $('#keterangan')
                    .val()
                    .trim();


            let valid = true;


            // Validasi tanggal
            if (!tanggal) {

                $('#tanggal')
                    .addClass('is-invalid')
                    .siblings('.invalid-feedback')
                    .text(
                        'Tanggal wajib diisi.'
                    );

                valid = false;

            }


            // Validasi kategori
            if (!kategori) {

                $('#kategori')
                    .addClass('is-invalid')
                    .siblings('.invalid-feedback')
                    .text(
                        'Kategori wajib dipilih.'
                    );

                valid = false;

            }


            // Validasi jumlah
            if (!jumlah || jumlah <= 0) {

                $('#jumlah')
                    .addClass('is-invalid')
                    .siblings('.invalid-feedback')
                    .text(
                        'Jumlah pengeluaran harus lebih dari 0.'
                    );

                valid = false;

            }


            // Validasi keterangan
            if (!keterangan) {

                $('#keterangan')
                    .addClass('is-invalid')
                    .siblings('.invalid-feedback')
                    .text(
                        'Keterangan wajib diisi.'
                    );

                valid = false;

            }


            if (!valid) {
                return;
            }


            // Buat ID
            const idBaru =
                Date.now().toString();


            // Buat data baru
            const dataBaru = {

                id: idBaru,

                tanggal: tanggal,

                kategori: kategori,

                keterangan: keterangan,

                jumlah: jumlah,

                catatan: keterangan

            };


            // Tambahkan data
            pengeluaran.push(dataBaru);


            // Simpan
            simpanData();


            // Notifikasi
            tampilkanNotifikasi(
                'Pengeluaran berhasil disimpan.',
                'success'
            );


            // Reset form
            form[0].reset();


            // Isi tanggal kembali
            const hariIni =
                new Date();


            const tahun =
                hariIni.getFullYear();


            const bulan =
                String(
                    hariIni.getMonth() + 1
                ).padStart(2, '0');


            const tanggalHariIni =
                String(
                    hariIni.getDate()
                ).padStart(2, '0');


            $('#tanggal').val(
                `${tahun}-${bulan}-${tanggalHariIni}`
            );

        });

    }

});