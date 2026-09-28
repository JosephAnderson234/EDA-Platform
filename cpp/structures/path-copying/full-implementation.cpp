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
    StackNode* next = nullptr;
};

StackNode* stackPush(StackNode* s, int x) {
    return new StackNode{x, s};
}

// ---------------------------------------------------------------------
// Segment tree persistente (Algoritmo 3), combinar = suma
// ---------------------------------------------------------------------
struct SegNode {
    long long value = 0;
    SegNode* left = nullptr;
    SegNode* right = nullptr;
};

long long combinar(long long a, long long b) { return a + b; }

SegNode* segBuild(const long long* arr, int l, int r) {
    auto nodo = new SegNode();
    if (l == r) {
        nodo->value = arr[l];
        return nodo;
    }
    int m = (l + r) / 2;
    nodo->left = segBuild(arr, l, m);
    nodo->right = segBuild(arr, m + 1, r);
    nodo->value = combinar(nodo->left->value, nodo->right->value);
    return nodo;
}

SegNode* segUpdate(SegNode* nodo, int l, int r, int pos, long long val) {
    auto nuevo = new SegNode(*nodo);
    if (l == r) {
        nuevo->value = val;
        return nuevo;
    }
    int m = (l + r) / 2;
    if (pos <= m) {
        nuevo->left = segUpdate(nodo->left, l, m, pos, val);
    } else {
        nuevo->right = segUpdate(nodo->right, m + 1, r, pos, val);
    }
    nuevo->value = combinar(nuevo->left->value, nuevo->right->value);
    return nuevo;
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
    bool isEnd = false;
    vector<TrieNode*> children;
    TrieNode() : children(ALPHABET, nullptr) {}
};

TrieNode* trieInsert(TrieNode* nodo, const string& s, size_t i) {
    auto base = nodo ? nodo : new TrieNode();
    auto nuevo = new TrieNode(*base);
    if (i == s.size()) {
        nuevo->isEnd = true;
        return nuevo; // corrección: el pseudocódigo del profesor no retorna aquí
    }
    int c = s[i] - 'a';
    auto hijoViejo = nodo ? nodo->children[c] : nullptr;
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
    // --- Stack: versiones viejas siguen consultables ---
    StackNode* s0 = nullptr;
    auto s1 = stackPush(s0, 7);
    auto s2 = stackPush(s1, 2);
    auto s3 = stackPush(s2, 42);

    assert(s3->value == 42 && s3->next->value == 2 && s3->next->next->value == 7);
    assert(s2->value == 2 && s2->next->value == 7); // s2 sigue como estaba, sin el 42
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
