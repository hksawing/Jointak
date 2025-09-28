// 預設備註內容
var defaultRemarks = "齊,\n\n你好，\n\n請幫忙安排G105524 SPFW-AW21-DT08做稿，謝謝。\n\n完成後請上傳到以下位置:\n\\\\10.1.1.78\\artwork\\New Hang Tag\\G105000-G105999\\G105524\n\nBenny，\n\n你好，\n\n收到後請幫忙印彩稿，謝謝。\n\nHi May,\n\n你好，\n\n請幫忙安排起辦，謝謝。";

// 兼容性檢測（包含macOS Chrome兼容）
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

    // 加工選項切換
    var procIds = ['proc_laminate', 'proc_uv', 'proc_foil', 'proc_deboss', 'proc_emboss', 'proc_texture', 'proc_laminating', 'proc_folding', 'proc_cutting'];
    procIds.forEach(function(id) {
        var cb = document.getElementById(id);
        if (cb) {
            cb.addEventListener('change', function(e) {
                var sel = document.getElementById('opt_' + id.replace('proc_', ''));
                sel.style.display = e.target.checked ? 'inline-block' : 'none';
                if (!e.target.checked) sel.value = '';
            });
        }
    });


    // 無加工互斥控制
    var procNone = document.getElementById('proc_none');
    if(procNone) {
        procNone.addEventListener('change', function() {
            if(this.checked){
                var inputs = document.querySelectorAll('#processingGroup input[type="checkbox"]');
                inputs.forEach(input => { if(input.id !== 'proc_none') input.checked = false; });
                hideAllProcessOptions();
            }
        });
    }
    var processingInputs = document.querySelectorAll('#processingGroup input[type="checkbox"]');
    processingInputs.forEach(input => {
        if(input.id !== 'proc_none'){
            input.addEventListener('change', () => { if(procNone) procNone.checked = false });
        }
    });

    // 無配套互斥控制
    var accNone = document.getElementById('acc_none');
    if(accNone) {
        accNone.addEventListener('change', function(){
            if(this.checked){
                var inputs = document.querySelectorAll('#accessoriesGroup input[type="checkbox"]');
                inputs.forEach(input => { if(input.id !== 'acc_none') input.checked = false; });
            }
        });
    }
    var accessoryInputs = document.querySelectorAll('#accessoriesGroup input[type="checkbox"]');
    accessoryInputs.forEach(input => {
        if(input.id !== 'acc_none'){
            input.addEventListener('change', () => { if(accNone) accNone.checked = false });
        }
    });
};

// 切換頁面
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById('btn' + pageId.charAt(0).toUpperCase() + pageId.slice(1)).classList.add('active');
    window.scrollTo(0, 0);
}

// 類型選擇顯示其他欄
function toggleType() {
    var sel = document.getElementById('typeSelect'),
        other = document.getElementById('typeOther');
    other.style.display = sel.value === '其他' ? 'block' : 'none';
}

// 紙張自定義尺寸顯示控制
function togglePaperCustom() {
    var sel = document.getElementById('paperType'),
        customSize = document.getElementById('paperCustomSize'),
        customUnit = document.getElementById('paperCustomUnit'),
        show = sel.value === '特度';
    customSize.style.display = show ? 'inline-block' : 'none';
    customUnit.style.display = show ? 'inline-block' : 'none';
}

// 隱藏所有加工面向選項
function hideAllProcessOptions() {
    document.querySelectorAll('.process-option').forEach(sel => {
        sel.style.display = 'none';
        sel.value = '';
    });
}

// 自動調整材質輸入框寬度
function autoResizeMaterialInput(input) {
    let len = Math.min(Math.max(input.value.length || 10,10),40);
    input.style.width = len + "ch";
}

// 計算單一材質成本
function calculateMaterialCost(input) {
    let group = input.closest('.material-group'),
        costDisplay = group.querySelector('.cost-display'),
        price = parseFloat(input.value) || 0,
        paperOpen = parseFloat(document.getElementById('paperOpen').value) || 1,
        paperArrange = parseFloat(document.getElementById('paperArrange').value) || 1,
        cost = (price / paperOpen / paperArrange * 1.3).toFixed(4);
    costDisplay.textContent = `成品材質成本：HK$${cost}`;
    calculateAllQuoteTotals();
}

