(() => {
 'use strict';
 const publicPath=document.currentScript?.src ? new URL('.',document.currentScript.src).pathname : '/';
 const assetRevision=document.currentScript?.src ? new URL(document.currentScript.src).search : '';
 const pageUrl=url=>url.startsWith('/') ? publicPath+url.slice(1) : url;
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow'}).format(new Date());
 const names={all:'Обе клиники',str:'Страж Революции, 24А',kaz:'Казанская набережная, 5'};
 const phones={all:['+78312601200','+7 (831) 260-12-00'],str:['+78312601220','+7 (831) 260-12-20'],kaz:['+78312601200','+7 (831) 260-12-00']};
 const normalize=s=>s.toLocaleLowerCase('ru').replace(/ё/g,'е').trim();
 let branch='all';try{branch=localStorage.getItem('implant52-preview-branch')||'all'}catch{}
 const requestedBranch=new URLSearchParams(location.search).get('branch') ?? document.querySelector('[data-page-branch]')?.dataset.pageBranch;
 if(Object.hasOwn(names,requestedBranch))branch=requestedBranch;
 const serviceBranchGroups=document.querySelectorAll('[data-service-branch]');
 let closeToast;
 const picker=document.querySelector('#clinic-picker');
 const branchOptions=[...document.querySelectorAll('[data-branch-option]')];

 function setBranch(value,announce=false){
  branch=Object.hasOwn(names,value)?value:'all';
  document.querySelectorAll('[data-branch]').forEach(select=>select.value=branch);
  branchOptions.forEach(option=>option.checked=option.value===branch);
  document.querySelectorAll('[data-branch-label]').forEach(label=>label.textContent=branch==='all'?'Выбрать клинику':names[branch]);
  document.querySelectorAll('[data-branch-card]').forEach(card=>card.classList.toggle('selected',card.dataset.branchCard===branch));
  document.querySelectorAll('[data-clinic-phone]').forEach(link=>{
   link.href='tel:'+phones[branch][0];
   if(link.classList.contains('phone'))link.textContent=phones[branch][1];
  });
  try{localStorage.setItem('implant52-preview-branch',branch)}catch{}
  filterDoctors();
  filterPrices();
  serviceBranchGroups.forEach(group=>{group.hidden=branch!=='all'&&group.dataset.serviceBranch!==branch});
  if(announce){
   const toast=document.querySelector('.branch-toast');
   toast.textContent=branch==='all'?'Показываем обе клиники':'Выбран адрес: '+names[branch];
   toast.hidden=false;
   clearTimeout(closeToast);
   closeToast=setTimeout(()=>toast.hidden=true,4000);
  }
 }
 document.querySelectorAll('[data-branch]').forEach(select=>select.addEventListener('change',()=>setBranch(select.value)));
 branchOptions.forEach(option=>option.addEventListener('change',()=>setBranch(option.value,true)));
 document.querySelectorAll('[data-pick-branch]').forEach(button=>button.addEventListener('click',()=>setBranch(button.dataset.pickBranch,true)));

 const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
 function showMenu(open){
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  nav.classList.toggle('is-open',open);
 }
 menu?.addEventListener('click',()=>{
  if(picker)picker.open=false;
  showMenu(menu.getAttribute('aria-expanded')!=='true');
 });
 picker?.addEventListener('toggle',()=>{if(picker.open&&menu)showMenu(false);});
 picker?.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!picker.open)return;
  picker.open=false;
  picker.querySelector('summary').focus();
 });
 document.addEventListener('click',event=>{if(picker?.open&&!picker.contains(event.target))picker.open=false;});
 nav?.addEventListener('keydown',event=>{if(event.key==='Escape'){showMenu(false);menu.focus();}});
 document.querySelectorAll('[role=tablist]').forEach(group=>{const tabs=[...group.querySelectorAll('[role=tab]')];const activate=t=>{tabs.forEach(x=>{x.setAttribute('aria-selected',String(x===t));x.tabIndex=x===t?0:-1;const panel=document.getElementById(x.dataset.panel);if(panel)panel.hidden=x!==t})};tabs.forEach((t,i)=>{t.tabIndex=t.getAttribute('aria-selected')==='true'?0:-1;t.addEventListener('click',()=>activate(t));t.addEventListener('keydown',e=>{let j=i;if(e.key==='ArrowRight')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();activate(tabs[j]);tabs[j].focus()})})});
 document.querySelectorAll('.compare input').forEach(r=>r.addEventListener('input',()=>r.closest('.compare').style.setProperty('--split',r.value+'%')));
 const doctorSearch=document.querySelector('#doctor-search'),specialty=document.querySelector('#doctor-specialty');
 function filterDoctors(){if(!doctorSearch)return;const q=normalize(doctorSearch.value),spec=specialty.value;let n=0;document.querySelectorAll('[data-doctor-card]').forEach(c=>{const ok=normalize(c.textContent).includes(q)&&(spec==='all'||c.dataset.specialty.split(' ').includes(spec))&&(branch==='all'||c.dataset.branches.split(' ').includes(branch));c.hidden=!ok;if(ok)n++});document.querySelector('#doctor-count').textContent='Специалистов: '+n;document.querySelector('#doctor-empty').hidden=n>0}
 doctorSearch?.addEventListener('input',filterDoctors);specialty?.addEventListener('change',filterDoctors);document.querySelector('[data-reset-doctors]')?.addEventListener('click',()=>{doctorSearch.value='';specialty.value='all';setBranch('all')});
 const priceSearch=document.querySelector('#price-search'),priceGroup=document.querySelector('#price-group');
 function filterPrices(){if(!priceSearch)return;let n=0;const q=normalize(priceSearch.value),g=priceGroup.value;document.querySelectorAll('[data-price-row]').forEach(r=>{r.hidden=!(normalize(r.textContent).includes(q)&&(g==='all'||r.dataset.priceGroup===g)&&(branch==='all'||r.dataset.priceBranch===branch));if(!r.hidden)n++});document.querySelector('#price-count').textContent='Ценовых позиций: '+n;document.querySelector('#price-empty').hidden=n>0}
 priceSearch?.addEventListener('input',filterPrices);priceGroup?.addEventListener('change',filterPrices);
 const serviceSearch=document.querySelector('#service-search');serviceSearch?.addEventListener('input',filterServices);function filterServices(){if(!serviceSearch)return;let n=0;const q=normalize(serviceSearch.value);document.querySelectorAll('[data-service-group]').forEach(g=>{let group=0;g.querySelectorAll('[data-service-item]').forEach(e=>{e.hidden=!normalize(e.textContent).includes(q);if(!e.hidden){n++;group++}});g.hidden=group===0});document.querySelector('#service-count').textContent='Услуг в подразделах: '+n;document.querySelector('#service-empty').hidden=n>0}filterServices();
 document.querySelectorAll('[data-case-filter]').forEach(b=>b.addEventListener('click',()=>{let n=0;document.querySelectorAll('[data-case-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});document.querySelectorAll('[data-case-category]').forEach(c=>{c.hidden=b.dataset.caseFilter!=='all'&&c.dataset.caseCategory!==b.dataset.caseFilter;if(!c.hidden)n++});const count=document.querySelector('#case-count');if(count)count.textContent='Работ: '+n}));document.querySelector('[data-case-filter="all"]')?.click();
 let lastFocus=null;document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.dialog-close')?.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>lastFocus?.focus())});
 const modal=document.querySelector('#booking'),bs=document.querySelector('#booking-service'),bb=document.querySelector('#booking-branch'),bd=document.querySelector('#booking-doctor');
 const doctorLabel=document.querySelector('#booking-doctor-label');
 const bookingPhone=modal.querySelector('[data-clinic-phone]');
 function updateBookingPhone(){bookingPhone.href='tel:'+phones[bb.value][0]}
 function setBookingDoctor(doctor, availableBranches){
  bd.value=doctor;
  doctorLabel.hidden=!doctor;
  for(const option of bb.options){
   option.disabled=availableBranches.length>0&&option.value!=='all'&&!availableBranches.includes(option.value);
  }
 }
 document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',()=>{
  lastFocus=button;
  
  const currentOffer=document.querySelector('[data-offer-current]:not([data-offer-closed])');
  const service=button.dataset.service||currentOffer?.dataset.offerCurrent||'consult';
  const contextOption=bs.querySelector('[data-context]');
  contextOption?.remove();
  if(![...bs.options].some(option=>option.value===service)){
   const option=new Option(button.dataset.serviceLabel||service,service);
   option.dataset.context='1';
   bs.append(option);
  }
  bs.value=service;
  const availableBranches=button.dataset.doctorBranches?.split(' ')??[];
  setBookingDoctor(button.dataset.doctor||'',availableBranches);
  const preferred=Object.hasOwn(names,button.dataset.bookBranch)?button.dataset.bookBranch:branch;
  if(availableBranches.length===1){
   bb.value=availableBranches[0];
  }else{
   bb.value=[...bb.options].some(option=>option.value===preferred&&!option.disabled)?preferred:'all';
  }
  updateBookingPhone();
  modal.showModal();
 }));
 bb.addEventListener('change',updateBookingPhone);
 bs.addEventListener('change',()=>setBookingDoctor('',[]));
 let searchData;async function getSearch(){if(!searchData)searchData=fetch(pageUrl('/search-index.json')+assetRevision).then(r=>{if(!r.ok)throw Error();return r.json()});return searchData}
 function renderSearch(input){const box=input.closest('section,.dialog-inner'),out=box.querySelector('[data-search-results]'),count=box.querySelector('[data-search-count]'),q=normalize(input.value);if(!q){out.replaceChildren();count.textContent='Введите название услуги, имя врача или вопрос.';return}getSearch().then(data=>{const terms=q.split(/\s+/);if(normalize(input.value)!==q)return;const titleMatches=data.filter(x=>terms.every(t=>normalize(x.title).includes(t.length>5?t.slice(0,-2):t)));const found=titleMatches.length?titleMatches:data.filter(x=>terms.every(t=>normalize(x.title+' '+x.description).includes(t)));found.sort((a,b)=>Number(normalize(b.title).includes(q))-Number(normalize(a.title).includes(q)));out.replaceChildren();count.textContent=found.length?'Найдено страниц: '+found.length:'Совпадений нет. Попробуйте другой запрос.';for(const x of found.slice(0,30)){const a=document.createElement('a');a.className='search-result';a.href=pageUrl(x.url);const h=document.createElement('strong');h.textContent=x.title;const p=document.createElement('p');p.textContent=x.description;a.append(h,p);out.append(a)}}).catch(()=>{count.textContent='Поиск временно недоступен. Откройте каталог услуг.'})}
 document.querySelectorAll('#global-search,#page-search').forEach(i=>{i.addEventListener('input',()=>renderSearch(i));renderSearch(i)});document.querySelector('[data-search-open]')?.addEventListener('click',e=>{lastFocus=e.currentTarget;document.querySelector('#site-search').showModal();document.querySelector('#global-search').focus()});
 document.querySelectorAll('[data-review-widget]').forEach(b=>b.addEventListener('click',()=>{const frame=document.createElement('iframe');frame.src='https://yandex.ru/maps-reviews-widget/'+b.dataset.reviewWidget+'?comments';frame.title='Отзывы о клинике на Яндекс Картах';frame.width='100%';frame.height='600';frame.loading='lazy';frame.style.border='0';b.closest('.review-widget').replaceChildren(frame)}));setBranch(branch);
 const datedOffers = document.querySelectorAll('[data-offer-expiry],[data-offer-start]');
 if(datedOffers.length){
  const archive = document.querySelector('[data-offer-archive]');
  for(const offer of datedOffers){
   const expired=offer.dataset.offerExpiry&&offer.dataset.offerExpiry<today;
   const upcoming=offer.dataset.offerStart&&offer.dataset.offerStart>today;
   if(!expired&&!upcoming)continue;
   offer.setAttribute('data-offer-closed','');
   if(expired)offer.querySelector('[data-offer-date]').textContent='Срок завершился';
   if(offer.matches('.offer-tile')&&expired&&archive){
    archive.hidden=false;
    archive.querySelector('.offer-grid').append(offer);
   }else{
    offer.querySelectorAll('[data-offer-booking]').forEach(action=>action.hidden=true);
    offer.querySelectorAll('[data-offer-return]').forEach(action=>action.hidden=false);
   }
  }
  document.querySelectorAll('[data-offer-group]').forEach(section=>{
   section.hidden=!section.querySelector('.offer-tile');
   document.querySelector('[data-offer-tab="'+section.dataset.offerGroup+'"]').hidden=section.hidden;
  });
 }
 document.querySelectorAll('[data-tour-src]').forEach(button=>button.addEventListener('click',()=>{
  const frame = document.createElement('iframe');
  frame.src=button.dataset.tourSrc;
  frame.title='Виртуальная прогулка по клинике';
  frame.referrerPolicy='no-referrer';
  frame.allowFullscreen=true;
  button.closest('[data-tour-container]').replaceChildren(frame);
  frame.focus();
 }));

 const helper=document.querySelector('[data-slavik]');
 if(helper){
  const launch=helper.querySelector('.slavik-launch');
  const panel=helper.querySelector('.slavik-panel');
  const close=helper.querySelector('[data-slavik-close]');
  const reset=helper.querySelector('[data-slavik-reset]');
  const form=helper.querySelector('.slavik-form');
  const field=form.querySelector('input');
  const reply=helper.querySelector('.slavik-reply');
  const body=helper.querySelector('.slavik-body');
  const pageOffer=document.querySelector('[data-offer-id]')?.dataset.offerId;
  let knowledge, conversation={}, generation=0, queue=Promise.resolve();

  const hygieneOffer='professionalnaya-gigiena-5000';
  const brushOffer='shchyotka-beskonechnosti';
  const airFlowOffer='professionalnaya-chistka-polosti-rta-s-ispolzovaniem-ultrazvuka-i-air-flow';
  const implantConsult='konsultatsiya-khirurga-implantologa';
  const whiteningOffer='leto-s-belosnezhnoy-ulybkoy';
  const isCurrent=offer=>(!offer.start||offer.start<=today)&&(!offer.end||today<=offer.end);
  const call=key=>['Позвонить '+phones[key][1],'tel:'+phones[key][0]];
  const max=['Написать в MAX','https://max.ru/id5259125221_bot'];
  const hygienePage='/services/gigiena-i-profilaktika/professionalnaya-gigiena/';
  const implantPage='/services/implantatsiya-i-khirurgiya/';

  function toggleHelper(open){
   panel.hidden=!open;
   launch.setAttribute('aria-expanded',String(open));
   (open?close:launch).focus();
  }

  function getKnowledge(){
   if(!knowledge){
    knowledge=Promise.resolve(window.implant52Offline?.knowledge||fetch(pageUrl('/slavik-knowledge.json')+assetRevision)
     .then(response=>{if(!response.ok)throw Error('Knowledge unavailable');return response.json()}))
     .then(data=>({...data,rules:Object.entries(data.offers).map(([key,offer])=>[key,new RegExp(offer.aliases,'u')])}))
     .catch(error=>{knowledge=null;throw error});
   }
   return knowledge;
  }

  function offerReply(key,offer,query,preferred){
   const detail=['Условия предложения',offer.path+(preferred==='all'?'':'?branch='+preferred)];
   if(offer.end&&offer.end<today)return {
    text:'Предложение «'+offer.name+'» завершилось. Администратор подскажет, какие условия действуют сейчас.',
    links:[['Действующие акции','/offers/'],call(preferred)],
   };
   if(offer.start&&today<offer.start)return {text:'Программа «'+offer.name+'» начнётся '+offer.period.slice(2)+'.',links:[detail]};
   if(offer.end&&offer.end<'2026-12-01'&&/декабр/.test(query))return {
    text:offer.period+' действует предложение «'+offer.name+'». Условия на декабрь уточнит администратор.',
    links:[detail,call(preferred)],
   };
   let answer=offer.answer;
   const aboutBooking=/записаться|как записать|куда обращ|подобрать время|запиши/.test(query);
   const questions={
    [brushOffer]: [[/просроч|пропуст|опозда/,2],[/засчит|прошл|раньше|уже/,0],[/следующ|новую|замен|забрать|когда|где выда/,1]],
    [hygieneOffer]: [[/уже|был в|новым|первич|для кого|кто может|повторн/,0],[/зач[её]|доплат|в пакет/,1]],
    'shveytsarskiy-standart': [[/зач[её]|доплат|уже|прошл/,0],[/18 месяц|срок|с какого|сколько действ/,1]],
    [implantConsult]: [[/выда|получить сним|копи/,1],[/сним|томограф|клкт|кт|что входит|состав/,0]],
    'vtoroe-mnenie-besplatno': [[/без плана|нет плана/,1],[/бесплат|что входит|исследован/,0]],
    'ortho-gigiena-dostupna-vsem': [[/где устанав|другой клиник|не у вас/,0]],
    'podarite-sertifikat-': [[/действ|срок|месяц/,0],[/частич|остат|доплат/,1]],
    'privedi-druga-poluchi-1-000-na-lechenie': [[/когда|начисля|поступ/,0],[/списан|потрат|долго|срок/,1]],
    'tvoya-kapa-tvoi-pravila': [[/сколько.*визит|сколько раз|два раза/,0],[/когда.*готов|изготов|срок/,1]],
    'ulybka-molodozhenov': [[/документ|что взять/,1],[/скидк|какие услуг/,0]],
    'studencheskaya-zabota': [[/билет|документ|что взять/,0]],
   };
   const faq=questions[key]?.find(([pattern])=>pattern.test(query));
   if(faq)answer=offer.faq[faq[1]][1];
   else if(aboutBooking)answer=offer.first_step;
   else if(/что входит|состав|как проход/.test(query))answer=offer.includes;
   if(offer.end&&key!==whiteningOffer)answer+=' '+offer.period+'.';
   return {text:answer,links:aboutBooking?[detail,call(preferred),max]:[detail],offer:key};
  }

  function respond(question,data){
   const query=normalize(question).replace(/[\u00a0\u202f]/g,' ');
   const str=/никон|страж|революц/.test(query);
   const kaz=/казанск|сенн(?:ая|ой)|канатн/.test(query);
   const mentioned=str&&kaz?'all':str?'str':kaz?'kaz':'';
   if(mentioned)conversation.clinic=mentioned;
   const preferred=mentioned||conversation.clinic||branch;
   const branchQuery=preferred==='all'?'':'?branch='+preferred;
   const priceLink=['Посмотреть прайс','/prices/'+branchQuery];
   const bookingLink=['Запись в клинику','/patients/appointment/'+branchQuery];

   if(/болит|сильн\S* бол|остр\S* бол|флюс|опух|кровотеч|срочн.*прием/.test(query))return {
    text:'Позвоните в клинику и опишите ситуацию администратору. Он уточнит, кто из специалистов может принять вас и когда.',
    links:[call(preferred)],
   };
   const checkup=/beyke|бейк|карта здоровья зубов/.test(query);
   const whiteningBundle=/пакет|вместе/.test(query)&&/гигиен|чистк/.test(query)&&/flash|отбелив/.test(query);
   if(checkup||whiteningBundle)return {
    text:'Стоимость и доступность этого пакета уточнит администратор. Позвоните или напишите, чтобы проверить условия в выбранном филиале.',
    links:[call(preferred),max],
   };
   if(/дмс|страхов/.test(query))return {text:data.dms,links:[['Лечение по ДМС','/patients/dms/'],call(preferred)]};

   const matched=data.rules.filter(([,pattern])=>pattern.test(query));
   const exactOffer=(matched.find(([key])=>key!==whiteningOffer&&key!==hygieneOffer)||matched[0])?.[0];
   const contactQuestion=/адрес|как добр|как доех|где находит|парков|часы|график|режим|до скольки|со скольки|во сколько откры|открыва|выходн|воскрес|суббот|^клиники$|^филиалы$/.test(query);
   if(exactOffer)return offerReply(exactOffer,data.offers[exactOffer],query,preferred);
   if(contactQuestion||(/телефон|номер клиник/.test(query)&&!conversation.offer)){
    const allClinics=preferred==='all'||(!mentioned&&/филиалы|две клиники|обе клиники|оба филиала/.test(query));
    const clinics=allClinics?Object.values(data.clinics):[data.clinics[preferred]];
    const route=/как добр|как доех|парков|вход|где находит/.test(query);
    return {
     text:clinics.map(clinic=>clinic.name+' · '+clinic.hours+' · '+clinic.phone+'.'+(route?' '+clinic.route:'')).join('\n'),
     links:clinics.map(clinic=>['Как добраться · '+clinic.name,clinic.path]),
    };
   }
   const followup=/^(?:а |и )?(?:сколько|какая цена|до какого|когда|что входит|где заб|можно ли|если|я уже|срок|как получить|как записаться|на казан|на никон|на страж|уже|следующ|новую)/.test(query);
   const context=conversation.offer||pageOffer;
   const newTopic=/отдельн|консультац|врач|стоматолог|имплант|брекет|детск|рентген/.test(query);
   const newHygienePrice=/гигиен|чистк/.test(query)&&/сколько стоит|какая цена/.test(query);
   if(context&&followup&&!newTopic&&(!newHygienePrice||context===hygieneOffer)){
    return offerReply(context,data.offers[context],query,preferred);
   }
   if(/акци|скидк|спецпредлож|выгодн/.test(query)&&!/гигиен|чистк|имплант|брекет/.test(query)){
    const featured=[hygieneOffer,'parnaya-gigiena',implantConsult,whiteningOffer,brushOffer]
     .map(key=>data.offers[key]).filter(isCurrent);
    return {
     text:'Сейчас доступны '+featured.map(offer=>offer.name).join(', ')+'. Напишите название, и я подскажу условия.',
     links:[['Все действующие акции','/offers/']],
    };
   }
   if(/гигиен|чистк|налет/.test(query)){
    const special=data.offers[hygieneOffer];
    const regular=preferred==='all'?'от 7 200 ₽ за Norma':data.routineHygiene[preferred]+' за Norma';
    if(/сколько|стоим|стоит|цен[аыу]|акци/.test(query)){
     if(isCurrent(special)&&!/обычн|без акции|по прайсу|декабр/.test(query))return offerReply(hygieneOffer,special,query,preferred);
     return {text:'Профессиональная гигиена по прайсу - '+regular+'. Состав процедуры и итоговую цену уточните у администратора.',links:[priceLink,call(preferred)]};
    }
    const air=data.offers[airFlowOffer];
    return {text:'На профгигиене обсуждают удаление налёта и отложений, домашний уход и срок следующего визита. '+air.includes,links:[['Профессиональная гигиена',hygienePage]]};
   }
   if(/(?:консультац|первичн.*прием)/.test(query)&&/сколько|стоим|стоит|цен[аыу]|прайс/.test(query)){
    const orthodontist=/ортодонт/.test(query);
    const amount=data.consultations[preferred==='all'?'kaz':preferred][orthodontist?'orthodontist':'dentist'];
    return {text:'По прайсу первичная консультация '+(orthodontist?'ортодонта':'стоматолога')+' стоит '+amount+'. Состав приёма уточнит администратор.',links:[priceLink,bookingLink]};
   }
   if(/подготов|что взять|перв[ыо]\S* (?:прием|визит)/.test(query))return {
    text:data.firstVisit,links:[['Первый визит','/patients/first-visit/'],bookingLink],
   };
   if(/копи[яию]|результат.*сним|запрос.*документ|выдач.*документ|где справк/.test(query))return {
    text:data.documents,links:[['Документы клиники','/patients/documents/'],call(preferred)],
   };
   if(/запис|позвон|телефон/.test(query))return {
    text:'Можно записаться по телефону '+phones[preferred][1]+' или через MAX. Назовите удобный адрес и услугу. Администратор предложит время и подтвердит запись.',
    links:[call(preferred),max,bookingLink],
   };
   if(/имплант|all.on.[46]|все на [46четыр]/.test(query))return {
    text:'Отдельно рассчитывают установку имплантата и восстановление зуба коронкой или протезом. После обследования врач объяснит, какие этапы нужны и сколько стоит весь план.',
    links:[['Варианты имплантации',implantPage],bookingLink],
   };
   if(/ребен|детск/.test(query))return {
    text:'Для записи к детскому стоматологу назовите возраст ребёнка и удобный филиал. Администратор подберёт врача и уточнит, какие документы взять.',
    links:[['Детская стоматология','/services/detskaya-stomatologiya/'],call(preferred)],
   };
   if(/врач|специалист|стоматолог|гигиенист/.test(query))return {
    text:'Гигиенист проводит профессиональную гигиену, ортодонт занимается прикусом, а хирург-имплантолог обсуждает удаление и имплантацию. Если вы выбираете, с кого начать, администратор поможет с записью.',
    links:[['Врачи выбранной клиники','/doctors/'+branchQuery],call(preferred)],
   };
   if(/цен[аыу]|сколько сто|прайс|^сколько/.test(query))return {
    text:'Стоимость зависит от услуги и филиала. Напишите название процедуры. Могу подсказать, например, цену профгигиены или условия консультации имплантолога.',
    links:[priceLink],
   };
   return {text:'У меня есть ответы о ценах, акциях, филиалах и записи. По вашему вопросу лучше уточнить у администратора.',links:[call(preferred),max]};
  }

  function appendLinks(answer,links){
   if(!links?.length)return;
   const list=document.createElement('ul');
   for(const [label,url] of links){
    const item=document.createElement('li');
    const anchor=document.createElement('a');
    if(window.implant52Offline&&url.startsWith('/'))window.implant52Offline.link(anchor,url);
    else anchor.href=pageUrl(url);
    anchor.textContent=label;
    item.append(anchor);
    list.append(item);
   }
   answer.append(list);
  }

  function send(question){
   const version=generation;
   const turn=document.createElement('div');
   turn.className='slavik-turn';
   const prompt=document.createElement('p');
   prompt.className='slavik-question';
   prompt.textContent=question;
   const answer=document.createElement('div');
   answer.className='slavik-answer';
   const paragraph=document.createElement('p');
   paragraph.textContent='Проверяю условия…';
   answer.append(paragraph);
   turn.append(prompt,answer);
   reply.append(turn);
   reply.hidden=false;
   reset.hidden=false;
   if(reply.childElementCount>12)reply.firstElementChild.remove();
   body.scrollTop=body.scrollHeight;

   queue=queue.then(async ()=>{
    if(version!==generation)return;
    let result;
    try{
     const data=await getKnowledge();
     if(version!==generation)return;
     result=respond(question,data);
     conversation.offer=result.offer||'';
    }catch{
     result={text:'Сейчас справочник не загрузился. Администратор подскажет условия и поможет с записью.',links:[call(branch),max]};
    }
    if(version!==generation)return;
    paragraph.textContent=result.text;
    appendLinks(answer,result.links);
    body.scrollTop=body.scrollHeight;
   });
  }

  launch.addEventListener('click',()=>toggleHelper(panel.hidden));
  close.addEventListener('click',()=>toggleHelper(false));
  reset.addEventListener('click',()=>{
   generation++;
   conversation={};
   queue=Promise.resolve();
   reply.replaceChildren();
   reply.hidden=true;
   reset.hidden=true;
   field.focus();
  });
  helper.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&!panel.hidden){event.stopPropagation();toggleHelper(false);}
  });
  helper.querySelectorAll('[data-suggest]').forEach(button=>button.addEventListener('click',()=>send(button.dataset.suggest)));
  form.addEventListener('submit',event=>{
   event.preventDefault();
   const question=field.value.trim();
   if(!question)return;
   send(question);
   field.value='';
  });
 }
})();
