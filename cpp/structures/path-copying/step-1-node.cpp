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
    StackNode* next;

    // Constructor explícito: 'val' es el dato almacenado, 'nxt' es el puntero al nodo previo (tope anterior)
    StackNode(int val, StackNode* nxt = nullptr) : value(val), next(nxt) {}
};

// --- Segment tree persistente ---
struct SegNode {
    long long value;
    SegNode* left;
    SegNode* right;

    // Constructor explícito: 'val' es el valor agregado del rango, 'l' y 'r' son los hijos
    SegNode(long long val = 0, SegNode* l = nullptr, SegNode* r = nullptr)
        : value(val), left(l), right(r) {}
};

// --- Trie persistente (alfabeto reducido a minúsculas 'a'-'z') ---
constexpr int ALPHABET = 26;

struct TrieNode {
    bool isEnd;
    vector<TrieNode*> children;

    // Constructor explícito: define si es fin de palabra e inicializa los 26 hijos a nullptr
    TrieNode(bool end = false) : isEnd(end), children(ALPHABET, nullptr) {}
};

