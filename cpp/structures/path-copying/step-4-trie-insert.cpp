// Paso 4 — Insert del trie persistente (Algoritmo 4 del profesor).
//
// Corrección silenciosa respecto a las diapositivas: el pseudocódigo del
// profesor marca nuevo.esFinal <- verdadero en el caso base (i = |s|) pero
// no retorna ahí, y sigue a c <- s[i], que indexa fuera de la cadena. Aquí
// se agrega el "devolver nuevo" dentro del caso base, como corresponde.

#include <vector>
#include <string>
using namespace std;

constexpr int ALPHABET = 26;

struct TrieNode {
    bool isEnd = false;
    vector<TrieNode*> children;
    TrieNode() : children(ALPHABET, nullptr) {}
};

// nuevo <- copia de nodo ;
// si i = |s| entonces
//      nuevo.esFinal <- verdadero ;
//      devolver nuevo ;                 // <- corrección: faltaba en las diapositivas
// en otro caso
//      c <- s[i] ;
//      hijoViejo <- nodo.hijos[c] (o un Trie vacío si no existe) ;
//      nuevo.hijos[c] <- Insert(hijoViejo, s, i+1) ;
//      devolver nuevo ;
TrieNode* insert(TrieNode* nodo, const string& s, size_t i) {
    auto base = nodo ? nodo : new TrieNode(); // "Trie vacío si no existe"
    auto nuevo = new TrieNode(*base);
    if (i == s.size()) {
        nuevo->isEnd = true;
        return nuevo;
    }
    int c = s[i] - 'a';
    auto hijoViejo = nodo ? nodo->children[c] : nullptr;
    nuevo->children[c] = insert(hijoViejo, s, i + 1);
    return nuevo;
}