// 計算所有材質成本
function calculateAllMaterialCosts() {
    document.querySelectorAll('.material-group .material-input').forEach(input => {
        if(input.value) calculateMaterialCost(input);
    });
    calculateAllQuoteTotals();
}

// 新增材質組
function addMaterialGroup() {
    let container = document.getElementById('materialGroups'),
        div = document.createElement('div');
    div.className = 'material-group';
    div.innerHTML = `
    <div class="material-item">
        <span>材質：</span>
        <input type="text" class="material-name-input" maxlength="40" placeholder="材質名稱" oninput="autoResizeMaterialInput(this)" />
        <button type="button" onclick="removeMaterialGroup(this)" class="btn" style="padding:4px 8px; font-size:12px;">移除</button>
    </div>
    <div class="material-price-row">
        <span>單價：HK$</span>
        <input type="number" class="material-input" step="0.01" min="0" placeholder="單價" oninput="calculateMaterialCost(this)" style="width:80px;" />
    </div>
    <div class="material-cost-row">
        <span class="cost-display">成品材質成本：HK$0.00</span>
    </div>`;
    container.appendChild(div);
}

// 移除材質組
function removeMaterialGroup(btn) {
    btn.closest('.material-group').remove();
}

// 計算生產工序成本（不含模板費用）
function calculateProductionCost() {
    let total = 0;
    document.querySelectorAll('#productionGroup .production-item').forEach(item => {
        let cb = item.querySelector('input[type="checkbox"]'),
            price = item.querySelector('.production-price').value;
        if(cb.checked) total += parseFloat(price) || 0;
    });
    return total;
}

// 計算模板費用成本
function calculateTemplateCost() {
    let total = 0;
    document.querySelectorAll('#templateGroup .template-item').forEach(item => {
        let cb = item.querySelector('input[type="checkbox"]'),
            price = item.querySelector('.template-price').value;
        if(cb.checked) total += parseFloat(price) || 0;
    });
    return total;
}

// 取得第一筆材質成品成本
function getFirstMaterialCost() {
    let group = document.querySelector('.material-group');
    if(group) {
        let costText = group.querySelector('.cost-display').textContent;
        let m = costText.match(/HK\$([\d\.]+)/);
        return m ? parseFloat(m[1]) : 0;
    }
    return 0;
}

// 計算單組報價數量的價格、小計、模板費用及總價（含損耗率）
function calculateQuoteTotals(el) {
    let group = el.closest('.quantity-group'),
        qtyInput = group.querySelector('.quantity-input'),
        lossInput = group.querySelector('.loss-rate-input'),
        profitInput = group.querySelector('.profit-rate'),
        unitPriceInput = group.querySelector('.unit-price-input'),
        subtotalDisplay = group.querySelector('.subtotal-display'),
        templateCostDisplay = group.querySelector('.template-cost-display'),
        totalDisplay = group.querySelector('.total-display'),
        qty = parseFloat(qtyInput.value) || 0,
        lossRate = parseFloat(lossInput.value) || 0,
        lossFactor = 1 + lossRate / 100,
        profitRate = parseFloat(profitInput.value) || 0,
        materialCost = getFirstMaterialCost(),
        productionCost = calculateProductionCost(),
        paperArrange = parseFloat(document.getElementById('paperArrange').value) || 1,
        baseUnitPrice = (materialCost + (productionCost / paperArrange)) * lossFactor,
        unitPriceWithProfit = baseUnitPrice * (1 + profitRate / 100),
        subtotal = qty * unitPriceWithProfit,
        templateCost = calculateTemplateCost(),
        total = subtotal + templateCost;

    unitPriceInput.value = unitPriceWithProfit.toFixed(4);
    subtotalDisplay.textContent = subtotal.toFixed(2);
    templateCostDisplay.textContent = templateCost.toFixed(2);
    totalDisplay.textContent = `總價：HK$${total.toFixed(2)}`;
}

