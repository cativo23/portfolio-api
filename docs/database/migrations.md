# Migraciones TypeORM

## Esquema base

El esquema inicial (`user`, `projects`, `api_keys`, `contacts`) lo crea **`Migration1767058079581`**. Las migraciones posteriores añaden columnas, índices y el hash de API keys.

## Si `migration:run` falla con “Table already exists”

Suele pasar cuando en el código había una migración con timestamp **anterior** a la que realmente creó las tablas en tu BD. Esa migración se eliminó del repo: el baseline efectivo es `1767058079581`.

Tras actualizar el código, solo debería quedar pendiente **`HashApiKeys1774000000000`** (columna `key` → `hashedKey`). Ejecuta:

```bash
yarn migration:run
```

con **`API_KEY_SECRET`** definido en el entorno (hashea las claves existentes antes del rename).

## Base de datos nueva (vacía)

`yarn migration:run` aplica en orden: `1767058079581` → `1767116639651` → `1768020875986` → `HashApiKeys1774000000000`.
