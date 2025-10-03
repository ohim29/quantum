/**
 * Fix: switch from consent (checkboxes) to crypto payment in the SAME modal.
 * Drop this file AFTER all your scripts, just before </body>.
 */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const byId = id => document.getElementById(id);

  // Helpers
  function show(el){ if(el) el.style.display = ''; }
  function hide(el){ if(el) el.style.display = 'none'; }

  function showConsent(){
    const wrap = byId('registerConsent');
    const content = byId('consentContent') || (wrap && $('.consent-content', wrap));
    const crypto = byId('cryptoStep') || (wrap && $('#cryptoStep', wrap));
    if(wrap) show(wrap);
    if(content) show(content);
    if(crypto) hide(crypto);
  }
  function showCrypto(){
    const wrap = byId('registerConsent');
    const content = byId('consentContent') || (wrap && $('.consent-content', wrap));
    const crypto = byId('cryptoStep') || (wrap && $('#cryptoStep', wrap));
    if(!wrap || !crypto){ console.warn('[fix] cryptoStep/registerConsent not found'); return; }
    if(content) hide(content);
    show(crypto);
    // init defaults (net + QR)
    try {
      const setNet = (net) => {
        const netLabel = byId('netLabel_step');
        const addrText = byId('addrText_step');
        const ADDRS = { TRC20:'TVDEMOUSDTTRC20ADDR9jH8aA1ZPpQkQX7', BSC:'0xB5cEDeMoUSDTbScAddressF5A2553aA9FfE6' };
        if(netLabel) netLabel.textContent = net;
        if(addrText) addrText.textContent = ADDRS[net];
      };
      setNet('TRC20');
    } catch(e){ /* noop */ }
  }

  // Make sure "ВХОД" opens REGISTER + consent
  const loginBtn = byId('togglePricesBtn');
  if(loginBtn){
    loginBtn.addEventListener('click', function(){
      // switch to register mode if a setter exists
      try{
        const container = $('#loginModal [data-mode]') || $('[data-mode]');
        if(container) container.setAttribute('data-mode','register');
      }catch(e){}
      showConsent();
    }, { capture:true }); // capture to run even if other handlers exist
  }

  // Ensure "Зарегистрироваться" tab shows consent
  const tabRegister = byId('tabRegister');
  if(tabRegister){
    tabRegister.addEventListener('click', function(){
      showConsent();
    }, { capture:true });
  }
  const tabLogin = byId('tabLogin');
  if(tabLogin){
    tabLogin.addEventListener('click', function(){
      const wrap = byId('registerConsent'); if(wrap) hide(wrap);
    }, { capture:true });
  }

  // Continue button -> show crypto inside same modal
  function bindContinue(){
    const btn = byId('consentContinue');
    if(!btn) return false;
    btn.type = 'button'; // prevent form submit
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      // allow only if all three ticks on
      const tick = byId('subPopupTick') || $('#registerConsent input[type="checkbox"]');
      const age  = byId('subPopupAge') || $('#registerConsent input[type="checkbox"][name*="age"], #registerConsent input[type="checkbox"][data-age]');
      const jur  = byId('subPopupJur') || $('#registerConsent input[type="checkbox"][name*="jur"], #registerConsent input[type="checkbox"][data-jur]');
      const ok = (!!tick && tick.checked) && (!!age && age.checked) && (!!jur && jur.checked);
      if(!ok){ return; }
      showCrypto();
    }, { capture:true });
    return true;
  }

  // Payment close -> back to consent
  function bindCrypto(){
    const closeBtn = byId('cryptoStepClose');
    const paidBtn  = byId('btnMarkPaid_step');
    if(closeBtn){
      closeBtn.addEventListener('click', function(){ showConsent(); }, { capture:true });
    }
    if(paidBtn){
      paidBtn.addEventListener('click', function(){
        const tx = byId('txId_step');
        if(!tx || !tx.value.trim()){ alert('Укажите TxID'); return; }
        // go to LOGIN
        const container = $('#loginModal [data-mode]') || $('[data-mode]');
        if(container) container.setAttribute('data-mode','login');
        const tab = byId('tabLogin'); if(tab) tab.click();
      }, { capture:true });
    }
  }

  // Try bind now and also after DOM changes
  function tryBindAll(){
    bindContinue();
    bindCrypto();
  }
  document.addEventListener('DOMContentLoaded', tryBindAll);
  setTimeout(tryBindAll, 0);
  const mo = new MutationObserver(tryBindAll);
  mo.observe(document.documentElement, { childList:true, subtree:true });
})();