// 計算所有報價組價格
function calculateAllQuoteTotals() {
    document.querySelectorAll('.quantity-group').forEach(group => {
        let qtyInput = group.querySelector('.quantity-input');
        if(qtyInput.value) calculateQuoteTotals(qtyInput);
    });
}

// 新增報價數量組
function addQuantityGroup() {
    let container = document.getElementById('quantityGroups'),
        div = document.createElement('div');
    div.className = 'quantity-group';
    div.style.border = '1px solid var(--border-color)';
    div.style.padding = '10px';
    div.style.marginBottom = '10px';
    div.style.borderRadius = '4px';
    div.innerHTML = `
    <div class="quantity-row">
      <span>數量：</span>
      <input type="number" class="quantity-input" min="1" onchange="calculateQuoteTotals(this)" />
      <span>損耗率：</span>
      <input type="number" class="loss-rate-input" min="0" step="0.01" value="3" onchange="calculateQuoteTotals(this)" />
      <span>%</span>
      <span>單價：HK$</span>
      <input type="number" class="unit-price-input" step="0.01" min="0" readonly />
      <span>小計：HK$</span>
      <span class="subtotal-display">0.00</span>
      <span>模板費：HK$</span>
      <span class="template-cost-display">0.00</span>
      <span>總價：HK$</span>
      <span class="total-display">0.00</span>
      <span>利潤率：</span>
      <input type="number" class="profit-rate" step="0.01" min="0" value="30" onchange="calculateQuoteTotals(this)" />
      <span>%</span>
      <button type="button" class="btn" onclick="removeQuantityGroup(this)" style="padding:4px 8px; font-size:12px;">移除</button>
    </div>`;
    container.appendChild(div);
}

// 移除報價數量組
function removeQuantityGroup(btn) {
    btn.closest('.quantity-group').remove();
}

// 文字檔下載主函數（包含 BOM，支援 macOS Chrome）
function downloadTextFile(content, filename) {
    try {
        const bom = '\uFEFF';
        const blob = new Blob([bom + content], {type: 'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
        fallbackDownload(content, filename);
    }
}

// 下載失敗備援方案
function fallbackDownload(content, filename) {
    try {
        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        if(window.navigator.msSaveBlob) { // IE/Edge
            window.navigator.msSaveBlob(blob, filename);
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    } catch(e) {
        const win = window.open();
        win.document.write('<pre>' + content.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>');
        win.document.title = filename;
        alert('瀏覽器無法自動下載，請手動複製文本內容。');
    }
}

// 簡單表單驗證範例
function validateForm() {
    let typeSel = document.getElementById('typeSelect');
    if(!typeSel.value) {
        alert('請選擇類型');
        typeSel.focus();
        return false;
    }
    return true;
}

// 友善通知提示
function showNotification(msg, type='info') {
    const div = document.createElement('div');
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
    setTimeout(() => div.style.opacity = '1', 10);
    setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 400);
    }, 3000);
}

// 主要匯出文字檔函數
function exportTxt() {
    if (!validateForm()) return;
    
    let content = generateTextContent();
    let filename = generateFilename();
    
    downloadTextFile(content, filename);
    showNotification('文字檔已成功匯出！', 'success');
}

// 生成文字檔內容
function generateTextContent() {
    let type = document.getElementById('typeSelect').value;
    if (type === '其他') {
        type = document.getElementById('typeOther').value || '其他';
    }
    
    let customerCode = document.getElementById('customerCode').value || '';
    let sampleNumber = document.getElementById('sampleNumber').value || '';
    let sampleName = document.getElementById('sampleName').value || '';
    let material = document.getElementById('material').value || '';
    
    let materialType = document.getElementById('materialType').value;
    if (materialType === 'other') {
        materialType = document.getElementById('materialOther').value || '';
    } else if (materialType) {
        materialType = document.getElementById('materialType').options[document.getElementById('materialType').selectedIndex].text;
    }
    
    let finishSize = getSizeString('finishSize');
    let unfoldSize = getSizeString('unfoldSize');
    let printColors = document.getElementById('printColors').value || '';
    let processing = getProcessingString();
    let accessories = getAccessoriesString();
    let quantity = document.getElementById('quantity').value || '';
    let remarks = getRemarksString();
    
    let content = `起辦單文字匯出
================

類型：${type}
客戶編號：${customerCode}
樣辦單號：${sampleNumber}
樣辦名稱：${sampleName}
材質：${material}
材質類型：${materialType}
完成尺寸：${finishSize}
展開尺寸：${unfoldSize}
印色：${printColors}
加工：${processing}
配套：${accessories}
數量：${quantity}

備註：
${remarks}

---
匯出時間：${new Date().toLocaleString('zh-TW')}
版本：v1.00.27`;

    return content;
}

// 取得尺寸字串
function getSizeString(prefix) {
    let length = document.getElementById(prefix + 'L').value || '';
    let width = document.getElementById(prefix + 'W').value || '';
    let height = document.getElementById(prefix + 'H').value || '';
    let unit = document.getElementById(prefix + 'Unit').value || 'MM';
    
    if (!length && !width && !height) return '';
    
    // 如果高度為空，只顯示長×寬
    if (!height) {
        return `${length} × ${width} ${unit}`;
    }
    
    return `${length} × ${width} × ${height} ${unit}`;
}

// 取得加工字串
function getProcessingString() {
    let processing = [];
    
    // 檢查所有加工選項
    let checkboxes = document.querySelectorAll('#processingGroup input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        if (cb.id === 'proc_none') {
            processing.push('無加工');
        } else {
            let value = cb.value;
            let optionId = 'opt_' + cb.id.replace('proc_', '');
            let option = document.getElementById(optionId);
            if (option && option.value) {
                value += ' (' + option.value + ')';
            }
            processing.push(value);
        }
    });
    
    // 檢查其他加工
    let other = document.getElementById('processingOther').value;
    if (other) processing.push(other);
    
    return processing.length > 0 ? processing.join(', ') : '無';
}

