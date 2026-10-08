document.addEventListener('DOMContentLoaded', function() {
	// NEW INFOBAR FUNCTIONS  
  let infobars = document.querySelectorAll(".infobar-component");
  
  if (infobars) {
    infobars.forEach((bar) => {
      const closeButton = bar.querySelector(".infobar-dismiss");
      
      if (bar.className.includes("general-infobar") && JSON.parse(sessionStorage.getItem("hideGeneralInfobar"))) {
        bar.classList.add("infobar-hidden");
      }
      
      if (closeButton) {
       	closeButton.addEventListener("click", () => {
          if (bar.className.includes("general-infobar")) {
            sessionStorage.setItem("hideGeneralInfobar", true);
          }
          bar.classList.add("infobar-hidden");
        }) 
      }
    })
  }
  
  // Key map
  var ENTER = 13;
  var ESCAPE = 27;
  var SPACE = 32;
  var UP = 38;
  var DOWN = 40;
  var TAB = 9;

  function closest (element, selector) {
    if (Element.prototype.closest) {
      return element.closest(selector);
    }
    do {
      if (Element.prototype.matches && element.matches(selector)
        || Element.prototype.msMatchesSelector && element.msMatchesSelector(selector)
        || Element.prototype.webkitMatchesSelector && element.webkitMatchesSelector(selector)) {
        return element;
      }
      element = element.parentElement || element.parentNode;
    } while (element !== null && element.nodeType === 1);
    return null;
  }

  // social share popups
  Array.prototype.forEach.call(document.querySelectorAll('.share a'), function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      window.open(this.href, '', 'height = 500, width = 500');
    });
  });

  // In some cases we should preserve focus after page reload
  function saveFocus() {
    var activeElementId = document.activeElement.getAttribute("id");
    sessionStorage.setItem('returnFocusTo', '#' + activeElementId);
  }
  var returnFocusTo = sessionStorage.getItem('returnFocusTo');
  if (returnFocusTo) {
    sessionStorage.removeItem('returnFocusTo');
    var returnFocusToEl = document.querySelector(returnFocusTo);
    returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
  }

  // show form controls when the textarea receives focus or backbutton is used and value exists
  var commentContainerTextarea = document.querySelector('.comment-container textarea'),
    commentContainerFormControls = document.querySelector('.comment-form-controls, .comment-ccs');

  if (commentContainerTextarea) {
    commentContainerTextarea.addEventListener('focus', function focusCommentContainerTextarea() {
      commentContainerFormControls.style.display = 'block';
      commentContainerTextarea.removeEventListener('focus', focusCommentContainerTextarea);
    });

    if (commentContainerTextarea.value !== '') {
      commentContainerFormControls.style.display = 'block';
    }
  }

  // Expand Request comment form when Add to conversation is clicked
  var showRequestCommentContainerTrigger = document.querySelector('.request-container .comment-container .comment-show-container'),
    requestCommentFields = document.querySelectorAll('.request-container .comment-container .comment-fields'),
    requestCommentSubmit = document.querySelector('.request-container .comment-container .request-submit-comment');

  if (showRequestCommentContainerTrigger) {
    showRequestCommentContainerTrigger.addEventListener('click', function() {
      showRequestCommentContainerTrigger.style.display = 'none';
      Array.prototype.forEach.call(requestCommentFields, function(e) { e.style.display = 'block'; });
      requestCommentSubmit.style.display = 'inline-block';

      if (commentContainerTextarea) {
        commentContainerTextarea.focus();
      }
    });
  }

  // Mark as solved button
  var requestMarkAsSolvedButton = document.querySelector('.request-container .mark-as-solved:not([data-disabled])'),
    requestMarkAsSolvedCheckbox = document.querySelector('.request-container .comment-container input[type=checkbox]'),
    requestCommentSubmitButton = document.querySelector('.request-container .comment-container input[type=submit]');

  if (requestMarkAsSolvedButton) {
    requestMarkAsSolvedButton.addEventListener('click', function() {
      requestMarkAsSolvedCheckbox.setAttribute('checked', true);
      requestCommentSubmitButton.disabled = true;
      this.setAttribute('data-disabled', true);
      // Element.closest is not supported in IE11
      closest(this, 'form').submit();
    });
  }

  // Change Mark as solved text according to whether comment is filled
  var requestCommentTextarea = document.querySelector('.request-container .comment-container textarea');

  if (requestCommentTextarea) {
    requestCommentTextarea.addEventListener('input', function() {
      if (requestCommentTextarea.value === '') {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-translation');
        }
        requestCommentSubmitButton.disabled = true;
      } else {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-and-submit-translation');
        }
        requestCommentSubmitButton.disabled = false;
      }
    });
  }

  // Disable submit button if textarea is empty
  if (requestCommentTextarea && requestCommentTextarea.value === '') {
    requestCommentSubmitButton.disabled = true;
  }

  // Submit requests filter form on status or organization change in the request list page
  Array.prototype.forEach.call(document.querySelectorAll('#request-status-select, #request-organization-select'), function(el) {
    el.addEventListener('change', function(e) {
      e.stopPropagation();
      saveFocus();
      closest(this, 'form').submit();
    });
  });

  // Submit requests filter form on search in the request list page
  var quickSearch = document.querySelector('#quick-search');
  quickSearch && quickSearch.addEventListener('keyup', function(e) {
    if (e.keyCode === ENTER) {
      e.stopPropagation();
      saveFocus();
      closest(this, 'form').submit();
    }
  });

  function toggleNavigation(toggle, menu) {
    var isExpanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', !isExpanded);
    toggle.setAttribute('aria-expanded', !isExpanded);
  }

  function closeNavigation(toggle, menu) {
    menu.setAttribute('aria-expanded', false);
    toggle.setAttribute('aria-expanded', false);
    toggle.focus();
  }

  var burgerMenu = document.querySelector('.header .menu-button');
  var userMenu = document.querySelector('#user-nav');

  burgerMenu.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleNavigation(this, userMenu);
  });


  userMenu.addEventListener('keyup', function(e) {
    if (e.keyCode === ESCAPE) {
      e.stopPropagation();
      closeNavigation(burgerMenu, this);
    }
  });

  if (userMenu.children.length === 0) {
    burgerMenu.style.display = 'none';
  }

  // Toggles expanded aria to collapsible elements
  var collapsible = document.querySelectorAll('.collapsible-nav, .collapsible-sidebar');

  Array.prototype.forEach.call(collapsible, function(el) {
    var toggle = el.querySelector('.collapsible-nav-toggle, .collapsible-sidebar-toggle');

    el.addEventListener('click', function(e) {
      toggleNavigation(toggle, this);
    });

    el.addEventListener('keyup', function(e) {
      if (e.keyCode === ESCAPE) {
        closeNavigation(toggle, this);
      }
    });
  });

  // Submit organization form in the request page
  var requestOrganisationSelect = document.querySelector('#request-organization select');

  if (requestOrganisationSelect) {
    requestOrganisationSelect.addEventListener('change', function() {
      closest(this, 'form').submit();
    });
  }

  // If a section has more than 6 subsections, we collapse the list, and show a trigger to display them all
  var seeAllTrigger = document.querySelector("#see-all-sections-trigger");
  var subsectionsList = document.querySelector(".section-list");

  if (subsectionsList && subsectionsList.children.length > 6) {
    seeAllTrigger.setAttribute("aria-hidden", false);

    seeAllTrigger.addEventListener("click", function(e) {
      subsectionsList.classList.remove("section-list--collapsed");
      seeAllTrigger.parentNode.removeChild(seeAllTrigger);
    });
  }

  // If multibrand search has more than 5 help centers or categories collapse the list
  var multibrandFilterLists = document.querySelectorAll(".multibrand-filter-list");
  Array.prototype.forEach.call(multibrandFilterLists, function(filter) {
    if (filter.children.length > 6) {
      // Display the show more button
      var trigger = filter.querySelector(".see-all-filters");
      trigger.setAttribute("aria-hidden", false);

      // Add event handler for click
      trigger.addEventListener("click", function(e) {
        e.stopPropagation();
        trigger.parentNode.removeChild(trigger);
        filter.classList.remove("multibrand-filter-list--collapsed")
      })
    }
  });

  // If there are any error notifications below an input field, focus that field
  var notificationElm = document.querySelector(".notification-error");
  if (
    notificationElm &&
    notificationElm.previousElementSibling &&
    typeof notificationElm.previousElementSibling.focus === "function"
  ) {
    notificationElm.previousElementSibling.focus();
  }

  // Dropdowns
  
  function Dropdown(toggle, menu) {
    this.toggle = toggle;
    this.menu = menu;

    this.menuPlacement = {
      top: menu.classList.contains("dropdown-menu-top"),
      end: menu.classList.contains("dropdown-menu-end")
    };

    this.toggle.addEventListener("click", this.clickHandler.bind(this));
    this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
    this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
  };

  Dropdown.prototype = {

    get isExpanded() {
      return this.menu.getAttribute("aria-expanded") === "true";
    },

    get menuItems() {
      return Array.prototype.slice.call(this.menu.querySelectorAll("[role='menuitem']"));
    },

    dismiss: function() {
      if (!this.isExpanded) return;

      this.menu.setAttribute("aria-expanded", false);
      this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
    },

    open: function() {
      if (this.isExpanded) return;

      this.menu.setAttribute("aria-expanded", true);
      this.handleOverflow();
    },

    handleOverflow: function() {
      var rect = this.menu.getBoundingClientRect();

      var overflow = {
        right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
        bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight
      };

      if (overflow.right || this.menuPlacement.end) {
        this.menu.classList.add("dropdown-menu-end");
      }

      if (overflow.bottom || this.menuPlacement.top) {
        this.menu.classList.add("dropdown-menu-top");
      }

      if (this.menu.getBoundingClientRect().top < 0) {
        this.menu.classList.remove("dropdown-menu-top")
      }
    },

    focusNextMenuItem: function(currentItem) {
      if (!this.menuItems.length) return;

      var currentIndex = this.menuItems.indexOf(currentItem);
      var nextIndex = currentIndex === this.menuItems.length - 1 || currentIndex < 0 ? 0 : currentIndex + 1;

      this.menuItems[nextIndex].focus();
    },

    focusPreviousMenuItem: function(currentItem) {
      if (!this.menuItems.length) return;

      var currentIndex = this.menuItems.indexOf(currentItem);
      var previousIndex = currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;

      this.menuItems[previousIndex].focus();
    },

    clickHandler: function() {
      if (this.isExpanded) {
        this.dismiss();
      } else {
        this.open();
      }
    },

    toggleKeyHandler: function(e) {
      switch (e.keyCode) {
        case ENTER:
        case SPACE:
        case DOWN:
          e.preventDefault();
          this.open();
          this.focusNextMenuItem();
          break;
        case UP:
          e.preventDefault();
          this.open();
          this.focusPreviousMenuItem();
          break;
        case ESCAPE:
          this.dismiss();
          this.toggle.focus();
          break;
      }
    },

    menuKeyHandler: function(e) {
      var firstItem = this.menuItems[0];
      var lastItem = this.menuItems[this.menuItems.length - 1];
      var currentElement = e.target;

      switch (e.keyCode) {
        case ESCAPE:
          this.dismiss();
          this.toggle.focus();
          break;
        case DOWN:
          e.preventDefault();
          this.focusNextMenuItem(currentElement);
          break;
        case UP:
          e.preventDefault();
          this.focusPreviousMenuItem(currentElement);
          break;
        case TAB:
          if (e.shiftKey) {
            if (currentElement === firstItem) {
              this.dismiss();
            } else {
              e.preventDefault();
              this.focusPreviousMenuItem(currentElement);
            }
          } else if (currentElement === lastItem) {
            this.dismiss();
          } else {
            e.preventDefault();
            this.focusNextMenuItem(currentElement);
          }
          break;
        case ENTER:
        case SPACE:
          e.preventDefault();
          currentElement.click();
          break;
      }
    }
  }

  var dropdowns = [];
  var dropdownToggles = Array.prototype.slice.call(document.querySelectorAll(".dropdown-toggle"));

  dropdownToggles.forEach(function(toggle) {
    var menu = toggle.nextElementSibling;
    if (menu && menu.classList.contains("dropdown-menu")) {
      dropdowns.push(new Dropdown(toggle, menu));
    }
  });

  document.addEventListener("click", function(evt) {
    dropdowns.forEach(function(dropdown) {
      if (!dropdown.toggle.contains(evt.target)) {
        dropdown.dismiss();
      }
    });
  });
});
$(document).ready(function(){

// ==========================================
// DYNAMIC ATTACHMENT HINT TEXT
// ==========================================
var currentLang = document.documentElement.lang.toLowerCase();
var baseLang = currentLang.split('-')[0]; // Grabs just the 'en' from 'en-us'

var attachmentHints = {
    // English (US, UK, CA, AU, SG, ZA, NG, KE, NZ, etc.)
    "en": "For items not received post-purchase, please attach the payment proof.",
    
    // Spanish (MX, CO, AR, CL, ES, PE, EC, PY, BO, UY)
    "es": "Para artículos no recibidos después de la compra, adjunte el comprobante de pago.",
    
    // Arabic (SA, EG, AE, KW, BH, QA, MA, IQ)
    "ar": "بالنسبة للعناصر التي لم يتم استلامها بعد الشراء، يرجى إرفاق إثبات الدفع.",
    
    // Portuguese (PT, TL)
    "pt": "Para itens não recebidos após a compra, anexe o comprovante de pagamento.",
    
    // French (FR)
    "fr": "Pour les articles non reçus après l'achat, veuillez joindre la preuve de paiement.",
    
    // German (DE, AT, CH)
    "de": "Für nach dem Kauf nicht erhaltene Artikel fügen Sie bitte den Zahlungsbeleg bei.",
    
    // Norwegian (NO - catching both 'no' and 'nb' for Bokmål)
    "no": "For varer som ikke er mottatt etter kjøp, vennligst legg ved betalingsbevis.",
    "nb": "For varer som ikke er mottatt etter kjøp, vennligst legg ved betalingsbevis.",
    
    // Korean (KR)
    "ko": "구매 후 상품을 받지 못한 경우 결제 영수증을 첨부해 주세요.",
    
    // Traditional Chinese (TW, HK)
    "zh-tw": "對於購買後未收到的物品，請附上付款證明。",
    "zh-hk": "對於購買後未收到的物品，請附上付款證明。",
    "zh": "對於購買後未收到的物品，請附上付款證明。", // Fallback
    
    // Mongolian (MN)
    "mn": "Худалдан авалтын дараа хүлээж аваагүй барааны төлбөрийн баримтыг хавсаргана уу.",
    
    // Dutch (NL, BE)
    "nl": "Voor artikelen die na aankoop niet zijn ontvangen, dient u het betalingsbewijs bij te voegen.",
    
    // Turkish (TR)
    "tr": "Satın alma işleminden sonra teslim alınmayan ürünler için lütfen ödeme kanıtını ekleyin.",
    
    // Japanese (JP)
    "ja": "購入後に商品が届かない場合は、支払い証明書を添付してください。",
    
    // Khmer (KH)
    "km": "សម្រាប់ទំនិញដែលមិនទទួលបានបន្ទាប់ពីការទិញ សូមភ្ជាប់ភស្តុតាងនៃការទូទាត់។",
    
    // Polish (PL)
    "pl": "W przypadku przedmiotów nieotrzymanych po zakupie, prosimy o dołączenie dowodu wpłaty.",
    
    // Vietnamese (VN)
    "vi": "Đối với các mặt hàng không nhận được sau khi mua, vui lòng đính kèm bằng chứng thanh toán.",
    
    // Italian (IT)
    "it": "Per gli articoli non ricevuti dopo l'acquisto, si prega di allegare la prova di pagamento.",
    
    // Romanian (RO)
    "ro": "Pentru articolele neprimite după achiziție, vă rugăm să atașați dovada plății.",
    
    // Nepali (NP)
    "ne": "खरिद गरेपछि प्राप्त नभएका वस्तुहरूको लागि, कृपया भुक्तानी प्रमाण संलग्न गर्नुहोस्।",
    
    // Sinhala (LK)
    "si": "මිලදී ගැනීමෙන් පසු නොලැබුණු අයිතම සඳහා, කරුණාකර ගෙවීම් සාක්ෂිය අමුණන්න.",
    
    // Kazakh (KZ)
    "kk": "Сатып алғаннан кейін алынбаған заттар үшін төлем растауын тіркеңіз.",
    
    // Russian (KZ fallback, etc.)
    "ru": "Для товаров, не полученных после покупки, пожалуйста, прикрепите подтверждение оплаты.",
    
    // Bengali (BD)
    "bn": "কেনার পরে না পাওয়া আইটেমগুলির জন্য, অনুগ্রহ করে অর্থপ্রদানের প্রমাণ সংযুক্ত করুন।",
    
    // Hungarian (HU)
    "hu": "A vásárlás után meg nem kapott tételek esetén kérjük, csatolja a fizetési bizonylatot.",
    
    // Czech (CZ)
    "cs": "U položek, které nebyly po zakoupení obdrženy, přiložte doklad o platbě.",
    
    // Swedish (SE)
    "sv": "För varor som inte mottagits efter köp, vänligen bifoga betalningsbeviset.",
    
    // Danish (DK)
    "da": "For varer, der ikke er modtaget efter køb, bedes du vedhæfte betalingsbeviset.",
    
    // Slovak (SK)
    "sk": "Pre položky, ktoré neboli prijaté po zakúpení, priložte doklad o platbe.",
    
    // Urdu (PK)
    "ur": "خریداری کے بعد موصول نہ ہونے والی اشیاء کے لیے، براہ کرم ادائیگی کا ثبوت منسلک کریں۔",
    
    // Lao (LA)
    "lo": "ສຳລັບສິນຄ້າທີ່ບໍ່ໄດ້ຮັບຫຼັງຈາກການຊື້, ກະລຸນາຄັດຕິດຫຼັກຖານການຈ່າຍເງິນ.",
    
    // Indonesian (ID)
    "id": "Untuk item yang tidak diterima setelah pembelian, harap lampirkan bukti pembayaran.",
    
    // Thai (TH)
    "th": "สำหรับสินค้าที่ไม่ได้รับหลังการซื้อ โปรดแนบหลักฐานการชำระเงิน",
    
    // Malay (MY)
    "ms": "Untuk item yang tidak diterima selepas pembelian, sila lampirkan bukti pembayaran.",
    
    // Tagalog / Filipino (PH)
    "fil": "Para sa mga item na hindi natanggap pagkatapos bumili, mangyaring ilakip ang katibayan ng pagbabayad.",
    
    // Hindi (IN)
    "hi": "खरीद के बाद प्राप्त नहीं हुए आइटम के लिए, कृपया भुगतान प्रमाण संलग्न करें。"
};

// 1. Try to match the exact full locale (like 'zh-tw'). 
// 2. If it fails, fallback to the base language (like 'es'). 
// 3. If everything fails, default to English.
var finalHintText = attachmentHints[currentLang] || attachmentHints[baseLang] || attachmentHints["en"];

// Inject it into the page
$('div#upload-dropzone').parent().append('<b><p id="attachment_field_hint">' + finalHintText + '</p></b>');

})

