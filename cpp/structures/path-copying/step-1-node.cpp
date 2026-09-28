// Paso 1 — los nodos de las tres estructuras, nada más.
//
// Path copying no tiene un "nodo propio": aplica sobre nodos de estructuras
// ya conocidas. Aquí van los tres que usa el material: el nodo de un stack
// enlazado, el nodo de un segment tree, y el nodo de un trie. Ninguno se
// muta después de construido: cada operación crea nodos nuevos y comparte
// el resto por puntero.

#include <vector>
using namespace std;

// --- Stack persistente ---
struct StackNode {
    int value;
    StackNode* next = nullptr;
};

// --- Segment tree persistente ---
struct SegNode {
    long long value = 0; // resultado de combinar(izq, der), o el valor de la hoja
    SegNode* left = nullptr;
    SegNode* right = nullptr;
};

// --- Trie persistente (alfabeto reducido a minúsculas 'a'-'z') ---
constexpr int ALPHABET = 26;

struct TrieNode {
    bool isEnd = false;
    vector<TrieNode*> children;
    TrieNode() : children(ALPHABET, nullptr) {}
};

