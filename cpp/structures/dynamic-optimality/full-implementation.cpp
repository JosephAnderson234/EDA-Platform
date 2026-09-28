// dynamic-optimality — no hay algoritmo que implementar: es una pregunta
// abierta (`operations: []`), no una estructura. Forzar un "algoritmo de
// optimalidad dinámica" falsearía el tema.
//
// Lo honesto y útil, en cambio: para secuencias PEQUEÑAS (n llaves, m
// búsquedas), calcular OPT(S) por búsqueda EXHAUSTIVA sobre todos los BST
// posibles y todas las rotaciones posibles entre accesos, y compararlo
// contra (a) el mejor BST ESTÁTICO (sin rotar nunca) y (b) un BST que sí
// rota (heurística move-to-root, no el splay tree del curso — splay-tree es
// otro agente y no se reimplementa aquí).
//
// Cómo se calcula OPT(S) exactamente (no una aproximación):
//   1. Se enumeran TODOS los BST posibles sobre {1..n} (número de Catalán
//      C(n) formas; para n=4 son 14 árboles).
//   2. Se construye el grafo de rotaciones: dos árboles son vecinos si uno
//      se obtiene del otro con UNA rotación (costo unitario, según el
//      modelo computacional BST). Con sólo 14 nodos, BFS todo-contra-todo
//      es trivial.
//   3. Programación dinámica sobre la secuencia S: el estado es "qué árbol
//      es el actual"; el costo de pasar de un árbol a otro es su distancia
//      de rotación (BFS ya calculada), más la profundidad de buscar S[i] en
//      el árbol resultante. OPT(S) es el mínimo, sobre TODA la secuencia de
//      árboles intermedios, del costo total — exactamente la definición de
//      "óptimo offline" del tema (nadie construye el árbol a ciegas: se ve
//      toda S de antemano).
//
// Cota explícita: el número de árboles crece como el número de Catalán
// (~4^n / n^1.5) y el estado de la DP es uno por árbol por paso de la
// secuencia — para n > ~6 esto ya es intratable. Por eso el programa se
// prueba con n <= 4: es la misma razón combinatoria por la que la pregunta
// de optimalidad dinámica sigue abierta (no se conoce una forma barata de
// acercarse a OPT(S), ni de calcularlo).

#include <cassert>
#include <climits>
#include <functional>
#include <iostream>
#include <map>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct Node {
  int val;
  Node *left;
  Node *right;

  // Constructor explícito: valor del nodo e hijos izquierdo y derecho
  Node(int v, Node* l = nullptr, Node* r = nullptr) : val(v), left(l), right(r) {}
};
using NodeP = Node*;

// Todos los BST posibles sobre las llaves [lo, hi] (formas de Catalán).
static vector<NodeP> generateTrees(int lo, int hi) {
  if (lo > hi) return {nullptr};
  vector<NodeP> result;
  for (int root = lo; root <= hi; ++root) {
    auto lefts = generateTrees(lo, root - 1);
    auto rights = generateTrees(root + 1, hi);
    for (auto &l : lefts)
      for (auto &r : rights)
        result.push_back(new Node(root, l, r));
  }
  return result;
}

static string serialize(const NodeP &n) {
  if (!n) return "#";
  return to_string(n->val) + "(" + serialize(n->left) + "," +
         serialize(n->right) + ")";
}

static int depthOf(const NodeP &n, int key, int d = 1) {
  if (!n) return -1;
  if (n->val == key) return d;
  return key < n->val ? depthOf(n->left, key, d + 1)
                       : depthOf(n->right, key, d + 1);
}

