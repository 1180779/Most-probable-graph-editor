# Wstęp i definicje

Rozważany problem polega na znalezieniu minimalnego rozszerzenia grafu G₂ tak, aby zawierał on graf G₁ jako podgraf. Problem ten jest ściśle powiązany z klasycznym zagadnieniem znajdowania najmniejszego wspólnego nadgrafu (MCS, minimum common supergraph) dla grafów G₁ i G₂. Rozwiązanie problemu MCS jest ściśle związane z problemem maksymalnego wspólnego podgrafu (mcs, maximum common subgraph) [Bunke 2000].

Wyróżnia się dwa główne warianty problemu mcs (mające istotne konsekwencje dla definicji MCS i jego rozmiaru), por. [Fuchs 2025]:

- Maksymalny wspólny podgraf indukowany (mcis, maximum common induced subgraph) – poszukiwany podgraf jest indukowany.
- Maksymalny wspólny podgraf krawędziowy (mces, maximum common edge subgraph) – podgraf nie musi być indukowany.

Wiele prac (np. [Krone et al. 2017]) koncentruje się na wariancie indukowanym. W naszym zadaniu, gdzie celem jest minimalizacja rozmiaru rozszerzenia, kluczowy jest wariant nieindukowany (mces). W dalszej części pracy pokażemy, że poszukiwane minimalne rozszerzenie grafu G₂ jest tożsame z MCS(G₁, G₂), a jego konstrukcja opiera się na znalezieniu mces(G₁, G₂).

Poniżej formalizujemy pojęcia (graf, multigraf, podgraf, macierz sąsiedztwa, rozmiar, izomorfizm), a następnie definiujemy metrykę i notację złożoności.

## Definicje

### Graf
Graf skierowany to para G = (V, E), gdzie:
- V to skończony zbiór wierzchołków V = {v₁, …, vₙ},
- E ⊆ V × V to skończony zbiór krawędzi, E = {(vᵢ, vⱼ) : vᵢ, vⱼ ∈ V}.

### Multigraf (por. Bollobás 1998)
Multigraf nieskierowany to trójka G = (V, E, ψ), gdzie:
- V – skończony zbiór wierzchołków,
- E – zbiór etykiet krawędzi (krawędzie mogą się powtarzać jako różne etykiety),
- ψ: E → {{u, v} : u, v ∈ V} przypisuje każdej krawędzi jej końce.

Dopuszcza się wielokrotne krawędzie: istnieją e₁ ≠ e₂ ∈ E takie, że ψ(e₁) = ψ(e₂). Jeśli ψ(e) = {v, v}, to e jest pętlą.

Dla multigrafu skierowanego obraz funkcji ψ zmieniamy na uporządkowane pary (u, v).

### Podgraf
Niech G = (V, E) i G′ = (V′, E′). Mówimy, że G′ ⊆ G (G′ jest podgrafem G), jeśli:
- V′ ⊆ V,
- E′ ⊆ E.

### Macierz sąsiedztwa
Macierz sąsiedztwa skierowanego grafu G = (V, E) to macierz M o wymiarach |V| × |V|,
gdzie, dla uporządkowania V = {v₁, …, v|V|},
- M[i, j] = 1, jeśli (vᵢ, vⱼ) ∈ E,
- M[i, j] = 0 w przeciwnym razie.

Dla multigrafu:
- M[i, j] = liczba krawędzi z vᵢ do vⱼ.

Analogicznie dla multigrafu skierowanego.

### Rozmiar grafu
Rozmiar grafu S(G) definiujemy jako S(G) = |V| + |E|.
Gdy kontekst jest jasny, piszemy S zamiast S(G).

### Izomorfizm grafów
Niech G = (V, E) i G′ = (V′, E′). Izomorfizm f: V → V′ jest bijekcją taką, że:
- dla każdej krawędzi (u, v) ∈ E istnieje krawędź (f(u), f(v)) ∈ E′,
- oraz w drugą stronę: dla (u′, v′) ∈ E′ istnieje (f⁻¹(u′), f⁻¹(v′)) ∈ E.