// ==========================================
// DYNAMIC SUPPORT HOURS TEXT
// ==========================================
$(document).ready(function() {
    var currentLang = document.documentElement.lang.toLowerCase();
    var baseLang = currentLang.split('-')[0];

    var supportHours = {
        "en": "Support Hours: Monday to Sunday,<br>9:00 AM to 6:00 PM (local time)",
        "es": "Horario de soporte: Lunes a domingo,<br>9:00 AM a 6:00 PM (hora local)",
        "ar": "ساعات الدعم: من الاثنين إلى الأحد،<br>من 9:00 صباحاً إلى 6:00 مساءً (بالتوقيت المحلي)",
        "pt": "Horário de atendimento: Segunda a domingo,<br>9:00 às 18:00 (horário local)",
        "fr": "Heures d'assistance : du lundi au dimanche,<br>de 9h00 à 18h00 (heure locale)",
        "de": "Support-Zeiten: Montag bis Sonntag,<br>9:00 bis 18:00 Uhr (Ortszeit)",
        "no": "Supporttider: Mandag til søndag,<br>09:00 til 18:00 (lokal tid)",
        "nb": "Supporttider: Mandag til søndag,<br>09:00 til 18:00 (lokal tid)",
        "ko": "고객 지원 시간: 월요일 ~ 일요일,<br>오전 9:00 ~ 오후 6:00 (현지 시간)",
        "zh-tw": "客服時間：星期一至星期日，<br>上午 9:00 至下午 6:00（當地時間）",
        "zh-hk": "客服時間：星期一至星期日，<br>上午 9:00 至下午 6:00（當地時間）",
        "zh": "客服時間：星期一至星期日，<br>上午 9:00 至下午 6:00（當地時間）",
        "mn": "Тусламж үйлчилгээний цаг: Даваагаас Ням гараг,<br>11:30 - 20:30 (орон нутгийн цагаар)",
        "nl": "Supporturen: Maandag t/m zondag,<br>09:00 tot 18:00 (lokale tijd)",
        "tr": "Destek Saatleri: Pazartesi - Pazar,<br>09:00 - 18:00 (yerel saat)",
        "ja": "サポート営業時間：月曜日～日曜日、<br>午前9:00～午後6:00（現地時間）",
        "km": "ម៉ោងធ្វើការ៖ ថ្ងៃច័ន្ទ ដល់ ថ្ងៃអាទិត្យ<br>9:00 ព្រឹក ដល់ 6:00 ល្ងាច (ម៉ោងក្នុងស្រុក)",
        "pl": "Godziny pracy pomocy technicznej: od poniedziałku do niedzieli,<br>9:00 - 18:00 (czasu lokalnego)",
        "vi": "Giờ hỗ trợ: Thứ Hai đến Chủ Nhật,<br>9:00 sáng đến 6:00 chiều (giờ địa phương)",
        "it": "Orari di assistenza: dal lunedì alla domenica,<br>dalle 9:00 alle 18:00 (ora locale)",
        "ro": "Program de asistență: Luni până Duminică,<br>9:00 - 18:00 (ora locală)",
        "ne": "समर्थन घण्टा: सोमबार देखि आइतबार,<br>बिहान ९:०० देखि साँझ ६:०० (स्थानीय समय)",
        "si": "සහාය වේලාවන්: සඳුදා සිට ඉරිදා දක්වා,<br>පෙ.ව. 9:00 සිට ප.ව. 6:00 දක්වා (දේශීය වේලාව)",
        "kk": "Қолдау көрсету уақыты: Дүйсенбі - Жексенбі,<br>09:00 - 18:00 (жергілікті уақыт)",
        "ru": "Часы работы поддержки: с понедельника по воскресенье,<br>с 9:00 до 18:00 (местное время)",
        "bn": "সাপোর্টের সময়: সোমবার থেকে রবিবার,<br>সকাল ৯:০০ থেকে সন্ধ্যা ৬:০০ (স্থানীয় সময়)",
        "hu": "Ügyfélszolgálati nyitvatartás: Hétfőtől vasárnapig,<br>9:00-tól 18:00-ig (helyi idő szerint)",
        "cs": "Pracovní doba podpory: Pondělí až neděle,<br>9:00 až 18:00 (místního času)",
        "sv": "Supportens öppettider: Måndag till söndag,<br>09:00 till 18:00 (lokal tid)",
        "da": "Supportens åbningstider: Mandag til søndag,<br>09.00 til 18.00 (lokal tid)",
        "sk": "Pracovná doba podpory: Pondelok až nedeľa,<br>9:00 až 18:00 (miestneho času)",
        "ur": "سپورٹ کے اوقات: پیر تا اتوار،<br>صبح 9:00 بجے سے شام 6:00 بجے تک (مقامی وقت)",
        "lo": "ເວລາໃຫ້ບໍລິການ: ວັນຈັນ ຫາ ວັນອາທິດ,<br>9:00 ໂມງເຊົ້າ ຫາ 6:00 ໂມງແລງ (ເວລາທ້ອງຖິ່ນ)",
        "id": "Jam Layanan: Senin hingga Minggu,<br>09:00 hingga 18:00 (waktu setempat)",
        "th": "เวลาทำการฝ่ายสนับสนุน: วันจันทร์ถึงวันอาทิตย์<br>09:00 น. ถึง 18:00 น. (เวลาท้องถิ่น)",
        "ms": "Waktu Sokongan: Isnin hingga Ahad,<br>9:00 PG hingga 6:00 PTG (waktu tempatan)",
        "fil": "Oras ng Suporta: Lunes hanggang Linggo,<br>9:00 AM hanggang 6:00 PM (lokal na oras)",
        "hi": "सहायता के घंटे: सोमवार से रविवार,<br>सुबह 9:00 बजे से शाम 6:00 बजे तक (स्थानीय समय)"
    };

    var finalHoursText = supportHours[currentLang] || supportHours[baseLang] || supportHours["en"];

	//if (window.location.hostname.includes("mx.support")) {
       // finalHoursText = "Horario de soporte: Lunes a domingo,<br>9:00 AM a 7:00 PM (hora local)";
  //  }
	
    // Check if the container exists on the page, then replace the text
    if ($('#dynamic-support-hours').length) {
        $('#dynamic-support-hours').html(finalHoursText);
    }
});



