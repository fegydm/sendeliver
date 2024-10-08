Projekt sendeliver spaja odosielatelov s dopravcami. Pre odoielatela najde najvhodnejsieho dopravcu a pre dopravcu najde najvhodnejsi naklad.
Struktura projektu je rozdelena na back a front. Back je express.js server prepojeny na databazu postgre. Front je kniznica React
/project-root
  /back
    /src
      - routes (tu budú backendové route definície pre API)
      - controllers (tu budú logické kontroléry pre API volania)
      - models (databázové modely, ak používaš napr. MongoDB alebo SQL)
    - app.js (hlavný súbor Express aplikácie)
    - package.json (závislosti a skripty pre backend)
    
  /front
    /src
      /components
        - Header.js
        - Footer.js
        - SenderPage.js
        - HaulerPage.js
        - HomePage.js
      /routes
        - HomePageRoute.js
        - SenderPageRoute.js
        - HaulerPageRoute.js
      /utils
        - api.js (volania na backend API)
      - App.js (základný routing aplikácie)
      - index.js (hlavný vstupný bod React aplikácie)
    - package.json (závislosti pre frontend)
  
  - README.md (inštrukcie pre projekt)
  - .gitignore
  - package.json (ak používaš monorepo manažment)
