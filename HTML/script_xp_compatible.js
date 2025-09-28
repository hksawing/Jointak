// Windows XP Chrome 49 兼容版本
// 將現代JavaScript語法改為ES5兼容語法

// 預設備註內容
var defaultRemarks = "齊,\n\n你好，\n\n請幫忙安排G105524 SPFW-AW21-DT08做稿，謝謝。\n\n完成後請上傳到以下位置:\n\\\\10.1.1.78\\artwork\\New Hang Tag\\G105000-G105999\\G105524\n\nBenny，\n\n你好，\n\n收到後請幫忙印彩稿，謝謝。\n\nHi May,\n\n你好，\n\n請幫忙安排起辦，謝謝。";

// 兼容性檢測（Windows XP Chrome 49兼容）
var isOldBrowser = !window.URL || !window.URL.createObjectURL || !window.Blob;

window.onload = function() {
    // 初始化控制
    var materialOther = document.getElementById('materialOther');
    if (materialOther) materialOther.style.display = 'none';
    hideAllProcessOptions();

    // 備註自訂控制
    var remarkCustom = document.getElementById('remark_custom');
    if (remarkCustom) {
        remarkCustom.addEventListener('change', function () {
            var textarea = document.getElementById('remarksCustom');
            textarea.style.display = this.checked ? 'block' : 'none';
        });
    }

    // 材質類型顯示切換
    var materialTypeSelect = document.getElementById('materialType');
    if (materialTypeSelect) {
        materialTypeSelect.addEventListener('change', function() {
            var mo = document.getElementById('materialOther');
            mo.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }

    // 加工選項切換 - 使用傳統for循環替代forEach
    var procIds = ['proc_laminate', 'proc_uv', 'proc_foil', 'proc_deboss', 'proc_emboss', 'proc_texture', 'proc_laminating', 'proc_folding', 'proc_cutting'];
    for (var i = 0; i < procIds.length; i++) {
        var id = procIds[i];
        var cb = document.getElementById(id);
        if (cb) {
            cb.addEventListener('change', function(e) {
                var sel = document.getElementById('opt_' + e.target.id.replace('proc_', ''));
                sel.style.display = e.target.checked ? 'inline-block' : 'none';
                if (!e.target.checked) sel.value = '';
            });
        }
    }

    // 無加工互斥控制
    var procNone = document.getElementById('proc_none');
    if(procNone) {
        procNone.addEventListener('change', function() {
            if(this.checked){
                var inputs = document.querySelectorAll('#processingGroup input[type="checkbox"]');
                for (var i = 0; i < inputs.length; i++) {
                    if(inputs[i].id !== 'proc_none') inputs[i].checked = false;
                }
                hideAllProcessOptions();
            }
        });
    }
    
    var processingInputs = document.querySelectorAll('#processingGroup input[type="checkbox"]');
    for (var i = 0; i < processingInputs.length; i++) {
        var input = processingInputs[i];
        if(input.id !== 'proc_none'){
            input.addEventListener('change', function() { 
                if(procNone) procNone.checked = false; 
            });
        }
    }

    // 無配套互斥控制
    var accNone = document.getElementById('acc_none');
    if(accNone) {
        accNone.addEventListener('change', function(){
            if(this.checked){
                var inputs = document.querySelectorAll('#accessoriesGroup input[type="checkbox"]');
                for (var i = 0; i < inputs.length; i++) {
                    if(inputs[i].id !== 'acc_none') inputs[i].checked = false;
                }
            }
        });
    }
    
    var accessoryInputs = document.querySelectorAll('#accessoriesGroup input[type="checkbox"]');
    for (var i = 0; i < accessoryInputs.length; i++) {
        var input = accessoryInputs[i];
        if(input.id !== 'acc_none'){
            input.addEventListener('change', function() { 
                if(accNone) accNone.checked = false; 
            });
        }
    }
};

// 切換頁面
function showPage(pageId) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    
    var navBtns = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < navBtns.length; i++) {
        navBtns[i].classList.remove('active');
    }
    
    document.getElementById(pageId).classList.add('active');
    document.getElementById('btn' + pageId.charAt(0).toUpperCase() + pageId.slice(1)).classList.add('active');
    window.scrollTo(0, 0);
}

// 類型選擇顯示其他欄
function toggleType() {
    var sel = document.getElementById('typeSelect');
    var other = document.getElementById('typeOther');
    other.style.display = sel.value === '其他' ? 'block' : 'none';
}