// Aplica UNA rotación en el nodo de valor `parentVal` (right=true: el hijo
// izquierdo sube; right=false: el hijo derecho sube). Devuelve un árbol
// nuevo (path-copying sobre el camino a ese nodo; el resto se comparte).
static NodeP rotateAt(const NodeP &node, int parentVal, bool rotateRight) {
  if (!node) return node;
  if (node->val == parentVal) {
    if (rotateRight) {
      if (!node->left) return node;  // no hay hijo izquierdo: no aplica
      NodeP n = node->left;
      NodeP newP = new Node(node->val, n->right, node->right);
      return new Node(n->val, n->left, newP);
    } else {
      if (!node->right) return node;
      NodeP n = node->right;
      NodeP newP = new Node(node->val, node->left, n->left);
      return new Node(n->val, newP, n->right);
    }
  }
  if (parentVal < node->val) {
    NodeP newLeft = rotateAt(node->left, parentVal, rotateRight);
    if (newLeft == node->left) return node;
    return new Node(node->val, newLeft, node->right);
  }
  NodeP newRight = rotateAt(node->right, parentVal, rotateRight);
  if (newRight == node->right) return node;
  return new Node(node->val, node->left, newRight);
}

// Todos los vecinos a una rotación de distancia de `t` (por valor de nodo).
static void collectRotatable(const NodeP &n, vector<pair<int, bool>> &out) {
  if (!n) return;
  if (n->left) out.push_back({n->val, true});
  if (n->right) out.push_back({n->val, false});
  collectRotatable(n->left, out);
  collectRotatable(n->right, out);
}

