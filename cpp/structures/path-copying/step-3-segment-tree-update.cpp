// Paso 3 — Update del segment tree persistente (Algoritmo 3 del profesor).
//
// Copia exactamente un nodo por nivel del camino raíz-hoja de `pos`: el
// hijo que no está en el camino se comparte con la versión vieja, sin
// copiarse. `combinar` es la del segment tree efímero (aquí, suma), el
// mismo prerrequisito ya cubierto en /structures/segment-tree.

using namespace std;

struct SegNode {
    long long value;
    SegNode* left;
    SegNode* right;

    // Constructor explícito: valor y punteros a los hijos izquierdo y derecho
    SegNode(long long val = 0, SegNode* l = nullptr, SegNode* r = nullptr)
        : value(val), left(l), right(r) {}
};

long long combinar(long long a, long long b) { return a + b; }

// nuevo <- copia de nodo ;
// si l = r entonces nuevo.valor <- val ;
// en otro caso
//     m <- floor((l+r)/2) ;
//     si pos <= m entonces nuevo.izq <- Update(nodo.izq, l, m, pos, val) ;
//     en otro caso nuevo.der <- Update(nodo.der, m+1, r, pos, val) ;
//     nuevo.valor <- combinar(nuevo.izq.valor, nuevo.der.valor) ;
// devolver nuevo ;
SegNode* update(SegNode* nodo, int l, int r, int pos, long long val) {
    if (l == r) {
        return new SegNode(val);
    }
    int m = (l + r) / 2;
    SegNode* nuevoIzq = (pos <= m) ? update(nodo->left, l, m, pos, val) : nodo->left;
    SegNode* nuevoDer = (pos > m) ? update(nodo->right, m + 1, r, pos, val) : nodo->right;
    return new SegNode(combinar(nuevoIzq->value, nuevoDer->value), nuevoIzq, nuevoDer);
}

// Construcción efímera inicial (prerrequisito, no repetida como tema nuevo).
SegNode* build(const long long* arr, int l, int r) {
    if (l == r) {
        return new SegNode(arr[l]);
    }
    int m = (l + r) / 2;
    SegNode* izq = build(arr, l, m);
    SegNode* der = build(arr, m + 1, r);
    return new SegNode(combinar(izq->value, der->value), izq, der);
}

// Consulta normal (la misma para cualquier versión: ver query-old-version.md).
long long query(SegNode* nodo, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0; // fuera de rango, elemento neutro de la suma
    if (ql <= l && r <= qr) return nodo->value;
    int m = (l + r) / 2;
    return combinar(query(nodo->left, l, m, ql, qr), query(nodo->right, m + 1, r, ql, qr));
}