W multigrafach wymagamy zachowania liczności krawędzi między odpowiednimi parami końców:
dla każdej krawędzi e ∈ E o końcach {u, v} istnieje krawędź e′ ∈ E′ o końcach {f(u), f(v)} i odwrotnie; analogicznie dla wersji skierowanej.

Jeśli f jest izomorfizmem G z pewnym G′ oraz G′ ⊆ G″, to f nazywamy izomorfizmem podgrafu z G do G″ (to jest izomorfizm G z podgrafem G″).

### Wspólny podgraf i największy wspólny podgraf
Dla grafów G₁ = (V₁, E₁), G₂ = (V₂, E₂), wspólny podgraf to G = (V, E), dla którego istnieją izomorfizmy podgrafów G → G₁ i G → G₂.

Jeśli nie ma większego wspólnego podgrafu (w sensie S = |V| + |E|), to G jest największym wspólnym podgrafem mcs(G₁, G₂).

Analogicznie dla multigrafów.

### Wspólny nadgraf i najmniejszy wspólny nadgraf
Wspólny nadgraf G = (V, E) dla G₁, G₂ to graf, do którego istnieją izomorfizmy podgrafów G₁ → G i G₂ → G.

Najmniejszy wspólny nadgraf (MCS) to wspólny nadgraf o minimalnym rozmiarze S.

Analogicznie dla multigrafów.

## Metryka

Odległość edycyjna grafów (graph edit distance) [Fuchs 2025] minimalizuje koszt transformacji jednego grafu w drugi, operując na dodawaniu/usuwaniu/zamianie wierzchołków i krawędzi.

Na potrzeby zadania definiujemy prostą metrykę δ na zbiorze skończonych multigrafów. Dla G₁, G₂ niech x, y oznaczają odpowiednio liczbę wierzchołków i krawędzi, które trzeba dodać lub usunąć, by przekształcić G₁ w G₂, przy czym x + y jest minimalne. Definiujemy δ(G₁, G₂) = x + y.

Szkic dowodu, że δ jest metryką:
- Identyczność: δ(G₁, G₂) = 0 ⇒ G₁ = G₂ (z definicji).
- Symetria: operacje dodawania/usuwania wierzchołków/krawędzi odwrotnie przekształcają G₂ w G₁, więc łączny koszt jest ten sam.
- Nierówność trójkąta: modyfikując G₁ → G₂ → G₃, suma kosztów nie jest większa niż bezpośredni koszt G₁ → G₃. Sprzeczność zakładająca naruszenie trójkąta zostaje obalona.

## Notacja złożoności

Stosujemy notację O(·): f(n) = O(g(n)) wtedy i tylko wtedy, gdy istnieją k > 0 oraz n₀ ∈ N, takie że dla wszystkich n > n₀ zachodzi f(n) ≤ k · g(n).

- Opisuje to asymptotyczne górne ograniczenie czasu/pamięci.
- Przyjmujemy, że operacje elementarne mają koszt stały.

# Najmniejsze rozszerzenie

Dane: grafy wejściowe G₁ i G₂. Szukamy minimalnego rozszerzenia G₂ (nazwijmy je G), takiego że istnieje izomorfizm podgrafu z G₁ do G. Minimalizujemy S(G) = |V| + |E|.

Wystarczy rozszerzyć G₂ do MCS(G₁, G₂). Jest to rozszerzenie minimalne.

Dowód (skrócony):
- Szukany graf Gₑ jest rozszerzeniem G₂, zawiera jako podgraf graf izomorficzny z G₁ i ma minimalny rozmiar.
- Gₑ spełnia dokładnie warunki najmniejszego wspólnego nadgrafu G₁ i G₂.
- Zatem Gₑ = MCS(G₁, G₂).

## Konstrukcja MCS na podstawie mces