// 隱藏所有加工面向選項
function hideAllProcessOptions() {
    var options = document.querySelectorAll('.process-option');
    for (var i = 0; i < options.length; i++) {
        options[i].style.display = 'none';
        options[i].value = '';
    }
}

// 文字檔下載主函數（Windows XP Chrome 49兼容）
function downloadTextFile(content, filename) {
    try {
        var bom = '\uFEFF';
        var blob = new Blob([bom + content], {type: 'text/plain;charset=utf-8'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 100);
    } catch (e) {
        fallbackDownload(content, filename);
    }
}

// 下載失敗備援方案
function fallbackDownload(content, filename) {
    try {
        var blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        if(window.navigator.msSaveBlob) { // IE/Edge
            window.navigator.msSaveBlob(blob, filename);
        } else {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function() { URL.revokeObjectURL(url); }, 100);
        }
    } catch(e) {
        var win = window.open();
        win.document.write('<pre>' + content.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>');
        win.document.title = filename;
        alert('瀏覽器無法自動下載，請手動複製文本內容。');
    }
}

// 簡單表單驗證範例
function validateForm() {
    var typeSel = document.getElementById('typeSelect');
    if(!typeSel.value) {
        alert('請選擇類型');
        typeSel.focus();
        return false;
    }
    return true;
}

// 友善通知提示
function showNotification(msg, type) {
    type = type || 'info';
    var div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.background = type==='success' ? '#28a745' : type==='error' ? '#dc3545' : '#007ba7';
    div.style.color = '#fff';
    div.style.padding = '10px 20px';
    div.style.borderRadius = '5px';
    div.style.zIndex = '9999';
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.4s ease';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(function() { div.style.opacity = '1'; }, 10);
    setTimeout(function() {
        div.style.opacity = '0';
        setTimeout(function() { div.remove(); }, 400);
    }, 3000);
}

// 主要匯出文字檔函數
function exportTxt() {
    if (!validateForm()) return;
    
    var content = generateTextContent();
    var filename = generateFilename();
    
    downloadTextFile(content, filename);
    showNotification('文字檔已成功匯出！', 'success');
}

// 生成文字檔內容
function generateTextContent() {
    var type = document.getElementById('typeSelect').value;
    if (type === '其他') {
        type = document.getElementById('typeOther').value || '其他';
    }
    
    var customerCode = document.getElementById('customerCode').value || '';
    var sampleNumber = document.getElementById('sampleNumber').value || '';
    var sampleName = document.getElementById('sampleName').value || '';
    var material = document.getElementById('material').value || '';
    
    var materialType = document.getElementById('materialType').value;
    if (materialType === 'other') {
        materialType = document.getElementById('materialOther').value || '';
    } else if (materialType) {
        materialType = document.getElementById('materialType').options[document.getElementById('materialType').selectedIndex].text;
    }
    
    var finishSize = getSizeString('finishSize');
    var unfoldSize = getSizeString('unfoldSize');
    var printColors = document.getElementById('printColors').value || '';
    var processing = getProcessingString();
    var accessories = getAccessoriesString();
    var quantity = document.getElementById('quantity').value || '';
    var remarks = getRemarksString();
    
    var content = '起辦單文字匯出\n' +
                  '================\n\n' +
                  '類型：' + type + '\n' +
                  '客戶編號：' + customerCode + '\n' +
                  '樣辦單號：' + sampleNumber + '\n' +
                  '樣辦名稱：' + sampleName + '\n' +
                  '材質：' + material + '\n' +
                  '材質類型：' + materialType + '\n' +
                  '完成尺寸：' + finishSize + '\n' +
                  '展開尺寸：' + unfoldSize + '\n' +
                  '印色：' + printColors + '\n' +
                  '加工：' + processing + '\n' +
                  '配套：' + accessories + '\n' +
                  '數量：' + quantity + '\n\n' +
                  '備註：\n' +
                  remarks + '\n\n' +
                  '---\n' +
                  '匯出時間：' + new Date().toLocaleString('zh-TW') + '\n' +
                  '版本：v1.00.27';
    
    return content;
}

// 取得尺寸字串
function getSizeString(prefix) {
    var length = document.getElementById(prefix + 'L').value || '';
    var width = document.getElementById(prefix + 'W').value || '';
    var height = document.getElementById(prefix + 'H').value || '';
    var unit = document.getElementById(prefix + 'Unit').value || 'MM';
    
    if (!length && !width && !height) return '';
    
    // 如果高度為空，只顯示長×寬
    if (!height) {
        return length + ' × ' + width + ' ' + unit;
    }
    
    return length + ' × ' + width + ' × ' + height + ' ' + unit;
}

// 取得加工字串
function getProcessingString() {
    var processing = [];
    
    // 檢查所有加工選項
    var checkboxes = document.querySelectorAll('#processingGroup input[type="checkbox"]:checked');
    for (var i = 0; i < checkboxes.length; i++) {
        var cb = checkboxes[i];
        if (cb.id === 'proc_none') {
            processing.push('無加工');
        } else {
            var value = cb.value;
            var optionId = 'opt_' + cb.id.replace('proc_', '');
            var option = document.getElementById(optionId);
            if (option && option.value) {
                value += ' (' + option.value + ')';
            }
            processing.push(value);
        }
    }
    
    // 檢查其他加工
    var other = document.getElementById('processingOther').value;
    if (other) processing.push(other);
    
    return processing.length > 0 ? processing.join(', ') : '無';
}

// 取得配套字串
function getAccessoriesString() {
    var accessories = [];
    
    var checkboxes = document.querySelectorAll('#accessoriesGroup input[type="checkbox"]:checked');
    for (var i = 0; i < checkboxes.length; i++) {
        accessories.push(checkboxes[i].value);
    }
    
    // 檢查其他配套
    var other = document.getElementById('accessoriesOther').value;
    if (other) accessories.push(other);
    
    return accessories.length > 0 ? accessories.join(', ') : '無';
}

// 取得備註字串
function getRemarksString() {
    var remarks = '';
    
    if (document.getElementById('remark_default').checked) {
        remarks = defaultRemarks;
    }
    
    if (document.getElementById('remark_custom').checked) {
        var custom = document.getElementById('remarksCustom').value;
        if (custom) {
            remarks += (remarks ? '\n\n' : '') + custom;
        }
    }
    
    return remarks || '無';
}

// 生成檔案名稱
function generateFilename() {
    var sampleNumber = document.getElementById('sampleNumber').value || '起辦單';
    var customerCode = document.getElementById('customerCode').value || '';
    var date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    var filename = sampleNumber;
    if (customerCode) filename += '_' + customerCode;
    filename += '_' + date + '.txt';
    
    return filename;
}

// 建立新電郵函數（Windows XP Chrome 49兼容）
function sendMail() {
    if (!validateForm()) return;
    
    var content = generateTextContent();
    var subject = '起辦單 - ' + (document.getElementById('sampleNumber').value || '新起辦單');
    
    // 使用 mailto 協議
    var mailtoLink = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(content);
    
    try {
        window.location.href = mailtoLink;
        showNotification('正在開啟電郵程式...', 'info');
    } catch (e) {
        // 備援方案：複製到剪貼簿（使用傳統方法）
        fallbackCopyToClipboard(content);
    }
}

// 備援複製到剪貼簿（Windows XP Chrome 49兼容）
function fallbackCopyToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('內容已複製到剪貼簿，請手動貼到電郵中', 'success');
    } catch (err) {
        showNotification('無法複製到剪貼簿，請手動複製內容', 'error');
    }
    
    document.body.removeChild(textArea);
}

// 重置表單函數
function resetForm() {
    if (confirm('確定要清除所有內容嗎？')) {
        // 重置所有輸入欄位
        var inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].value = '';
        }
        
        // 重置選擇框
        var selects = document.querySelectorAll('select');
        for (var i = 0; i < selects.length; i++) {
            selects[i].selectedIndex = 0;
        }
        
        // 重置核取方塊
        var checkboxes = document.querySelectorAll('input[type="checkbox"]');
        for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = false;
        }
        
        // 隱藏動態顯示的欄位
        document.getElementById('typeOther').style.display = 'none';
        document.getElementById('materialOther').style.display = 'none';
        document.getElementById('remarksCustom').style.display = 'none';
        
        // 隱藏所有加工選項
        hideAllProcessOptions();
        
        // 重置數量為預設值
        document.getElementById('quantity').value = '60';
        
        showNotification('表單已重置', 'success');
    }
}