// ==========================================
// FORCE UNSUPPORTED LANGUAGE FIXES (LAOS, MONGOLIA, CAMBODIA)
// ==========================================
$(document).ready(function() {
    var currentLang = document.documentElement.lang.toLowerCase();
    var baseLang = currentLang.split('-')[0];

    // Master Dictionary for the 3 Unsupported Languages
    var fallbackFixes = {
        "lo": { 
            search: "ຄົ້ນຫາ", 
            submitReq: "ສົ່ງຄໍາຮ້ອງຂໍ", 
            submitBtn: "ສົ່ງ",
            attachLabel: "ໄຟລ໌ແນບ (ທາງເລືອກ)",
            uploadLink: "ເພີ່ມໄຟລ໌",
            dropText: " ຫຼື ວາງໄຟລ໌ຢູ່ທີ່ນີ້",
            emailLabel: "ທີ່ຢູ່ອີເມວຂອງທ່ານ"
        },
        "mn": { 
            search: "Хайх", 
            submitReq: "Хүсэлт илгээх", 
            submitBtn: "Илгээх",
            attachLabel: "Хавсралт (заавал биш)",
            uploadLink: "Файл нэмэх",
            dropText: " эсвэл энд байршуулах",
            emailLabel: "Имэйл хаяг"
        },
        "km": { 
            search: "ស្វែងរក", 
            submitReq: "ដាក់ស្នើសំណើ", 
            submitBtn: "ដាក់ស្នើ",
            attachLabel: "ឯកសារភ្ជាប់ (ជាជម្រើស)",
            uploadLink: "បន្ថែមឯកសារ",
            dropText: " ឬទម្លាក់ឯកសារនៅទីនេះ",
            emailLabel: "អាសយដ្ឋានអ៊ីមែលរបស់អ្នក"
        }
    };

    var fix = fallbackFixes[baseLang];

    if (fix) {
        // 1. GLOBAL FIXES (Header & Search)
        $('form[role="search"] input[type="search"]').attr('placeholder', fix.search); 
        $('a.submit-a-request, .submit-a-request-header-btn, a[href$="/requests/new"]').text(fix.submitReq);
        
        // 2. SPECIFIC FORM PAGE FIXES (/requests/new)
        if (window.location.href.indexOf('/requests/new') > -1) {
            
            // Force the Page Title & Breadcrumb to translate
            $('h1').text(fix.submitReq);
            $('.breadcrumbs li:last-child').text(fix.submitReq);
            
            // Force the Submit input button to translate
            $('input[type="submit"]').val(fix.submitBtn);
            
            // Translate Attachment & Email labels
            $('label[for="request-attachments"]').text(fix.attachLabel);
            $('label[for="request_anonymous_requester_email"]').text(fix.emailLabel);
            
            // SAFELY translate the dropzone without breaking Zendesk's upload mechanics!
            var $dropzoneLink = $('#upload-dropzone a');
            if ($dropzoneLink.length > 0) {
                // Change just the clickable link text
                $dropzoneLink.text(fix.uploadLink);
                
                // Change the plain text node floating next to the link
                $dropzoneLink.parent().contents().filter(function() {
                    return this.nodeType === 3 && this.nodeValue.trim() !== "";
                }).replaceWith(fix.dropText);
            }
        }
    }
});