Załóżmy, że mamy wynik algorytmu mcs dla G₁, G₂ w postaci optymalnego mapowania M_best: iniekcji z podzbioru V₁ w podzbiór V₂. To mapowanie definiuje wierzchołki i krawędzie składające się na największy wspólny podgraf.

Intuicja konstrukcji rozszerzenia:
- Startujemy z G₂ i „dokładamy” do niego elementy G₁, które nie znalazły odpowiedników w mcs:
    - nowe wierzchołki (te z V₁ nie zmapowane przez M_best),
    - brakujące krawędzie (gdy liczność krawędzi między obrazami par wierzchołków w G₂ jest mniejsza niż w G₁).

### Algorytm (opis słowny)

Wejście: G₁, G₂ i M_best (mapowanie z G₁ do G₂; jeśli wyznaczono je odwrotnie, odwrócenie zajmuje czas liniowy).

1) Zainicjalizuj G_MCS jako kopię G₂.
2) Utwórz tablicę φ₁ mapującą wierzchołki G₁ do wierzchołków G_MCS:
    - jeśli wierzchołek uᵢ ∈ V₁ ma obraz w M_best, ustaw φ₁[i] na odpowiedni wierzchołek w V₂,
    - w przeciwnym razie dodaj nowy wierzchołek w G_MCS i przypisz jego indeks do φ₁[i].
3) Uzupełnij brakujące krawędzie:
    - dla każdej pary (uᵢ, uⱼ) w V₁:
        - policz c₁ = liczba krawędzi z uᵢ do uⱼ w G₁,
        - niech vᵢ′ = φ₁[i], vⱼ′ = φ₁[j],
        - policz c_MCS = liczba krawędzi z vᵢ′ do vⱼ′ w G_MCS,
        - jeśli c₁ > c_MCS, dodaj Δ_E = c₁ − c_MCS krawędzi z vᵢ′ do vⱼ′ w G_MCS.

Wynik: G_MCS jest najmniejszym wspólnym nadgrafem (MCS) G₁ i G₂, a zarazem minimalnym rozszerzeniem G₂, które zawiera G₁ jako podgraf.

## Poprawność konstrukcji

- G₂ jest podgrafem G_MCS, bo startujemy od kopii G₂ i nic nie usuwamy.
- G₁ jest podgrafem G_MCS poprzez φ₁:
    - φ₁ jest iniekcją na wierzchołkach (dodajemy brakujące wierzchołki),
    - dla każdej pary (uᵢ, uⱼ) zapewniamy, że liczba krawędzi między obrazami w G_MCS nie jest mniejsza niż w G₁.

### Minimalność rozmiaru

Niech G_mcs to największy wspólny podgraf G₁ i G₂. Rozmiar MCS(G₁, G₂) spełnia:

- |V_MCS| = |V₁| + |V₂| − |V_mcs| (łączymy przez zmapowane wierzchołki),
- |E_MCS| = suma po parach (u, v) z maksymalnych liczności krawędzi w G₁ i G₂ po „złączeniu” wierzchołków zgodnie z mcs,
- w konsekwencji:
  S(MCS(G₁, G₂)) = S(G₁) + S(G₂) − S(mcs(G₁, G₂)).

Konstrukcja dodaje dokładnie:
- |V₁| − |V_mcs| nowych wierzchołków,
- dla każdej pary odpowiadających wierzchołków tyle krawędzi, by osiągnąć maksimum z liczności G₁ i G₂.

Gdyby istniał wspólny nadgraf mniejszy niż G_MCS, musiałby:
- „zaoszczędzić” wierzchołki – co oznacza większe złączenie i tym samym większy mcs, sprzeczność,
- „zaoszczędzić” krawędzie – ale minimalna liczba krawędzi jest wyznaczona przez konieczność pomieszczenia obu grafów, tj. maksimum liczności per para, co już realizujemy.

Wniosek: G_MCS ma minimalny rozmiar.

## Złożoność konstrukcji

Załóżmy reprezentację macierzową. Niech n₁ = |V₁| i n₂ = |V₂|.

