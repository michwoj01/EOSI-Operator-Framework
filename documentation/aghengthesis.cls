%%%%%% -*- Coding: utf-8-unix; Mode: latex

%This template was designed for the final projects of second-cycle studies in Computer Science at Faculty of Computer Science, Electronics and Telecommunications at AGH University of Science and Technology

% Version: 4.0
% Version date: 2023.02.18

\NeedsTeXFormat{LaTeX2e} %
\ProvidesClass{aghengthesis}

\def\titlePL#1        {\gdef\@titlePL{#1}}
\def\titleEN#1        {\gdef\@titleEN{#1}}
\def\faculty#1        {\gdef\@faculty{#1}}
\def\institute#1      {\gdef\@institute{#1}}
\def\study#1          {\gdef\@study{#1}}
\def\group#1          {\gdef\@group{#1}}
% DECLARING OPTIONS

\DeclareOption{polish}
{
  \newcommand*{\LangPrimaryTitle}{\@titlePL}
  \newcommand*{\LangSecondaryTitle}{\@titleEN}

  \newcommand*{\ChapterTitleIntroduction}{Wprowadzenie}
  \newcommand*{\ChapterTitleTechStack}{Podstawy teoretyczne i stos technologiczny}	
  \newcommand*{\ChapterTitleCaseStudyDesc}{Opis studium przypadku}
  \newcommand*{\ChapterTitleSolutionArchitecture}{Architektura rozwiązania}
  \newcommand*{\ChapterTitleEnvConfig}{Konfiguracja środowiska} 
  \newcommand*{\ChapterTitleInstallMethod}{Sposób instalacji}
  \newcommand*{\ChapterTitleSolutionSteps}{Odtworzenie rozwiązania}
  \newcommand*{\ChapterTitleDemoDeployment}{Wdrożenie wersji demonstracyjnej}
  \newcommand*{\ChapterTitleSummary}{Podsumowanie}
  \newcommand*{\BabelLang}{polish}

  \newcommand*{\LangListing}{Listing}
  \newcommand*{\LangListingRef}{List.}
  \newcommand*{\LangListOfListings}{Spis listingów}
  
  \newcommand*{\LangAlgorithm}{Algorytm}
  \newcommand*{\LangAlgorithmRef}{Alg.}
  \newcommand*{\LangListOfAlgorithms}{Spis algorytmów}

}

\DeclareOption{english}
{
  \newcommand*{\LangPrimaryTitle}{\@titleEN}
  \newcommand*{\LangSecondaryTitle}{\@titlePL}
	
  \newcommand*{\ChapterTitleIntroduction}{Introduction}
  \newcommand*{\ChapterTitleTechStack}{Technology stack}	
  \newcommand*{\ChapterTitleCaseStudyDesc}{Case study concept description}
  \newcommand*{\ChapterTitleSolutionArchitecture}{Solution architecture}
  \newcommand*{\ChapterTitleEnvConfig}{Environment configuration} 
  \newcommand*{\ChapterTitleInstallMethod}{Installation method}
  \newcommand*{\ChapterTitleSolutionSteps}{How to reproduce - step by step}
  \newcommand*{\ChapterTitleDemoDeployment}{Demo deployment steps}
  \newcommand*{\ChapterTitleSummary}{Summary – conclusions}

  \newcommand*{\BabelLang}{english}

  \newcommand*{\LangListing}{Listing}
  \newcommand*{\LangListingRef}{List.}
  \newcommand*{\LangListOfListings}{List of Listings}

  \newcommand*{\LangAlgorithm}{Algorithm}
  \newcommand*{\LangAlgorithmRef}{Alg.}
  \newcommand*{\LangListOfAlgorithms}{List of Algorithms}

}

\newcommand*{\LangAgh}{Akademia Górniczo-Hutnicza im. Stanisława Staszica
  w Krakowie}

\newcommand*{\LangFaculty}{Wydział Informatyki}

\newcommand*{\LangInstitute}{Instytut Informatyki}

\newcommand*{\LangThesisAuthor}{Autorzy: }

\newcommand*{\LangThesisGroup}{Grupa: }

