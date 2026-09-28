// Path copying — implementación completa.
// g++ -std=c++20 -Wall full-implementation.cpp -o pc && ./pc
//
// Las tres estructuras del mazo (stack, segment tree, trie), todas
// persistentes vía path copying: cada operación de escritura devuelve una
// raíz nueva sin tocar la raíz vieja.

#include <vector>
#include <string>
#include <cassert>
#include <iostream>
using namespace std;

// ---------------------------------------------------------------------
// Stack persistente (Algoritmo 2)
// ---------------------------------------------------------------------
struct StackNode {
    int value;
    StackNode* next;

    // Constructor explícito: 'val' es el elemento a guardar, 'nxt' es el tope de la versión anterior
    StackNode(int val, StackNode* nxt = nullptr) : value(val), next(nxt) {}
};

StackNode* stackPush(StackNode* s, int x) {
    return new StackNode(x, s);
}

// ---------------------------------------------------------------------
// Segment tree persistente (Algoritmo 3), combinar = suma
// ---------------------------------------------------------------------
struct SegNode {
    long long value;
    SegNode* left;
    SegNode* right;

    // Constructor explícito: valor y punteros a los hijos izquierdo y derecho
    SegNode(long long val = 0, SegNode* l = nullptr, SegNode* r = nullptr)
        : value(val), left(l), right(r) {}
};

long long combinar(long long a, long long b) { return a + b; }

SegNode* segBuild(const long long* arr, int l, int r) {
    if (l == r) {
        return new SegNode(arr[l]);
    }
    int m = (l + r) / 2;
    SegNode* izq = segBuild(arr, l, m);
    SegNode* der = segBuild(arr, m + 1, r);
    return new SegNode(combinar(izq->value, der->value), izq, der);
}

SegNode* segUpdate(SegNode* nodo, int l, int r, int pos, long long val) {
    if (l == r) {
        return new SegNode(val);
    }
    int m = (l + r) / 2;
    SegNode* nuevoIzq = (pos <= m) ? segUpdate(nodo->left, l, m, pos, val) : nodo->left;
    SegNode* nuevoDer = (pos > m) ? segUpdate(nodo->right, m + 1, r, pos, val) : nodo->right;
    return new SegNode(combinar(nuevoIzq->value, nuevoDer->value), nuevoIzq, nuevoDer);
}

// "hacer la consulta normal desde ahí" — misma query para cualquier versión.
long long segQuery(SegNode* nodo, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return nodo->value;
    int m = (l + r) / 2;
    return combinar(segQuery(nodo->left, l, m, ql, qr), segQuery(nodo->right, m + 1, r, ql, qr));
}

// ---------------------------------------------------------------------
// Trie persistente (Algoritmo 4, con la corrección del caso base)
// ---------------------------------------------------------------------
constexpr int ALPHABET = 26;

struct TrieNode {
    bool isEnd;
    vector<TrieNode*> children;

    // Constructor explícito: define si es fin de palabra e inicializa los 26 hijos a nullptr
    TrieNode(bool end = false) : isEnd(end), children(ALPHABET, nullptr) {}
};

TrieNode* trieInsert(TrieNode* nodo, const string& s, size_t i) {
    TrieNode* nuevo = nodo ? new TrieNode(*nodo) : new TrieNode();
    if (i == s.size()) {
        nuevo->isEnd = true;
        return nuevo; // corrección: el pseudocódigo del profesor no retorna aquí
    }
    int c = s[i] - 'a';
    TrieNode* hijoViejo = nodo ? nodo->children[c] : nullptr;
    nuevo->children[c] = trieInsert(hijoViejo, s, i + 1);
    return nuevo;
}

bool trieContains(TrieNode* nodo, const string& s, size_t i) {
    if (!nodo) return false;
    if (i == s.size()) return nodo->isEnd;
    int c = s[i] - 'a';
    return trieContains(nodo->children[c], s, i + 1);
}

int main() {
    // --- Stack: versiones viejas siguen consultables y bifurcables ---
    StackNode* s0 = nullptr;
    auto s1 = stackPush(s0, 7);
    auto s2 = stackPush(s1, 2);
    auto s3 = stackPush(s2, 42); // Rama A: 42 -> 2 -> 7
    auto s4 = stackPush(s2, 99); // Rama B (bifurca desde el pasado s2): 99 -> 2 -> 7

    assert(s3->value == 42 && s3->next == s2);
    assert(s4->value == 99 && s4->next == s2); // s3 y s4 coexisten y comparten s2 (2 -> 7)
    assert(s2->value == 2 && s2->next == s1);
    assert(s1->value == 7 && s1->next == nullptr);
    assert(s0 == nullptr);

    // --- Segment tree: el diagrama del profesor, 4 hojas, update(pos=4) ---
    long long arr[5] = {0, 1, 1, 1, 1}; // índices 1..4 (1-indexado, como el profesor)
    auto v1 = segBuild(arr, 1, 4);
    assert(segQuery(v1, 1, 4, 1, 4) == 4);

    auto v2 = segUpdate(v1, 1, 4, 4, 100);

    // El punto del tema: la versión vieja v1 NO cambió tras el update.
    assert(segQuery(v1, 1, 4, 1, 4) == 4);
    assert(segQuery(v1, 1, 4, 4, 4) == 1);

    // La versión nueva v2 sí refleja el cambio.
    assert(segQuery(v2, 1, 4, 4, 4) == 100);
    assert(segQuery(v2, 1, 4, 1, 4) == 103);

    // Compartición: el hijo izquierdo de la raíz ([1,2]) es el MISMO nodo
    // en ambas versiones — no se copió.
    assert(v1->left == v2->left);
    assert(v1->right != v2->right); // [3,4] sí se copió
    assert(v1->right->left == v2->right->left); // [3,3] compartido dentro de [3,4]

    // --- Trie: inserciones persistentes, versiones viejas siguen consultables ---
    TrieNode* t0 = nullptr;
    auto t1 = trieInsert(t0, "ab", 0);
    auto t2 = trieInsert(t1, "ac", 0);

    assert(trieContains(t1, "ab", 0));
    assert(!trieContains(t1, "ac", 0)); // t1 no tiene "ac": no cambió con el insert de t2
    assert(trieContains(t2, "ab", 0));
    assert(trieContains(t2, "ac", 0));
    assert(!trieContains(t2, "a", 0)); // "a" no es palabra completa (esFinal falso)

    cout << "OK: todos los asserts de path copying pasaron.\n";
    return 0;
}
