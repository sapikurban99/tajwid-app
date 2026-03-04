function doGet(e) {
    // Hardcoded target spreadsheet ID
    var SPREADSHEET_ID = '1oPLegEoCITQJzRmEPVjJtSwjHMcTIEhUhbUtgVjiV1s';

    // Default sheet kalau tidak ada parameter
    var targetSheet = 'MateriTajwid';

    // Kalau request ada parameter ?sheet=MateriSafinatun, kita ganti baca ke sheet-nya
    // Supported sheets: MateriTajwid, MateriSafinatun, MateriKhuluq
    if (e.parameter && e.parameter.sheet) {
        targetSheet = e.parameter.sheet;
    }

    try {
        var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        var sheet = spreadsheet.getSheetByName(targetSheet);

        // Kalau sheet dengan nama default ngga ada, coba cari dengan nama "Materi"
        if (!sheet && targetSheet === 'MateriTajwid') {
            sheet = spreadsheet.getSheetByName('Materi');
        }

        if (!sheet) {
            return ContentService.createTextOutput(JSON.stringify({
                error: "Sheet dengan nama " + targetSheet + " tidak ditemukan dalam Spreadsheet Anda."
            })).setMimeType(ContentService.MimeType.JSON);
        }

        var data = sheet.getDataRange().getValues();
        if (data.length === 0) {
            return ContentService.createTextOutput(JSON.stringify({
                data: []
            })).setMimeType(ContentService.MimeType.JSON);
        }

        var headers = data[0];
        var result = [];

        for (var i = 1; i < data.length; i++) {
            var row = data[i];
            var obj = {};

            // Skip empty rows (assuming category or id is empty)
            if (!row[0] && !row[1]) continue;

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = row[j];
            }
            result.push(obj);
        }

        return ContentService.createTextOutput(JSON.stringify({
            data: result
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Menangkap error jika spreadsheet tidak bisa diakses (misal ID salah atau belum dikasih permission)
        return ContentService.createTextOutput(JSON.stringify({
            error: "Terjadi kesalahan: " + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}
