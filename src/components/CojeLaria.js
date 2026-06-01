import React, { useEffect } from 'react';
import { faqArticles } from './faqData';
import './fakturant.css'; // 🔥 Master prelinkovanie, ktoré odteraz všetko zjednocuje

const CojeLaria = () => {
  
  // Funkcia, ktorá odroluje na článok a aktualizuje URL pre zdieľanie pomocou skratky ?art=
  const handleArticleClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Aktualizujeme URL bez reloadu stránky s použitím kľúča 'art'
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('art', id);
      window.history.pushState({}, '', `${window.location.pathname}?${currentParams.toString()}`);
    }
  };

  // Efekt, ktorý po otvorení odkazu hľadá skratku ?art= a odroluje na správny článok
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetArticleId = urlParams.get('art'); // Hľadáme parameter 'art'
    
    if (targetArticleId) {
      // Timeout, aby sa stihol React plne vykresliť v DOMe
      const timer = setTimeout(() => {
        const element = document.getElementById(targetArticleId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
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
                
                {/* 🔗 Tlačidlo na skopírovanie odkazu s čistým ?art= parametrík-om */}
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?art=${article.id}`;
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