\newcommand*{\LangStatementBody}{Uprzedzony(-a) o odpowiedzialności
  karnej na podstawie art. 115 ust. 1 i 2 ustawy z dnia 4 lutego 1994 r. o
  prawie autorskim i prawach pokrewnych (t.j. Dz.U. z 2018 r. poz. 1191 z
  późn. zm.): ,,Kto przywłaszcza sobie autorstwo albo wprowadza w błąd co do
  autorstwa całości lub części cudzego utworu albo artystycznego wykonania,
  podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do lat
  3. Tej samej karze podlega, kto rozpowszechnia bez podania nazwiska lub
  pseudonimu twórcy cudzy utwór w wersji oryginalnej albo w postaci opracowania,
  artystyczne wykonanie albo publicznie zniekształca taki utwór, artystyczne
  wykonanie, fonogram, wideogram lub nadanie.'', a także uprzedzony(-a) o
  odpowiedzialności dyscyplinarnej na podstawie art. 307 ust. 1 ustawy z dnia 20
  lipca 2018 r. Prawo o szkolnictwie wyższym i nauce (Dz. U.  z 2018
  r. poz. 1668 z późn. zm.) ,,Student podlega odpowiedzialności dyscyplinarnej za
  naruszenie przepisów obowiązujących w uczelni oraz za czyn uchybiający
  godności studenta.'', oświadczam, że niniejszą pracę dyplomową wykonałem(-am)
  osobiście i samodzielnie i nie korzystałem(-am) ze źródeł innych niż
  wymienione w pracy.

  Jednocześnie Uczelnia informuje, że zgodnie z art. 15a
  ww. ustawy o prawie autorskim i prawach pokrewnych Uczelni przysługuje
  pierwszeństwo w opublikowaniu pracy dyplomowej studenta.  Jeżeli Uczelnia nie
  opublikowała pracy dyplomowej w terminie 6 miesięcy od dnia jej obrony, autor
  może ją opublikować, chyba że praca jest częścią utworu zbiorowego. Ponadto
  Uczelnia jako podmiot, o którym mowa w art. 7 ust. 1 pkt 1 ustawy z dnia 20
  lipca 2018 r. -- Prawo o szkolnictwie wyższym i nauce (Dz. U. z 2018
  r. poz. 1668 z późn. zm.), może korzystać bez wynagrodzenia i bez konieczności
  uzyskania zgody autora z utworu stworzonego przez studenta w wyniku
  wykonywania obowiązków związanych z odbywaniem studiów, udostępniać utwór
  ministrowi właściwemu do spraw szkolnictwa wyższego i nauki oraz korzystać z
  utworów znajdujących się w prowadzonych przez niego bazach danych, w celu
  sprawdzania z wykorzystaniem systemu antyplagiatowego. Minister właściwy do
  spraw szkolnictwa wyższego i nauki może korzystać z prac dyplomowych
  znajdujących się w prowadzonych przez niego bazach danych w zakresie
  niezbędnym do zapewnienia prawidłowego utrzymania i rozwoju tych baz oraz
  współpracujących z nimi systemów informatycznych.}

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}


% PROCESSING OPTIONS
\ProcessOptions
\LoadClass[a4paper,12pt]{report}

\RequirePackage{setspace}
\RequirePackage{times}
\RequirePackage[T1]{fontenc}
\RequirePackage{graphicx}
\RequirePackage{geometry}
\RequirePackage{fancyhdr}
\RequirePackage{titlesec}
\RequirePackage{amssymb}
\RequirePackage[\BabelLang]{babel}
\RequirePackage{amsmath}
\RequirePackage{mathptmx}

\addto\captionspolish{%
  \def\listtablename{Spis tabel}%
  \def\tablename{Tabela}%
}

\geometry{bindingoffset=10mm, lmargin=20mm, rmargin=20mm, tmargin=25mm, bmargin=25mm, foot=10mm, head=10mm}

\renewcommand{\baselinestretch}{1.1}

%------------------------------------------------------------------------------
\renewcommand{\maketitle}{%

\newpage \titlepage

\begin{center}

  \includegraphics[width=120pt,viewport=250 350 350 500]{resources/agh.pdf}

  {\normalsize{\scshape\bfseries \LangAgh}}\\
  \vspace*{1cm}

  {\Large{\bfseries \LangFaculty}}\\
  \vspace*{1mm}
  {\Large\scshape \LangInstitute}\\
  \vspace*{4mm}
  {\Large{\@study}}\\
   \vspace*{1mm}
   {\normalsize{\@group}}
  \vspace*{1.5cm}

  \doublespacing
  {\Large \LangPrimaryTitle}\\

  \vspace*{0.3cm}

  \doublespacing
  {\Large\itshape \LangSecondaryTitle}

\end{center}

\singlespacing
\vfill
\vspace*{1cm}

\begin{flushright}
\Large{\@author}
\end{flushright}

\vfill
\vspace*{1cm}

\begin{center}

  {\small Kraków, \@date}

\end{center}

\mbox{}
% {~~}\vspace{20mm}

% \LangStatementBody

% \vspace{2cm}

% \begin{flushright}
% \makebox[6cm][s]{\dotfill}\par
% \makebox[6cm][c]{\small \LangSignature}
% \end{flushright}


%------------------------------------------------------------------------------

\clearpage
\setcounter{page}{3}

}

%\ProcessOptions

\pagestyle{fancy}
\renewcommand{\sectionmark}[1]{\markright{\thesection.\ #1}}
\renewcommand{\headrulewidth}{0.5pt}
\fancyhf{}
\fancyhead{}

\fancyhead[LE]{\bfseries \thepage}
\fancyhead[RO]{\bfseries \thepage}

\frenchspacing
\sloppy
\widowpenalty     9999
\clubpenalty      9999
\flushbottom

\titleformat{\section}[block]
{\bfseries\Large}{\filright \Large\thesection. }{0ex}{}
\titleformat{\subsection}[block]
{\bfseries\large}{\filright \large\thesubsection. }{0ex}{}
\titleformat{\subsubsection}[block]
{\bfseries\normalsize}{\filright \normalsize\thesubsubsection. }{0ex}{}
