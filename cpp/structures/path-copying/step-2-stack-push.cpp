// Paso 2 — Push del stack persistente (Algoritmo 2 del profesor).
//
// El caso degenerado de path copying: el "camino" mide un solo nodo, así
// que Push no copia nada de la pila vieja, sólo crea el nodo nuevo.

using namespace std;

struct StackNode {
    int value;
    StackNode* next = nullptr;
};

// nuevo <- nodo con valor x y siguiente <- S ;
// devolver nuevo ;        // S (la versión vieja) sigue intacta
StackNode* push(StackNode* s, int x) {
    return new StackNode{x, s};
}