- Inicjalizacja: wyliczenie |V_MCS| i alokacja macierzy O((n₁ + n₂)²), kopiowanie G₂ to O(n₂²).
- Mapowanie wierzchołków: O(n₁).
- Uzupełnianie krawędzi: dwie pętle po V₁, czyli O(n₁²), operacje wewnątrz O(1).

Łącznie: O((n₁ + n₂)²).  
Pamięciowo: macierz G_MCS rozmiaru do (n₁ + n₂)² oraz tablica φ₁ rozmiaru n₁, czyli O((n₁ + n₂)²).

# Algorytm dokładny (mcs)

Proponujemy algorytm przeszukiwania z nawrotami (backtracking) wzorowany na podejściu McGregora [McGregor 1982] do znajdowania największego wspólnego podgrafu (w sensie S = |V| + |E|) dla skierowanych multigrafów G₁ = (V₁, E₁) i G₂ = (V₂, E₂). Bez straty ogólności zakładamy |V₁| ≤ |V₂|.

## Idea

Budujemy częściowe odwzorowanie M: V₁ → V₂ (iniekcja na podzbiorze V₁). Dla każdego wierzchołka uₖ ∈ V₁ rozważamy:
- pominięcie (nie wchodzi do wspólnego podgrafu),
- przypisanie do dowolnego jeszcze nieużytego vⱼ ∈ V₂.

Przy dodawaniu pary (uₖ, vⱼ) aktualizujemy bieżący wynik S_cur: +1 za wierzchołek oraz za krawędzie liczymy wkład jako minimum z liczności odpowiednich krawędzi między już zmapowanymi parami (zarówno w kierunku uᵢ → uₖ, jak i uₖ → uᵢ), plus pętle. Backtracking cofa przypisania i bada inne gałęzie.

## Poprawność

- Indukcyjnie pokazujemy, że S_cur poprawnie odzwierciedla sumę |V| + |E| dla podgrafu określonego przez bieżące mapowanie M.
- W liściach (po rozpatrzeniu wszystkich wierzchołków V₁) porównujemy S_cur z najlepszym S_best i zapamiętujemy najlepsze M_best.
- Zupełność: drzewo przeszukiwań systematycznie odwiedza wszystkie iniekcje na podzbiorach V₁ → V₂, więc optymalne rozwiązanie jest odwiedzane.

## Złożoność

- Rozmiar drzewa: głębokość n = |V_A| (mniejszy graf), rozgałęzienie do m + 1, gdzie m = |V_B|. W najgorszym razie liczba węzłów O((m + 1)ⁿ).
- Koszt węzła: obliczanie przyrostu ΔS w czasie O(k) dla poziomu k, a zatem O(n) w najgorszym przypadku; próby mapowania do m wierzchołków dają O(m · n) na węzeł.
- Całość: O(n · m · (m + 1)ⁿ).
- Pamięć dodatkowa: O(n) (mapowanie) + O(m) (użyte wierzchołki) + O(m) (najlepsze mapowanie) + O(n) (stos rekurencji) = O(n + m). Z uwzględnieniem macierzy wejściowych: O(n² + m²).

# Algorytm aproksymacyjny (genetyczny)

Ponieważ dokładne mcs jest z natury wykładnicze, stosujemy algorytm genetyczny do przybliżenia rozwiązania dla G₁ = (V₁, E₁) i G₂ = (V₂, E₂), zakładając |V₁| ≤ |V₂|.

## Reprezentacja osobnika

Osobnik reprezentuje iniekcję φ: V₁′ → V₂′, gdzie V₁′ ⊆ V₁, V₂′ ⊆ V₂. Implementujemy ją przez:
- M: tablica długości |V₁|, gdzie M[i] = j oznacza φ(uᵢ) = vⱼ, a M[i] = −1 oznacza brak mapowania; wymagamy iniekcji (brak powtórzeń wartości ≠ −1).
- f: wartość dopasowania.

## Inicjalizacja