// 取得配套字串
function getAccessoriesString() {
    let accessories = [];
    
    let checkboxes = document.querySelectorAll('#accessoriesGroup input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        accessories.push(cb.value);
    });
    
    // 檢查其他配套
    let other = document.getElementById('accessoriesOther').value;
    if (other) accessories.push(other);
    
    return accessories.length > 0 ? accessories.join(', ') : '無';
}

// 取得備註字串
function getRemarksString() {
    let remarks = '';
    
    if (document.getElementById('remark_default').checked) {
        remarks = defaultRemarks;
    }
    
    if (document.getElementById('remark_custom').checked) {
        let custom = document.getElementById('remarksCustom').value;
        if (custom) {
            remarks += (remarks ? '\n\n' : '') + custom;
        }
    }
    
    return remarks || '無';
}

// 生成檔案名稱
function generateFilename() {
    let sampleNumber = document.getElementById('sampleNumber').value || '起辦單';
    let customerCode = document.getElementById('customerCode').value || '';
    let date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    let filename = `${sampleNumber}`;
    if (customerCode) filename += `_${customerCode}`;
    filename += `_${date}.txt`;
    
    return filename;
}

// 建立新電郵函數
function sendMail() {
    if (!validateForm()) return;
    
    let content = generateTextContent();
    let subject = `起辦單 - ${document.getElementById('sampleNumber').value || '新起辦單'}`;
    
    // 使用 mailto 協議
    let mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
    
    try {
        window.location.href = mailtoLink;
        showNotification('正在開啟電郵程式...', 'info');
    } catch (e) {
        // 備援方案：複製到剪貼簿
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content).then(() => {
                showNotification('內容已複製到剪貼簿，請手動貼到電郵中', 'success');
            }).catch(() => {
                fallbackCopyToClipboard(content);
            });
        } else {
            fallbackCopyToClipboard(content);
        }
    }
}

// 備援複製到剪貼簿
function fallbackCopyToClipboard(text) {
    let textArea = document.createElement('textarea');
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
        document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
            input.value = '';
        });
        
        // 重置選擇框
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // 重置核取方塊
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
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

