import React, { useEffect } from 'react';
import { faqArticles } from './faqData';
import './fakturant.css'; // 🔥 Master prelinkovanie, ktoré odteraz všetko zjednocuje

const CojeLaria = () => {
  
  // Funkcia pre odrolovanie na článok a aktualizáciu URL s dvojúrovňovým Hash (/#/co-je-laria/article-id)
  const handleArticleClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Aktualizujeme URL bez reloadu stránky s zachovaním sekcie co-je-laria
      window.history.pushState(null, '', `/#/co-je-laria/${id}`);
    }
  };

  // Efekt, ktorý pri načítaní stránky skontroluje Hash (/#/co-je-laria/article-id) a odroluje na článok
  useEffect(() => {
    const scrollToHashArticle = () => {
      const hash = window.location.hash; // napr. "#/co-je-laria/obnova-uctu"
      if (hash) {
        // Rozdelíme hash podľa '/' -> ["#", "co-je-laria", "obnova-uctu"]
        const parts = hash.split('/');
        const targetArticleId = parts[2]; // Vezmeme 2. úroveň (ID článku)
        
        if (targetArticleId) {
          const timer = setTimeout(() => {
            const element = document.getElementById(targetArticleId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 300); // 300ms počká na vykreslenie DOM-u
          
          return () => clearTimeout(timer);
        }
      }
    };

    // 1. Skontrolujeme hneď pri namontovaní komponentu
    scrollToHashArticle();

    // 2. Počúvame zmeny v hash (ak niekto klikne na externý link pri otvorenej appke)
    window.addEventListener('hashchange', scrollToHashArticle);
    return () => window.removeEventListener('hashchange', scrollToHashArticle);
  }, []);

  return (
    <div className="info-core-container">
      
      {/* HLAVNÝ NADPIS + PODNADPIS */}
      <div className="info-core-header">        
        <h2 className="info-core-title">
          Informačné Jadro
        </h2>
      </div>

      {/* Hlavný flex layout */}
      <div className="info-core-layout">
        
        {/* BOČNÝ INDEXOVANÝ OBSAH */}
        <aside className="info-core-aside">
          <h4 className="info-core-aside-title">
            OBSAH:
          </h4>
          <ul className="info-core-nav-list">
            {faqArticles.map((article, index) => (
              <li key={`nav-${article.id}`} className="info-core-nav-item">
                <button
                  onClick={() => handleArticleClick(article.id)}
                  className="info-core-nav-btn"
                >
                  {index + 1}. {article.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* SEKCOVANÉ ČLÁNKY */}
        <div className="info-core-content">
          {faqArticles.map((article) => (
            <article 
              key={article.id} 
              id={article.id}
              className="info-core-article"
            >
              {/* Meta informácie o článku */}
              <div className="info-core-meta">
                <span className="info-core-category">
                  [{article.category.toUpperCase()}]
                </span>
                <span>{article.date}</span>
                
                {/* 🔗 Tlačidlo na skopírovanie odkazu s elegantným /#/co-je-laria/id */}
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}#/co-je-laria/${article.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`Odkaz na článok "${article.title}" bol skopírovaný!`);
                  }}
                  className="info-core-share-btn"
                >
                  Zdieľať článok 🔗
                </button>
              </div>

              {/* Nadpis článku */}
              <h3 className="info-core-article-title">
                {article.title}
              </h3>

              {/* Samotný obsah */}
              <div 
                className="info-core-body"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </article>
          ))}
        </div>

      </div>

      <div className="system-footer" style={{ textAlign: 'center', marginTop: '60px' }}>
        LARIA SYSTEM CORE | KNIŽNICA VEDOMOSTÍ
      </div>
    </div>
  );
};

export default CojeLaria;