//2次元配列をCSV出力する
function exportCSV(records, filename) {
  let data = records.map((record) => record.join(",")).join("\r\n");
  let bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  let blob = new Blob([bom, data], { type: "text/csv" });
  let url = (window.URL || window.webkitURL).createObjectURL(blob);
  let link = document.createElement("a");
  link.download = filename + ".csv";
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function main() {
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.code === "Slash") {
      var table_id = "cf-detail-table"; //家計簿データテーブルのid
      var calc_false = "icon-ban-circle icon-large js-v-is-target"; //計算対象外のクラス名
      var calc_true = "icon-check icon-large js-v-is-target"; //計算対象のクラス名
      var transfer_false = "icon-exchange icon-large js-switch-transfer"; //振替対象外のクラス名
      var transfer_true =
        "icon-exchange onchange icon-large js-switch-transfer"; //振替対象のクラス名

      //年と月を取得する
      var get_date = document.getElementsByClassName(
        "fc-header-title in-out-header-title"
      ); //年取得用クラス名
      var year = get_date[0].innerText.substr(0, 4); //年
      var month = get_date[0].innerText.substr(5, 2); //月

      //家計簿データを取得する
      var tableelement = document.getElementById(table_id);
      var table = [];
      for (let row of tableelement.rows) {
        //テーブルの行ごとにループする
        var line = [];
        for (let cell of row.cells) {
          //テーブルの行内の各要素ごとにループする
          if (cell.getElementsByClassName(calc_true).length != 0) {
            //計算対象のとき
            line.push('"1"'); //計算対象(=1)とする
          } else if (cell.getElementsByClassName(calc_false).length != 0) {
            //計算対象外のとき
            line.push('"0"'); //計算対象外(=0)とする
          } else if (cell.getElementsByClassName(transfer_true).length != 0) {
            //振替対象のとき
            line.push('"1"'); //振替(=1)とする
          } else if (cell.getElementsByClassName(transfer_false).length != 0) {
            //振替対象外のとき
            line.push('"0"'); //振替対象外(=0)とする
          } else {
            //通常はダブルクォーテーション付きでinnerTextを追加する
            line.push('"' + cell.innerText + '"');
          }
        }
        table.push(line);
      }

      //家計簿データを整理する
      var CALC = 0; //計算対象は0列目
      var DATE = 1; //日付は1列目
      var AMOUNT = 3; //金額（円）は3列目
      var FINANCIALINSTITUTION = 4; //保有金融機関は4列目

      for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
          if (j == CALC) {
            //計算対象列に対する処理
            if (table[i][j] == '""') {
              //空文字のとき（振替のとき）
              table[i][j] = 1; //計算対象(=1)を設定する
            }
          }
          if (j == DATE) {
            //日付列に対する処理
            table[i][j] = '"' + year + "/" + table[i][j].slice(1); //年を先頭に追加する
            table[i][j] = table[i][j].replace(/\(.\)/, ""); //"(曜日)"は削除する
          }
          if (j == AMOUNT) {
            //金額（円）列に対する処理
            table[i][j] = table[i][j].replace(/\n\(.*\)/, ""); //"(振替)"は削除する
            table[i][j] = table[i][j].replace(/,/g, ""); //カンマは削除する
          }
          if (j == FINANCIALINSTITUTION) {
            //保有金融機関列に対する処理
            table[i][j] = table[i][j].replace(/\n.*/, '"'); //2行目にある金融機関は削除する（振替明細のため）
          }
        }
      }

      table.shift(); //ヘッダを削除する（不要文字等が含まれているため）
      var header = [
        "計算対象",
        "日付",
        "内容",
        "金額（円）",
        "保有金融機関",
        "大項目",
        "中項目",
        "メモ",
        "振替",
        "削除",
      ];
      table.unshift(header); //先頭に新ヘッダを追加する

      var filename = "mfme_" + year + month; //ファイル名を設定する
      exportCSV(table, filename); //CSVファイルを出力する
    }
  });
}