// ==========================================
// WEBSTORE REDIRECT WARNING (CODASHOP MEXICO ONLY)
// Runs only when the Mexico "Where did you make your purchase?" field is on the page;
// on every other help center using this theme it exits immediately.
// ==========================================
(() => {
  /* Webstore redirect warning — Codashop Mexico only (exits immediately on every other help center) */
  const FIELD_IDS = ["17825880863119"];
  const CODASHOP_TAGS = ["purchased_through_codashop_mx"];
  const SUBMIT_SELECTOR = 'input[type="submit"][name="commit"]';
  const WARNING_CLASS = "webstore-warning";
  const HIDDEN_CLASS = "webstore-hidden";
  const COMPACT_CLASS = "webstore-compact";
  const BOTTOM_SPACING = 48;

  const webstoreMappings = {
    "purchased_through_cod_m_webstore_mx": { name: "COD:M", url: "https://codm-global-support.zendesk.com/hc/es" },
    "purchased_through_ea_sports_fc_mobile_webstore_mx": { name: "EA Sports FC™ Mobile", url: "https://fc-mobile-mx-support-codapayments.zendesk.com/hc/es" },
    "purchased_through_efootball_webstore_mx": { name: "eFootball™", url: "https://konami-webstore-support.zendesk.com/hc/en-us/categories/13549616536975-eFootball" },
    "purchased_through_rainbow_six_mobile_webstore_mx": { name: "Rainbow Six Mobile", url: "https://rainbow-six-mobile-global-support.zendesk.com/hc/es/" },
    "purchased_through_the_division_resurgence_webstore_webstore_mx": { name: "The Division Resurgence", url: "https://the-division-resurgence-global-support.zendesk.com/hc/es" },
    "purchased_through_yu-gi-oh__master_duel_webstore_mx": { name: "Yu-Gi-Oh! MASTER DUEL", url: "https://konami-webstore-support.zendesk.com/hc/en-us/categories/13839148070159-Yu-Gi-Oh-Master-Duel" },
    "purchased_through_yu-gi-oh__duel_links_webstore_mx": { name: "Yu-Gi-Oh! DUEL LINKS", url: "https://konami-webstore-support.zendesk.com/hc/en-us/categories/14697108082703" }
  };

  // Warning text per help center language (page language is read from <html lang> or the URL)
  const STRINGS = {
    en: {
      before: (n) => `⚠️ For ${n} Webstore-related issues, please visit the `,
      link: (n) => `${n} Webstore Help Center`,
      after: ".",
      generic: "⚠️ This form is only for Codashop purchases. Please contact the store where you made your purchase."
    },
    pt: {
      before: (n) => `⚠️ Para problemas relacionados à ${n} Webstore, acesse a `,
      link: (n) => `Central de Ajuda da ${n} Webstore`,
      after: ".",
      generic: "⚠️ Este formulário é apenas para compras feitas na Codashop. Entre em contato com a loja onde você fez sua compra."
    },
    es: {
      before: (n) => `⚠️ Para problemas relacionados con ${n} Webstore, visita el `,
      link: (n) => `Centro de Ayuda de ${n} Webstore`,
      after: ".",
      generic: "⚠️ Este formulario es solo para compras realizadas en Codashop. Comunícate con la tienda donde realizaste tu compra."
    }
  };

  const getStrings = () => {
    const lang = (document.documentElement.lang || window.location.pathname.split("/")[2] || "").toLowerCase();
    if (lang.startsWith("pt")) return STRINGS.pt;
    if (lang.startsWith("es")) return STRINGS.es;
    return STRINGS.en;
  };

  const isAllowed = (value) => !value || value === "-" || CODASHOP_TAGS.includes(value);

  const getInput = (id) =>
    document.getElementById(`request_custom_fields_${id}`) ||
    document.querySelector(`[name="request[custom_fields][${id}]"]`);

  const getWrapper = (id, input) => {
    const label = document.getElementById(`request_custom_fields_${id}_label`);
    return (
      document.querySelector(`.form-field.request_custom_fields_${id}, div.request_custom_fields_${id}`) ||
      (label && label.closest(".form-field")) ||
      (input && input.closest(".form-field")) ||
      null
    );
  };

  const isVisible = (el) => !!el && el.getClientRects().length > 0;

  const isAfter = (reference, el) =>
    el !== reference &&
    !reference.contains(el) &&
    !!(reference.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);

  const init = () => {
    // Exit immediately on any page/help center without the Brazil field
    if (!FIELD_IDS.some((id) => getInput(id))) return;

    const style = document.createElement("style");
    style.textContent =
      `.${HIDDEN_CLASS}{display:none !important;}` +
      `.${COMPACT_CLASS}{min-height:var(--webstore-min-h,0px) !important;}` +
      `.${WARNING_CLASS}{margin:8px 0 0;padding:10px 12px;border-left:4px solid #e8a317;background:#fff7e0;color:#5a4300;font-size:14px;line-height:1.45;}` +
      `.${WARNING_CLASS} .warning-hc-link{color:#1f5fbf;text-decoration:underline;}`;
    document.head.appendChild(style);

    let formIsBlocked = false;
    let observer = null;

    const fillWarning = (p, value) => {
      p.textContent = "";
      const mapping = webstoreMappings[value];
      const t = getStrings();
      if (mapping) {
        const link = document.createElement("a");
        link.href = mapping.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "warning-hc-link";
        link.textContent = t.link(mapping.name);
        p.append(t.before(mapping.name), link, t.after);
      } else {
        p.append(t.generic);
      }
      p.dataset.value = value;
    };

    const placeWarning = (wrapper, warning) => {
      const nestyBox = wrapper.querySelector(":scope > .nesty-input");
      if (nestyBox) {
        if (nestyBox.nextElementSibling !== warning) nestyBox.after(warning);
      } else if (warning.parentElement !== wrapper) {
        wrapper.appendChild(warning);
      }
    };

    const evaluateField = (id) => {
      const input = getInput(id);
      const wrapper = getWrapper(id, input);
      const warningId = `webstore-warning-${id}`;
      let warning = document.getElementById(warningId);
      const value = ((input && input.value) || "").trim();
      const blocked = !!input && isVisible(wrapper) && !isAllowed(value);

      if (!blocked) {
        if (warning) warning.remove();
        return null;
      }
      if (!warning) {
        warning = document.createElement("div");
        warning.id = warningId;
        warning.style.setProperty("padding-bottom", `${BOTTOM_SPACING}px`, "important");
        const message = document.createElement("p");
        message.className = WARNING_CLASS;
        message.setAttribute("role", "alert");
        warning.appendChild(message);
      }
      const message = warning.querySelector(`.${WARNING_CLASS}`);
      if (message.dataset.value !== value) fillWarning(message, value);
      placeWarning(wrapper, warning);
      return wrapper;
    };

    const evaluateAll = () => {
      // 1. Undo our own hiding/compacting so checks see the theme's real state
      document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((el) => el.classList.remove(HIDDEN_CLASS));
      document.querySelectorAll(`.${COMPACT_CLASS}`).forEach((el) => {
        el.style.removeProperty("--webstore-min-h");
        el.classList.remove(COMPACT_CLASS);
      });

      // 2. Find the top-most blocking field
      let blockingWrapper = null;
      FIELD_IDS.forEach((id) => {
        const wrapper = evaluateField(id);
        if (wrapper && (!blockingWrapper || isAfter(wrapper, blockingWrapper))) blockingWrapper = wrapper;
      });
      formIsBlocked = !!blockingWrapper;

      if (blockingWrapper) {
        const form = blockingWrapper.closest("form");

        // 3. Hide every field below the blocking field
        (form || document).querySelectorAll(".form-field").forEach((field) => {
          if (isAfter(blockingWrapper, field)) field.classList.add(HIDDEN_CLASS);
        });

        // 3b. Pin the site footer to the bottom of the screen
        const siteFooter = [...document.querySelectorAll("footer")].find((f) => !(form && form.contains(f)));
        let stretchEl = null;
        for (let el = form; el && el !== document.body; el = el.parentElement) {
          if (siteFooter && el.contains(siteFooter)) break;
          if (parseFloat(getComputedStyle(el).minHeight) > 0) el.classList.add(COMPACT_CLASS);
          stretchEl = el;
        }
        if (stretchEl && siteFooter) {
          stretchEl.classList.add(COMPACT_CLASS);
          const footerBottom = siteFooter.getBoundingClientRect().bottom + window.scrollY;
          const shortfall = document.documentElement.clientHeight - footerBottom;
          if (shortfall > 0) {
            const height = stretchEl.getBoundingClientRect().height + shortfall;
            stretchEl.style.setProperty("--webstore-min-h", `${Math.floor(height)}px`);
          }
        }
      }

      // 4. Disable + hide submit; on release, re-enable only buttons we disabled
      document.querySelectorAll(SUBMIT_SELECTOR).forEach((btn) => {
        if (formIsBlocked) {
          btn.disabled = true;
          btn.dataset.webstoreLocked = "true";
          (btn.closest("footer") || btn).classList.add(HIDDEN_CLASS);
        } else if (btn.dataset.webstoreLocked) {
          delete btn.dataset.webstoreLocked;
          btn.disabled = false;
        }
      });

      // 5. Discard the mutations we just caused
      if (observer) observer.takeRecords();
    };

    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        evaluateAll();
      });
    };

    document.addEventListener("change", schedule, true);
    document.addEventListener("input", schedule, true);
    if (window.jQuery) window.jQuery(document).on("change", schedule);

    observer = new MutationObserver(schedule);
    observer.observe(document.querySelector("form#new_request, form.request-form") || document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style", "class", "hidden", "disabled"]
    });

    document.addEventListener(
      "submit",
      (event) => {
        evaluateAll();
        if (formIsBlocked && FIELD_IDS.some((id) => event.target.contains(getInput(id)))) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const w = document.querySelector(`.${WARNING_CLASS}`);
          if (w) w.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
      true
    );

    evaluateAll();
    window.addEventListener("load", schedule);
    window.addEventListener("resize", schedule);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
