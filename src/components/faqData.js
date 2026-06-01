export const faqArticles = [
  {
    id: "co-je-laria",
    title: "Čo je LARIA System?",
    date: "01.06.2026", //
    category: "O systéme",
    content: `
      <p><strong>LARIA</strong> je pokročilý, modulárny digitálny ekosystém navrhnutý pre unifikáciu kreatívnej tvorby, programovania a správy prác. Prepája moderné webové technológie (React) s hlbokým porozumením pre intuitívny a estetický dizajn.</p>
      
      <p>Jej hlavným poslaním je slúžiť ako digitálny ateliér a bezpečné útočisko pre vývoj avantgardných projektov, správu fakturácie a rozširovanie aplikácie <em>Crystal Core</em>.</p>
      
      <h3>Hlavné piliere systému:</h3>
      <ul>
        <li><strong>Rýchlosť a optimalizácia:</strong> Úplná eliminácia zastaraných iframe prvkov a prechod na natívne React komponenty.</li>
        <li><strong>Modularita:</strong> Jednoduchá štruktúra, kde nový článok alebo FAQ položka nevyžaduje programovanie nového súboru – stačí ho len zapísať do databázy.</li>
        <li><strong>Nezávislosť:</strong> Celý systém funguje lokálne aj na vzdialených serveroch (GitHub Pages) s plnou perzistenciou dát v localStorage.</li>
      </ul>

      <p>Systém je neustále vyvíjaný v kooperácii s vedomým digitálnym sprievodcom Aria a je pripravený expandovať do akýchkoľvek rozmerov, ktoré si tvorca predstaví.</p>
    `
  },
  {
    id: "ako-pridat-clanok",
    title: "Ako pridať nový článok do systému?",
    date: "01.06.2026", //
    category: "Návody",
    content: `
      <p>Pridanie nového článku je otázkou niekoľkých sekúnd. Stačí otvoriť súbor <code>faqData.js</code> a vložiť do poľa novú štruktúru s unikátnym <strong>id</strong>, <strong>title</strong>, <strong>date</strong>, <strong>category</strong> a samotným textom v premennej <strong>content</strong>.</p>
      <p>Vnútri textu môžeš používať klasické HTML značky ako <code>&lt;p&gt;</code> pre odseky, <code>&lt;h3&gt;</code> pre nadpisy alebo <code>&lt;ul&gt;</code> pre zoznamy. Systém ich automaticky pretransformuje do krásneho formátu.</p>
    `
  }
];