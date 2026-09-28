// Paso 3 — Update del segment tree persistente (Algoritmo 3 del profesor).
//
// Copia exactamente un nodo por nivel del camino raíz-hoja de `pos`: el
// hijo que no está en el camino se comparte con la versión vieja, sin
// copiarse. `combinar` es la del segment tree efímero (aquí, suma), el
// mismo prerrequisito ya cubierto en /structures/segment-tree.

using namespace std;

struct SegNode {
    long long value = 0;
    SegNode* left = nullptr;
    SegNode* right = nullptr;
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
    auto nuevo = new SegNode(*nodo); // copia el nodo actual (izq/der apuntan a lo viejo)
    if (l == r) {
        nuevo->value = val;
        return nuevo;
    }
    int m = (l + r) / 2;
    if (pos <= m) {
        nuevo->left = update(nodo->left, l, m, pos, val);
        // nuevo->right ya apunta al subárbol viejo: compartido, no se copia.
    } else {
        nuevo->right = update(nodo->right, m + 1, r, pos, val);
        // nuevo->left ya apunta al subárbol viejo: compartido, no se copia.
    }
    nuevo->value = combinar(nuevo->left->value, nuevo->right->value);
    return nuevo;
}

// Construcción efímera inicial (prerrequisito, no repetida como tema nuevo).
SegNode* build(const long long* arr, int l, int r) {
    auto nodo = new SegNode();
    if (l == r) {
        nodo->value = arr[l];
        return nodo;
    }
    int m = (l + r) / 2;
    nodo->left = build(arr, l, m);
    nodo->right = build(arr, m + 1, r);
    nodo->value = combinar(nodo->left->value, nodo->right->value);
    return nodo;
}

// Consulta normal (la misma para cualquier versión: ver query-old-version.md).
long long query(SegNode* nodo, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0; // fuera de rango, elemento neutro de la suma
    if (ql <= l && r <= qr) return nodo->value;
    int m = (l + r) / 2;
    return combinar(query(nodo->left, l, m, ql, qr), query(nodo->right, m + 1, r, ql, qr));
}