int main() {
  const int n = 4;  // cota explícita: Catalán(4) = 14 árboles, ya tratable

  vector<NodeP> trees = generateTrees(1, n);
  map<string, int> indexOf;
  for (size_t i = 0; i < trees.size(); ++i) indexOf[serialize(trees[i])] = (int)i;

  const int T = (int)trees.size();
  assert(T == 14);  // número de Catalán C(4): verifica que la enumeración es exhaustiva
  cout << "Enumerados " << T << " BST distintos sobre " << n
       << " llaves (número de Catalán C(" << n << ") = 14). OK.\n";

  // Grafo de rotaciones: adjacency[i] = índices alcanzables con 1 rotación.
  vector<vector<int>> adjacency(T);
  for (int i = 0; i < T; ++i) {
    vector<pair<int, bool>> rotatable;
    collectRotatable(trees[i], rotatable);
    for (auto &[parentVal, right] : rotatable) {
      NodeP neighbor = rotateAt(trees[i], parentVal, right);
      int j = indexOf.at(serialize(neighbor));
      if (j != i) adjacency[i].push_back(j);
    }
  }

  // Distancia de rotación todo-contra-todo (BFS desde cada árbol).
  vector<vector<int>> dist(T, vector<int>(T, INT_MAX));
  for (int s = 0; s < T; ++s) {
    dist[s][s] = 0;
    queue<int> q;
    q.push(s);
    while (!q.empty()) {
      int u = q.front();
      q.pop();
      for (int v : adjacency[u]) {
        if (dist[s][v] == INT_MAX) {
          dist[s][v] = dist[s][u] + 1;
          q.push(v);
        }
      }
    }
  }
  cout << "Distancia de rotación todo-contra-todo calculada por BFS sobre "
       << T << " árboles. OK.\n";

  // OPT(S) exacto vía DP sobre el grafo de rotaciones (árbol inicial libre).
  auto optimalCost = [&](const vector<int> &S) {
    vector<int> dp(T, 0);  // dp[t] = costo mínimo terminando en árbol t
    for (int key : S) {
      vector<int> next(T, INT_MAX);
      for (int t = 0; t < T; ++t) {
        int d = depthOf(trees[t], key);
        for (int from = 0; from < T; ++from) {
          if (dp[from] == INT_MAX) continue;
          int cost = dp[from] + dist[from][t] + d;
          if (cost < next[t]) next[t] = cost;
        }
      }
      dp = next;
    }
    int best = INT_MAX;
    for (int v : dp) best = min(best, v);
    return best;
  };

  // Mejor BST estático: mismo árbol para toda la secuencia, sin rotar.
  auto bestStaticCost = [&](const vector<int> &S) {
    int best = INT_MAX;
    for (auto &t : trees) {
      int cost = 0;
      for (int key : S) cost += depthOf(t, key);
      best = min(best, cost);
    }
    return best;
  };

  // BST que rota: heurística move-to-root (no es el splay tree del curso;
  // sólo demuestra que "rotar" ya mejora sobre lo estático en este ejemplo).
  auto moveToRootCost = [&](const vector<int> &S) {
    NodeP cur = trees[0];
    int cost = 0;
    for (int key : S) {
      cost += depthOf(cur, key);
      while (cur->val != key) {
        // Encuentra el padre de `key` y rota `key` un nivel hacia arriba.
        function<int(const NodeP &)> findParentVal = [&](const NodeP &node) -> int {
          if (node->left && node->left->val == key) return node->val;
          if (node->right && node->right->val == key) return node->val;
          return key < node->val ? findParentVal(node->left) : findParentVal(node->right);
        };
        int parentVal = findParentVal(cur);
        bool keyIsLeftChild = key < parentVal;
        cur = rotateAt(cur, parentVal, keyIsLeftChild);
        cost += 1;  // cada rotación cuesta O(1), aquí contada como 1
      }
    }
    return cost;
  };

  // Secuencia de ejemplo: bloque de accesos a 1 seguido de un bloque de
  // accesos a 4 (como en examples.md, caso Normal). Un árbol estático tiene
  // que fijar de antemano cuál de las dos llaves queda más arriba y paga
  // el costo alto para la otra en todo su bloque; OPT(S) puede rotar una
  // vez en la frontera entre bloques y quedarse barato en ambos.
  vector<int> S = {1, 1, 1, 1, 4, 4, 4, 4};

  int opt = optimalCost(S);
  int stat = bestStaticCost(S);
  int rot = moveToRootCost(S);

  cout << "\nSecuencia S = (1,1,1,1,4,4,4,4) sobre llaves {1,2,3,4}:\n";
  cout << "  mejor BST estático (sin rotar):      costo = " << stat << "\n";
  cout << "  BST con move-to-root (sí rota):      costo = " << rot << "\n";
  cout << "  OPT(S) exacto (todo árbol/rotación):  costo = " << opt << "\n";

  // Lo que el material afirma como propiedad general: OPT(S) nunca es peor
  // que ninguna estrategia realizable dentro del mismo modelo de costo,
  // porque un árbol estático (o move-to-root) es un caso particular de las
  // estrategias sobre las que OPT(S) minimiza.
  assert(opt <= stat);
  cout << "Verificado: OPT(S) <= costo del mejor estático (" << opt
       << " <= " << stat << "). El estático es un caso particular de "
       << "estrategia sobre el que OPT también minimiza.\n";
  assert(opt <= rot);
  cout << "Verificado: OPT(S) <= costo de move-to-root (" << opt
       << " <= " << rot << "). Ninguna estrategia online concreta "
       << "puede superar al óptimo offline en el mismo modelo.\n";

  // Segunda secuencia: acceso repetido a la misma llave (examples.md,
  // Mínimo) — aquí no debería haber ninguna ventaja de rotar.
  vector<int> S2 = {2, 2, 2};
  int opt2 = optimalCost(S2);
  int stat2 = bestStaticCost(S2);
  assert(opt2 == stat2);
  cout << "\nSecuencia S = (2, 2, 2): OPT(S) = " << opt2
       << " = costo estático = " << stat2 << ". Verificado: cuando no "
       << "hay nada que explotar reestructurando, OPT no mejora sobre "
       << "el mejor estático.\n";

  cout << "\nEsto NO es un algoritmo de optimalidad dinámica: es fuerza "
       << "bruta acotada a n <= 4 para hacer tangible qué es OPT(S). "
       << "La pregunta del tema (existe un algoritmo ONLINE que se "
       << "acerque a este OPT sin fuerza bruta ni ver el futuro) sigue "
       << "abierta.\n";
  return 0;
}