- Wielkość populacji P₀: |V₂|².
- Dla każdego osobnika:
    - losujemy V₁′ ⊆ V₁ i V₂′ ⊆ V₂ o |V₂′| = |V₁′|,
    - losujemy iniekcję M: V₁′ → V₂′,
    - ustawiamy f = 0 (obliczane później).

## Funkcja oceny

- f = liczba zmapowanych wierzchołków + suma po parach (i, j) zmapowanych indeksów z min(liczba krawędzi i→j w G₁, liczba krawędzi M[i]→M[j] w G₂).
- Jest to zgodne z S = |V| + |E| dla wspólnego podgrafu indukowanego przez mapowanie M.

## Selekcja, krzyżowanie, mutacja

- Selekcja: wybieramy najlepszą połowę populacji (według f).
- Krzyżowanie: operator typu OX1 (Order Crossover) zastosowany do tablic M (z zachowaniem iniekcji).
- Mutacja: z pewnym prawdopodobieństwem p_m dla każdej pozycji:
    - jeśli M[i] = −1 i istnieją wolne wierzchołki docelowe, możemy przypisać nowy,
    - jeśli M[i] ≠ −1, możemy odmapować (ustawić −1),
    - utrzymujemy zbiór wolnych celów, aby zachować iniekcję.

## Pętla ewolucyjna i warunek stopu

- Maksymalna liczba iteracji: 100 · |V₂|.
- W każdej iteracji: tworzymy nową populację przez selekcję, krzyżowanie i mutacje, oceniamy, aktualizujemy najlepszego osobnika.
- Zwracamy najlepszego osobnika po spełnieniu warunku stopu; jego mapowanie wyznacza przybliżony wspólny podgraf.

## Złożoność

Niech n = |V₁|, m = |V₂|, populacja ma rozmiar m², liczba iteracji to Θ(m).

- Inicjalizacja: m² osobników; losowanie podzbiorów i iniekcji można wykonać w O(m)–O(n) na osobnika; konserwatywnie O(m³).
- Selekcja: sortowanie populacji m² – koszt O(m² log m²) na iterację.
- Krzyżowanie: O(n) na dziecko, odtwarzamy ~m²/2 dzieci ⇒ O(n · m²) na iterację.
- Mutacja: przygotowanie zbioru wolnych celów O(m), przejście po M O(n) – per osobnik O(m + n); łącznie O(m²(m + n)) zwykle dominuje składnik O(n · m²).
- Ocena: dla osobnika O(n²) (wszystkie pary zmapowanych pozycji), dla populacji m² osobników ⇒ O(n² · m²) na iterację.
- Całość (po m iteracjach): O(m³ log m² + n² m³).  
  Pamięć: O(n · m²) na populację (m² osobników, każdy trzyma tablicę długości n).

# Od mces do MCS: podsumowanie

- Minimalne rozszerzenie G₂ zawierające G₁ jako podgraf to MCS(G₁, G₂).
- Budujemy je, startując z G₂ i dodając elementy G₁ brakujące względem mcs(G₁, G₂) (nowe wierzchołki i brakujące krawędzie).
- Rozmiar MCS spełnia S(MCS) = S(G₁) + S(G₂) − S(mcs(G₁, G₂)).
- Dajemy dwa podejścia do mcs: dokładne (backtracking, wykładnicze) oraz aproksymacyjne (genetyczne, m³ iteracji, populacja m²).

# Literatura (wspomniana w tekście)

- Bunke, H. (2000). Graph matching: Theoretical foundations, algorithms, and applications.
- Bollobás, B. (1998). Modern Graph Theory.
- McGregor, J. J. (1982). Backtrack search algorithms and the maximal common subgraph problem.
- Fuchs, F. (2025). Graph edit distance: A survey and new results.
- Krone, M. et al. (2017). Induced maximum common subgraph approaches.
- OX1 (Order Crossover) – klasyczny operator krzyżowania dla permutacji.
- Zetzsche (2025) – Fisher–Yates i generowanie permutacji/podzbiorów.