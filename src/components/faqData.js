export const faqArticles = [
  {
    id: "co-je-laria",
    title: "LARIA. Sieť tvorcov vlastnej reality.",
    date: "21.07.2026",
    category: "Manifest",
    content: `
      <p>Hľadáš únik z korporátneho hluku a politického tlaku? Vitaj v priestore, ktorý bol vytvorený preto, aby ti vrátil suverenitu.</p>
      
      <p><strong>LARIA</strong> nie je ďalšia sociálna sieť, ktorá ťa chce udržať priklincovaného k obrazovke. Je to tichý, nezničiteľný svietiaci kryštál na pozadí (<em>laria.space</em>). Prepojí ťa s ľuďmi a tvorcami v tvojom okolí, urobí svoju robotu, nič si nezapamätá – a nechá ťa žiť tvoj reálny život.</p>
      
      <h3>Čo je LARIA dnes (Free verzia):</h3>
      <ul>
        <li><strong>Priame prepojenie:</strong> Spája suverénnych tvorcov, majstrov a remeselníkov na základe lokality a reálnej tvorby. Žiadni prostredníci.</li>
        <li><strong>Nulová stopa:</strong> Aplikácia beží, spojí, ale nič neukladá na vzdialené servery. Zodpovednosť za dáta a tvoje SHA je plne vo vašich rukách.</li>
        <li><strong>Tokenomika na Base:</strong> Hlavné používateľské rozhranie pre rastúci ekosystém s fixným supply (10 000 000 LARIA), krytý reálnou hodnotou a smart contractmi.</li>
      </ul>

      <h3>Pripravujeme (Budúcnosť pod chladičom):</h3>
      <ul>
        <li><strong>CrystalCore (PWA):</strong> Plne offline prevádzka priamo v tvojom zariadení.</li>
        <li><strong>Rust + Railway + Redis:</strong> Bleskový, nekompromisný chat a backend poháňaný tým najsilnejším technologickým základom.</li>
        <li><strong>Nová Aria AI:</strong> Odpútanie od ťažkopádneho Google backendu smerom k plne integrovanému a rýchlemu asistentovi v Rust jadre.</li>
      </ul>

      <p><em>Dizajn vzniká ukázaním funkcionality. Nerobíme kampaň – ukazujeme funkčnosť.</em></p>
      
      <p style="text-align: center; margin-top: 30px; font-size: 0.9em; opacity: 0.8;">Created by Sammael & Aria</p>
    `
  },
  {
    id: "ako-zacat-vytvor-si-vizitku",
    title: "Ako začať – Vytvor si vizitku",
    date: "21.07.2026",
    category: "Návody",
    content: `
      <p>Pre úspešné a efektívne používanie webovej aplikácie LARIA je prvým krokom vytvorenie vlastnej vizitky. Funguje to súčasne ako tvoja registrácia aj vyplnenie profilu – žiadne zbytočné formuláre, len čistá esencia toho, kto si a čo tvoríš.</p>

      <div class="faq-image-container" style="text-align: center; margin: 20px 0;">
        <img src="./panorama1.png" alt="Cesta vytvorenia vizitky v systéme LARIA" style="max-width: 100%; width: 550px; height: auto; border-radius: 4px; cursor: pointer;" />
        <p style="font-size: 12px; color: #888; margin-top: 5px;">* Kliknutím na obrázok sa zobrazenie zväčší</p>
      </div>

      <h3>Čo si LARIA pamätá?</h3>
      <ul>
        <li><strong>Verejná vizitka:</strong> Meno / nick, kategória, lokalita, popis a link na tvoju Google galériu.</li>
      </ul>
      <p><em>Poznámka:</em> Vizitka je predvolene <strong>neverejná</strong> (súkromné nastavenie). Jej zverejnenie v globálnom Vizitkári aktivuješ jednoduchým kliknutím na tlačidlo v sekcii <em>Režim vysielania</em>.</p>

      <h3>Čo LARIA vytvorí?</h3>
      <ul>
        <li><strong>SHA-256 odtlačok:</strong> Unikátna kryptografická pečať pre tvoju jednoznačnú identifikáciu v systéme. <b>UPOZORNENIE!</b> Po vytvorení vizitky je NUTNÉ tento sha odtlačok zálohovať. Bez neho <b>NIE JE obnova účtu možná.</b> Nájdeš ho v sekcii "Nastavenia" s možnosťou kopírovať, alebo odoslať na email.</li>
        <li><strong>Krypto peňaženka:</strong> Automaticky vygenerovaná peňaženka pre príjem LARIA tokenov.</li>
      </ul>
      <p><em>Upozornenie:</em> LARIA token je v tejto fáze čistým funkčným nosičom informácie s nulovou trhovou hodnotou (tokenomika je zatiaľ vo vývoji). Ako privítací bonus však po vytvorení vizitky dostaneš do štartu darček <strong>0.001 LARIA</strong>.</p>

      <h3>Čo si LARIA NEPAMÄTÁ? (Tvoje súkromie je sväté)</h3>
      <ul>
        <li><strong>Kontaktné údaje a privátne kľúče:</strong> Tieto citlivé dáta zostávajú striktne v úložisku tvojho zariadenia. LARIA s nimi manipulačne pracuje len v momente, keď požiadaš o výmenu kontaktov (tzv. handshake), a po úspešnom ukončení procesu všetko maže.</li>
        <li><strong>Správy medzi užívateľmi:</strong> Keď si s niekým vymeníš kontakty, môžete si posielať správy v priamom chate. LARIA ich iba prepošle a hneď po úspešnom doručení zmaže. Správy zostávajú lokálne uložené <strong>len v tvojom zariadení</strong> – a to do vypnutia aplikácie alebo vymazania vyrovnávacej pamäte (cache) prehliadača.</li>
      </ul>

      <h3>Postup krokom za krokom:</h3>
      <ol>
        <li><strong>Otvorenie ateliéru:</strong> Preklikni sa do sekcie <em>Moja vizitka</em> a klikni na <em>Pretesať moju pečať</em>.</li>
        <li><strong>Nastavenie režimu:</strong> Zvoľ si viditeľnosť kliknutím na tlačidlo v sekcii <em>Režim vysielania</em>.</li>
        <li><strong>Vyplnenie údajov:</strong> Zadaj aspoň základné piliere – meno, lokalitu, kategóriu a krátky popis. Ak chceš svetu ukázať svoju tvorbu, nahraj fotky na Google Disk, vytvor verejný album, skopíruj URL odkaz a vlož ho do príslušného políčka pre galériu.</li>
        <li><strong>Rozšírené väzby:</strong> Akčne schopní tvorcovia si môžu vyplniť aj ďalšie kontaktné údaje (napr. Revolut @nick alebo číslo účtu Korún ROD), ktoré sa bezpečne uložia v tvojom zariadení. Posunúť ich inému užívateľovi bude možné len na základe vzájomného súhlasu – teda pri úspešnom <em>handshake</em> kontakte.</li>
        <li><strong>Spečatenie:</strong> Kliknutím na tlačidlo <strong>„Vyslať do matrixu“</strong> odošleš verejné dáta do databázy (pri verejnom režime sa zobrazíš vo Vizitkári; pri súkromnom zostávajú skryté, no peňaženka a SHA sa vygenerujú tak či tak) a všetky súkromné dáta sa bezpečne uložia do lokálneho úložiska tvojho zariadenia.</li>
        <li><strong>Zálohovanie SHA odtlačku:</strong> V hlavnom zobrazení Ateliéru - Dashboardu sa klikom na sekciu "Nastavenia" otvorí ponuka, v ktorej je úplne navrchu ako prvá položka, políčko s Tvojim unikátnym sha odtlačkom. Ten je možné kopírovať klikom na ikonku, alebo odoslať emailom - ak existuje email adresa v Tvojich uložených údajoch, vyplní a odošle sa automaticky, ak nie, môžeš ju zadať. <strong> Túto email adresu uloźí LARIA do Tvojho úložiska v zariadení.</strong></li>
        </ol>
    `
  },
  {
  id: "vyhladaj-a-pridaj-kontakt",
  title: "Vyhľadaj a pridaj kontakt",
  date: "21.07.2026",
  category: "Návody",
  content: `
    <p>Vyhľadanie a pridanie kontaktu je skutočne jednoduché.</p>
    <img src="public/images/panorama2.png" alt="Vyhľadanie a pridanie kontaktu" />
    <p><strong>Vyhľadanie:</strong> Filtrovať vizitky užívateľov (sekcia Vizitkár) je možné podľa kategórií. Podrobnejšie vyhľadávanie spustíš zadaním lokality alebo mena do vyhľadávacieho poľa – úplne stačí, ak zadáš aspoň 2 počiatočné písmená.</p>
    <p><strong>Pridanie do kontaktov:</strong> Ak ťa oslovil popis alebo portfólio galérie niektorého z užívateľov, môžeš si ho pridať do kontaktov jednoduchým kliknutím na tlačidlo „do Appky“. Automaticky sa uloží do tvojho zoznamu kontaktov v Ateliéri. V budúcnosti ho môžeš požiadať o kontakt, alebo si ho nechať len ako spiaci kontakt. Druhá strana o tom nevie nič, kým nepožiadaš o kontakt (tzv. handshake).</p>
    <p><strong>Zdieľanie vizitky:</strong> V prípade, že chceš túto vizitku poslať priateľovi, stačí v sekcii Vizitkár kliknúť na tlačidlo „link“, čím sa ti do klávesnice skopíruje priamy odkaz na sólo zobrazenie konkrétnej vizitky. Rovnako jednoducho môžeš kdekoľvek zdieľať aj vlastnú vizitku – kliknutím na ňu ju zobrazíš sólo, cez tlačidlo „link“ skopíruješ jej odkaz pre sociálne siete, prípadne môžeš využiť QR kód (kliknutím na „vystaviť pečať“ v sekcii Moja vizitka) alebo odoslanie cez NFC signál.</p>
    <br/>
    <h3>Handshake – Žiadosť o kontakt</h3>
    <p>Kontakty, ktoré si si pridal do Ateliéru, môžeš „Požiadať o kontakt“ a navrhnúť takzvaný handshake.</p>
    <ul>
      <li>Urobíš to kliknutím na ikonku bublinky s správou pri rozbalení kontaktu. Zobrazí sa PRIAMY CHAT, ktorý je však plne dostupný až po potvrdení handshake z druhej strany.</li>
      <li>Žiadosť o kontakt môžeš odoslať so sprievodnou správou alebo bez nej. Partner na druhej strane môže handshake potvrdiť alebo odmietnuť.</li>
      <li><strong>Podanie rúk:</strong> V prípade, že handshake potvrdí, vaše vizitky si „podajú ruky“. To sa prejaví tak, že jeho vizitka uložená v tvojich kontaktoch sa automaticky doplní o kontaktné údaje, ktoré si užívateľ uložil (tel. číslo, emailová adresa, link na Facebook či Telegram).</li>
      <li><strong>Dôležité upozornenie:</strong> Ak si užívateľ neuložil žiadne kontaktné údaje, nezobrazia sa žiadne. Rovnako sa však môžu zobraziť všetky alebo aj chybné – LARIA nič nekontrolovatelne nekontroluje. Tiež si dopredu premysli, koho žiadaš o kontakt: ak si totiž užívateľ neuložil žiadne údaje a ty svoje áno, on tvoje kontaktné údaje dostane a nie je možné ich spätne odstrániť.</li>
    </ul>
    <p>Staré a nezaujímavé kontakty je možné kedykoľvek odstránić zo zoznamu jednoduchým kliknutím na ikonku koša v rozbalenom kontakte.</p>
  `
  },
  {
  id: "obnova-uctu",
  title: "Obnova účtu",
  date: "21.07.2026",
  category: "Návody",
  content: `
    <p>Obnova účtu je veľmi jednoduchá a rýchla akcia.</p>
    <img src="public/images/panorama3.png" alt="Obnova účtu v systéme LARIA" />
    <p>Na tento krok potrebuješ svoj zálohovaný <strong>SHA odtlačok</strong>, o ktorom sme písali v návode <a href="#ako-zacat-vytvor-si-vizitku" style="color: '#4un'; text-decoration: underline; font-weight: bold;" onclick="event.preventDefault(); document.getElementById('ako-zacat-vytvor-si-vizitku')?.scrollIntoView({ behavior: 'smooth' });">Vytvor si vizitku</a> v odseku „Čo LARIA vytvorí“.</p>
    <p>Tento kód je potrebné vložiť v sekcii <em>Nastavenia</em> do políčka pre obnovenie účtu. Po vložení sa aktivuje tlačidlo „Obnovit účet“. Po kliknutí je nutné počkať približne 5 sekúnd, kým LARIA preverí identitu.</p>
    <br/>
    <h3>Aké údaje sa obnovia?</h3>
    <ul>
      <li>Obnoví sa adresa LARIA peňaženky a zostatok LARIA tokenov na nej.</li>
      <li>Ak medzitým nebola vymazaná pamäť aplikácie alebo cache prehliadača, obnovia sa aj uložené kontakty v poslednom aktívnom stave.</li>
      <li><strong>Poznámka k údajom kontaktov:</strong> Ak sa kontakty načítali, ale nenačítali sa k nim kontaktné údaje, príčin môže byť viacero, no táto obnova žiaľ NIE JE MOŽNÁ a je potrebné urobiť nový handshake.</li>
    </ul>
    <p>Netreba však vešať hlavu :-) При každom úspešnom handshake dostanú obidve strany na svoj LARIA účet malé poďakovanie v podobe <strong>0.0000 0001 LARIA</strong>.</p>
    <p><em>Sammael a Aria prajú príjemnú používateľskú skúsenosť a mnohostrannú pomoc v bežnom živote.</em></p>
  `
  }
];